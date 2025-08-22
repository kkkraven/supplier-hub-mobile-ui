// ============================================================================
// PAYMENT METHODS API ROUTE
// ============================================================================
// API для получения способов оплаты пользователя
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getCustomerPaymentMethods } from '@/lib/stripe-server';

// ============================================================================
// 1. GET HANDLER - ПОЛУЧЕНИЕ СПОСОБОВ ОПЛАТЫ
// ============================================================================

export async function GET(request: NextRequest) {
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

    // Получаем Stripe Customer ID из БД
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({
        success: true,
        payment_methods: []
      });
    }

    // Получаем способы оплаты из Stripe
    const paymentMethods = await getCustomerPaymentMethods(userData.stripe_customer_id);

    // Получаем информацию о подписке для определения default payment method
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    let defaultPaymentMethodId: string | null = null;
    
    if (subscription?.stripe_subscription_id) {
      try {
        const { stripe } = await import('@/lib/stripe-server');
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
        defaultPaymentMethodId = stripeSubscription.default_payment_method as string;
      } catch (error) {
        console.error('Error getting subscription default payment method:', error);
      }
    }

    // Маппим способы оплаты с информацией о том, какой является основным
    const mappedPaymentMethods = paymentMethods.map(pm => ({
      ...pm,
      is_default: pm.id === defaultPaymentMethodId
    }));

    return NextResponse.json({
      success: true,
      payment_methods: mappedPaymentMethods
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    
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

export { GET };
