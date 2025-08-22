// ============================================================================
// SET DEFAULT PAYMENT METHOD API ROUTE
// ============================================================================
// API для установки способа оплаты по умолчанию
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ============================================================================
// 1. POST HANDLER - УСТАНОВКА СПОСОБА ОПЛАТЫ ПО УМОЛЧАНИЮ
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const paymentMethodId = params.id;
    
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
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    const { stripe } = await import('@/lib/stripe-server');

    // Проверяем, что способ оплаты принадлежит пользователю
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      if (paymentMethod.customer !== userData.stripe_customer_id) {
        return NextResponse.json(
          { success: false, error: 'Payment method not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Устанавливаем способ оплаты по умолчанию для клиента
    await stripe.customers.update(userData.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Если у пользователя есть активная подписка, обновляем и её
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          default_payment_method: paymentMethodId
        });
      } catch (error) {
        console.error('Error updating subscription default payment method:', error);
        // Не возвращаем ошибку, так как основное действие выполнено
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated successfully'
    });

  } catch (error) {
    console.error('Error setting default payment method:', error);
    
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
