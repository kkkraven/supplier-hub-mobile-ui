// ============================================================================
// SUBSCRIPTION CREATE API ROUTE
// ============================================================================
// API маршрут для создания подписки через Stripe
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  createStripeCustomer, 
  createCheckoutSession,
  getStripeCustomer 
} from '@/lib/stripe-server';
import { getStripePriceId } from '@/lib/stripe';
import type { CreateSubscriptionRequest } from '@/types/subscription-api';

// ============================================================================
// 1. POST HANDLER - СОЗДАНИЕ ПОДПИСКИ
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
    const body: CreateSubscriptionRequest = await request.json();
    const { plan_id, billing_cycle, trial_days, coupon_code } = body;

    if (!plan_id || !billing_cycle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: plan_id, billing_cycle' },
        { status: 400 }
      );
    }

    // Получаем информацию о плане из БД
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Получаем Stripe Price ID
    let stripePriceId: string;
    try {
      stripePriceId = getStripePriceId(plan.name, billing_cycle);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan configuration' },
        { status: 500 }
      );
    }

    // Получаем или создаем Stripe клиента
    let stripeCustomerId: string;
    
    // Проверяем, есть ли уже клиент в БД
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (existingUser?.stripe_customer_id) {
      // Проверяем, существует ли клиент в Stripe
      const stripeCustomer = await getStripeCustomer(existingUser.stripe_customer_id);
      if (stripeCustomer) {
        stripeCustomerId = existingUser.stripe_customer_id;
      } else {
        // Клиент не найден в Stripe, создаем нового
        const newCustomer = await createStripeCustomer({
          email: user.email!,
          name: user.user_metadata?.full_name,
          metadata: {
            user_id: user.id,
            company_name: user.user_metadata?.company_name || ''
          }
        });
        stripeCustomerId = newCustomer.id;

        // Обновляем БД
        await supabase
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', user.id);
      }
    } else {
      // Создаем нового клиента в Stripe
      const newCustomer = await createStripeCustomer({
        email: user.email!,
        name: user.user_metadata?.full_name,
        metadata: {
          user_id: user.id,
          company_name: user.user_metadata?.company_name || ''
        }
      });
      stripeCustomerId = newCustomer.id;

      // Обновляем БД
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Создаем Checkout сессию
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;
    const successUrl = `${baseUrl}/account?session_id={CHECKOUT_SESSION_ID}&success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    const checkoutSession = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId: stripePriceId,
      successUrl,
      cancelUrl,
      trialPeriodDays: trial_days,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
        plan_name: plan.name,
        billing_cycle
      }
    });

    // Возвращаем URL для редиректа на Checkout
    return NextResponse.json({
      success: true,
      data: {
        checkout_session: {
          id: checkoutSession.id,
          url: checkoutSession.url
        },
        requires_action: false
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    
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
