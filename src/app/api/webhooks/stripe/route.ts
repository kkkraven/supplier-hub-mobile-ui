// ============================================================================
// STRIPE WEBHOOKS API ROUTE
// ============================================================================
// Обработка webhook событий от Stripe
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { verifyStripeWebhook, mapStripeSubscriptionToApp } from '@/lib/stripe-server';
import type Stripe from 'stripe';

// ============================================================================
// 1. WEBHOOK CONFIGURATION
// ============================================================================

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
}

// ============================================================================
// 2. POST HANDLER - ОБРАБОТКА WEBHOOKS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Верифицируем webhook
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhook(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Обрабатываем событие
    const result = await handleWebhookEvent(event);
    
    return NextResponse.json({
      received: true,
      processed: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 3. WEBHOOK EVENT HANDLERS
// ============================================================================

async function handleWebhookEvent(event: Stripe.Event): Promise<{ success: boolean; message: string }> {
  const supabase = createRouteHandlerClient({ cookies });

  switch (event.type) {
    case 'checkout.session.completed':
      return await handleCheckoutSessionCompleted(event, supabase);

    case 'customer.subscription.created':
      return await handleSubscriptionCreated(event, supabase);

    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event, supabase);

    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event, supabase);

    case 'invoice.payment_succeeded':
      return await handlePaymentSucceeded(event, supabase);

    case 'invoice.payment_failed':
      return await handlePaymentFailed(event, supabase);

    case 'customer.subscription.trial_will_end':
      return await handleTrialWillEnd(event, supabase);

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { success: true, message: `Unhandled event type: ${event.type}` };
  }
}

// ============================================================================
// 4. CHECKOUT SESSION COMPLETED
// ============================================================================

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const session = event.data.object as Stripe.Checkout.Session;
  
  if (session.mode !== 'subscription') {
    return { success: true, message: 'Not a subscription checkout' };
  }

  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId) {
    console.error('Missing user_id or plan_id in checkout session metadata');
    return { success: false, message: 'Missing required metadata' };
  }

  try {
    // Создаем подписку в нашей БД
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: session.subscription as string,
      stripe_customer_id: session.customer as string,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData);

    if (error) {
      console.error('Error creating subscription in database:', error);
      return { success: false, message: 'Database error' };
    }

    // Логируем в истории
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        action: 'created',
        new_status: 'active',
        metadata: {
          stripe_session_id: session.id,
          stripe_subscription_id: session.subscription,
          checkout_completed_at: new Date().toISOString()
        }
      });

    return { success: true, message: 'Subscription created successfully' };

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 5. SUBSCRIPTION CREATED
// ============================================================================

async function handleSubscriptionCreated(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('Missing user_id in subscription metadata');
    return { success: false, message: 'Missing user_id' };
  }

  try {
    const mappedSubscription = mapStripeSubscriptionToApp(subscription);

    // Обновляем или создаем подписку
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        ...mappedSubscription,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) {
      console.error('Error upserting subscription:', error);
      return { success: false, message: 'Database error' };
    }

    return { success: true, message: 'Subscription created/updated successfully' };

  } catch (error) {
    console.error('Error handling subscription created:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 6. SUBSCRIPTION UPDATED
// ============================================================================

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    // Пытаемся найти пользователя по stripe_subscription_id
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSubscription) {
      console.error('Cannot find user for subscription:', subscription.id);
      return { success: false, message: 'User not found' };
    }
  }

  try {
    const mappedSubscription = mapStripeSubscriptionToApp(subscription);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        ...mappedSubscription,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
      return { success: false, message: 'Database error' };
    }

    // Логируем изменение
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId || existingSubscription?.user_id,
        action: 'updated',
        new_status: mappedSubscription.status,
        metadata: {
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        }
      });

    return { success: true, message: 'Subscription updated successfully' };

  } catch (error) {
    console.error('Error handling subscription updated:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 7. SUBSCRIPTION DELETED
// ============================================================================

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const subscription = event.data.object as Stripe.Subscription;

  try {
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSubscription) {
      return { success: true, message: 'Subscription not found in database' };
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, message: 'Database error' };
    }

    // Логируем отмену
    await supabase
      .from('subscription_history')
      .insert({
        user_id: existingSubscription.user_id,
        action: 'canceled',
        new_status: 'canceled',
        metadata: {
          stripe_subscription_id: subscription.id,
          canceled_at: new Date().toISOString()
        }
      });

    return { success: true, message: 'Subscription canceled successfully' };

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 8. PAYMENT SUCCEEDED
// ============================================================================

async function handlePaymentSucceeded(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const invoice = event.data.object as Stripe.Invoice;
  
  if (!invoice.subscription) {
    return { success: true, message: 'Not a subscription invoice' };
  }

  try {
    // Обновляем статус подписки на активный
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Error updating subscription after payment:', error);
      return { success: false, message: 'Database error' };
    }

    return { success: true, message: 'Payment processed successfully' };

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 9. PAYMENT FAILED
// ============================================================================

async function handlePaymentFailed(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const invoice = event.data.object as Stripe.Invoice;
  
  if (!invoice.subscription) {
    return { success: true, message: 'Not a subscription invoice' };
  }

  try {
    // Обновляем статус подписки
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Error updating subscription after failed payment:', error);
      return { success: false, message: 'Database error' };
    }

    return { success: true, message: 'Payment failure processed' };

  } catch (error) {
    console.error('Error handling payment failed:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 10. TRIAL WILL END
// ============================================================================

async function handleTrialWillEnd(
  event: Stripe.Event,
  supabase: any
): Promise<{ success: boolean; message: string }> {
  const subscription = event.data.object as Stripe.Subscription;

  try {
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSubscription) {
      return { success: true, message: 'Subscription not found' };
    }

    // Здесь можно добавить логику отправки уведомлений
    console.log(`Trial ending soon for user: ${existingSubscription.user_id}`);

    return { success: true, message: 'Trial end notification processed' };

  } catch (error) {
    console.error('Error handling trial will end:', error);
    return { success: false, message: 'Processing error' };
  }
}

// ============================================================================
// 11. EXPORT ROUTE HANDLERS
// ============================================================================

export { POST };
