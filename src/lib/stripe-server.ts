// ============================================================================
// STRIPE SERVER-SIDE UTILITIES
// ============================================================================
// Серверные утилиты для работы со Stripe API
// ============================================================================

import Stripe from 'stripe';
import type { 
  StripeCustomer, 
  StripeSubscription, 
  CreateStripeCustomerData,
  CreateStripeSubscriptionData 
} from '@/types/stripe';

// ============================================================================
// 1. STRIPE SERVER INSTANCE
// ============================================================================

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  appInfo: {
    name: 'Supplier Hub',
    version: '1.0.0',
    url: 'https://supplier-hub.com'
  }
});

// ============================================================================
// 2. CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Создать клиента в Stripe
 */
export const createStripeCustomer = async (
  customerData: CreateStripeCustomerData
): Promise<StripeCustomer> => {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      description: customerData.description,
      metadata: customerData.metadata,
      preferred_locales: ['ru']
    });

    return customer as StripeCustomer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
};

/**
 * Получить клиента из Stripe
 */
export const getStripeCustomer = async (customerId: string): Promise<StripeCustomer | null> => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      return null;
    }

    return customer as StripeCustomer;
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    return null;
  }
};

/**
 * Обновить клиента в Stripe
 */
export const updateStripeCustomer = async (
  customerId: string,
  updateData: Partial<CreateStripeCustomerData>
): Promise<StripeCustomer> => {
  try {
    const customer = await stripe.customers.update(customerId, {
      email: updateData.email,
      name: updateData.name,
      description: updateData.description,
      metadata: updateData.metadata
    });

    return customer as StripeCustomer;
  } catch (error) {
    console.error('Error updating Stripe customer:', error);
    throw new Error('Failed to update customer');
  }
};

// ============================================================================
// 3. SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Создать подписку в Stripe
 */
export const createStripeSubscription = async (
  subscriptionData: CreateStripeSubscriptionData
): Promise<StripeSubscription> => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: subscriptionData.customer,
      items: subscriptionData.items,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: subscriptionData.trial_period_days,
      metadata: subscriptionData.metadata
    });

    return subscription as StripeSubscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw new Error('Failed to create subscription');
  }
};

/**
 * Получить подписку из Stripe
 */
export const getStripeSubscription = async (subscriptionId: string): Promise<StripeSubscription | null> => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'items.data.price']
    });

    return subscription as StripeSubscription;
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    return null;
  }
};

/**
 * Обновить подписку в Stripe
 */
export const updateStripeSubscription = async (
  subscriptionId: string,
  updateData: {
    items?: Array<{ id?: string; price?: string; quantity?: number }>;
    proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
    metadata?: Record<string, string>;
  }
): Promise<StripeSubscription> => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: updateData.items,
      proration_behavior: updateData.proration_behavior || 'create_prorations',
      metadata: updateData.metadata
    });

    return subscription as StripeSubscription;
  } catch (error) {
    console.error('Error updating Stripe subscription:', error);
    throw new Error('Failed to update subscription');
  }
};

/**
 * Отменить подписку в Stripe
 */
export const cancelStripeSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<StripeSubscription> => {
  try {
    if (cancelAtPeriodEnd) {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      return subscription as StripeSubscription;
    } else {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription as StripeSubscription;
    }
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

/**
 * Возобновить подписку в Stripe
 */
export const resumeStripeSubscription = async (subscriptionId: string): Promise<StripeSubscription> => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    return subscription as StripeSubscription;
  } catch (error) {
    console.error('Error resuming Stripe subscription:', error);
    throw new Error('Failed to resume subscription');
  }
};

// ============================================================================
// 4. CHECKOUT SESSION MANAGEMENT
// ============================================================================

/**
 * Создать Checkout сессию
 */
export const createCheckoutSession = async (params: {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      customer_email: params.customerEmail,
      line_items: [
        {
          price: params.priceId,
          quantity: 1
        }
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        trial_period_days: params.trialPeriodDays,
        metadata: params.metadata
      },
      metadata: params.metadata
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

/**
 * Получить Checkout сессию
 */
export const getCheckoutSession = async (sessionId: string): Promise<Stripe.Checkout.Session | null> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
};

// ============================================================================
// 5. INVOICE MANAGEMENT
// ============================================================================

/**
 * Получить счета клиента
 */
export const getCustomerInvoices = async (
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> => {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.subscription']
    });

    return invoices.data;
  } catch (error) {
    console.error('Error retrieving customer invoices:', error);
    return [];
  }
};

/**
 * Получить конкретный счет
 */
export const getInvoice = async (invoiceId: string): Promise<Stripe.Invoice | null> => {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return null;
  }
};

// ============================================================================
// 6. PAYMENT METHOD MANAGEMENT
// ============================================================================

/**
 * Получить способы оплаты клиента
 */
export const getCustomerPaymentMethods = async (
  customerId: string,
  type: 'card' = 'card'
): Promise<Stripe.PaymentMethod[]> => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    return [];
  }
};

/**
 * Удалить способ оплаты
 */
export const detachPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return true;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    return false;
  }
};

// ============================================================================
// 7. WEBHOOK UTILITIES
// ============================================================================

/**
 * Верифицировать webhook от Stripe
 */
export const verifyStripeWebhook = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
};

/**
 * Обработать webhook событие подписки
 */
export const handleSubscriptionWebhook = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription;
  
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', subscription.id);
      // Здесь будет логика обновления БД
      break;
      
    case 'customer.subscription.updated':
      console.log('Subscription updated:', subscription.id);
      // Здесь будет логика обновления БД
      break;
      
    case 'customer.subscription.deleted':
      console.log('Subscription deleted:', subscription.id);
      // Здесь будет логика обновления БД
      break;
      
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded for subscription:', subscription.id);
      // Здесь будет логика обновления БД
      break;
      
    case 'invoice.payment_failed':
      console.log('Payment failed for subscription:', subscription.id);
      // Здесь будет логика обновления БД
      break;
  }
};

// ============================================================================
// 8. UTILITY FUNCTIONS
// ============================================================================

/**
 * Преобразовать Stripe подписку в наш формат
 */
export const mapStripeSubscriptionToApp = (stripeSubscription: Stripe.Subscription) => {
  return {
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: stripeSubscription.customer as string,
    status: mapStripeStatusToApp(stripeSubscription.status),
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: stripeSubscription.canceled_at 
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString() 
      : null,
    trial_start: stripeSubscription.trial_start 
      ? new Date(stripeSubscription.trial_start * 1000).toISOString() 
      : null,
    trial_end: stripeSubscription.trial_end 
      ? new Date(stripeSubscription.trial_end * 1000).toISOString() 
      : null
  };
};

/**
 * Маппинг статусов Stripe в наши статусы
 */
const mapStripeStatusToApp = (stripeStatus: Stripe.Subscription.Status): string => {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    'incomplete': 'incomplete',
    'incomplete_expired': 'inactive',
    'trialing': 'trialing',
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'unpaid': 'past_due',
    'paused': 'inactive'
  };

  return statusMap[stripeStatus] || 'inactive';
};

// ============================================================================
// 9. EXPORT
// ============================================================================

export default stripe;
