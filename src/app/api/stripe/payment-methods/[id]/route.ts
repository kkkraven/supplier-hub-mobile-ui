// ============================================================================
// PAYMENT METHOD BY ID API ROUTE
// ============================================================================
// API для управления конкретным способом оплаты
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { detachPaymentMethod } from '@/lib/stripe-server';

// ============================================================================
// 1. DELETE HANDLER - УДАЛЕНИЕ СПОСОБА ОПЛАТЫ
// ============================================================================

export async function DELETE(
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

    // Проверяем, что способ оплаты принадлежит пользователю
    const { stripe } = await import('@/lib/stripe-server');
    
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

    // Проверяем, не является ли этот способ оплаты единственным для активной подписки
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscription?.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
        
        if (stripeSubscription.default_payment_method === paymentMethodId) {
          // Получаем все способы оплаты клиента
          const paymentMethods = await stripe.paymentMethods.list({
            customer: userData.stripe_customer_id,
            type: 'card'
          });

          if (paymentMethods.data.length <= 1) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Cannot delete the only payment method for an active subscription' 
              },
              { status: 400 }
            );
          }
        }
      } catch (error) {
        console.error('Error checking subscription payment method:', error);
      }
    }

    // Удаляем способ оплаты
    const success = await detachPaymentMethod(paymentMethodId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete payment method' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    
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

export { DELETE };
