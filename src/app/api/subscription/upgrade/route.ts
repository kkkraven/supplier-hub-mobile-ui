// ============================================================================
// SUBSCRIPTION UPGRADE API ROUTE
// ============================================================================
// API маршрут для апгрейда подписки
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  getStripeSubscription, 
  updateStripeSubscription 
} from '@/lib/stripe-server';
import { getStripePriceId } from '@/lib/stripe';
import type { UpgradeSubscriptionRequest } from '@/types/subscription-api';

// ============================================================================
// 1. POST HANDLER - АПГРЕЙД ПОДПИСКИ
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Парсим данные запроса
    const body: UpgradeSubscriptionRequest = await request.json();
    const { new_plan_id, billing_cycle = 'monthly', prorate = true } = body;

    if (!new_plan_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: new_plan_id' },
        { status: 400 }
      );
    }

    // Получаем текущую подписку пользователя
    const { data: currentSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans!inner(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscriptionError || !currentSubscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Получаем информацию о новом плане
    const { data: newPlan, error: newPlanError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', new_plan_id)
      .eq('is_active', true)
      .single();

    if (newPlanError || !newPlan) {
      return NextResponse.json(
        { success: false, error: 'Invalid new plan selected' },
        { status: 400 }
      );
    }

    // Проверяем, что это действительно апгрейд
    const planHierarchy = {
      'starter': 1,
      'professional': 2,
      'enterprise': 3
    };

    const currentPlanLevel = planHierarchy[currentSubscription.subscription_plans.name as keyof typeof planHierarchy];
    const newPlanLevel = planHierarchy[newPlan.name as keyof typeof planHierarchy];

    if (newPlanLevel <= currentPlanLevel) {
      return NextResponse.json(
        { success: false, error: 'New plan must be higher tier than current plan' },
        { status: 400 }
      );
    }

    // Получаем Stripe Price ID для нового плана
    let stripePriceId: string;
    try {
      stripePriceId = getStripePriceId(newPlan.name, billing_cycle);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan configuration' },
        { status: 500 }
      );
    }

    // Получаем подписку из Stripe
    const stripeSubscription = await getStripeSubscription(currentSubscription.stripe_subscription_id);
    
    if (!stripeSubscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found in Stripe' },
        { status: 404 }
      );
    }

    // Обновляем подписку в Stripe
    const updatedSubscription = await updateStripeSubscription(
      currentSubscription.stripe_subscription_id,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: stripePriceId
          }
        ],
        proration_behavior: prorate ? 'create_prorations' : 'none',
        metadata: {
          user_id: user.id,
          plan_id: new_plan_id,
          plan_name: newPlan.name,
          billing_cycle,
          upgraded_at: new Date().toISOString()
        }
      }
    );

    // Обновляем подписку в нашей БД
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_id: new_plan_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      // Не возвращаем ошибку, так как Stripe уже обновлен
    }

    // Логируем изменение в истории
    await supabase
      .from('subscription_history')
      .insert({
        user_id: user.id,
        subscription_id: currentSubscription.id,
        plan_id: new_plan_id,
        action: 'upgraded',
        old_status: currentSubscription.status,
        new_status: 'active',
        metadata: {
          old_plan: currentSubscription.subscription_plans.name,
          new_plan: newPlan.name,
          billing_cycle,
          stripe_subscription_id: currentSubscription.stripe_subscription_id
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          id: currentSubscription.id,
          plan_id: new_plan_id,
          status: 'active',
          updated_at: new Date().toISOString()
        },
        invoice_url: updatedSubscription.latest_invoice 
          ? `https://invoice.stripe.com/i/${updatedSubscription.latest_invoice}`
          : null
      }
    });

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 2. EXPORT ROUTE HANDLERS
// ============================================================================

export { POST };
