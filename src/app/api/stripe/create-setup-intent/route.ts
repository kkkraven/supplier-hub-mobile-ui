// ============================================================================
// CREATE SETUP INTENT API ROUTE
// ============================================================================
// API для создания Setup Intent (добавление способа оплаты без платежа)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe, getStripeCustomer, createStripeCustomer } from '@/lib/stripe-server';

// ============================================================================
// 1. POST HANDLER - СОЗДАНИЕ SETUP INTENT
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

    // Создаем Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Для будущих платежей
      metadata: {
        user_id: user.id,
        purpose: 'save_payment_method'
      }
    });

    return NextResponse.json({
      success: true,
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id
    });

  } catch (error) {
    console.error('Error creating setup intent:', error);
    
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
