// ============================================================================
// STRIPE INTEGRATION TYPES
// ============================================================================
// TypeScript типы для интеграции со Stripe в системе подписок
// ============================================================================

import type { PlanName, SubscriptionStatus } from './subscription';

// ============================================================================
// 1. БАЗОВЫЕ ТИПЫ STRIPE
// ============================================================================

/** Статусы платежа в Stripe */
export type StripePaymentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

/** Типы событий Stripe webhook */
export type StripeWebhookEventType = 
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'payment_method.attached';

/** Интервалы подписки */
export type StripeBillingInterval = 'month' | 'year';

// ============================================================================
// 2. STRIPE CUSTOMER
// ============================================================================

/** Клиент в Stripe */
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  description?: string;
  metadata: {
    user_id: string;
    company_name?: string;
  };
  created: number;
  default_source?: string;
  invoice_prefix?: string;
  preferred_locales?: string[];
  tax_exempt: 'none' | 'exempt' | 'reverse';
}

/** Данные для создания клиента */
export interface CreateStripeCustomerData {
  email: string;
  name?: string;
  description?: string;
  metadata: {
    user_id: string;
    company_name?: string;
  };
  preferred_locales?: string[];
}

// ============================================================================
// 3. STRIPE PRODUCTS & PRICES
// ============================================================================

/** Продукт в Stripe */
export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata: {
    plan_name: PlanName;
    factory_limit: string;
    rfq_limit?: string;
  };
  created: number;
  updated: number;
}

/** Цена в Stripe */
export interface StripePrice {
  id: string;
  product: string;
  active: boolean;
  currency: string; // 'rub'
  unit_amount: number; // в копейках
  recurring: {
    interval: StripeBillingInterval;
    interval_count: number;
  } | null;
  metadata: {
    plan_name: PlanName;
    billing_cycle: 'monthly' | 'annual';
  };
  created: number;
}

/** Данные для создания цены */
export interface CreateStripePriceData {
  product: string;
  currency: 'rub';
  unit_amount: number;
  recurring: {
    interval: StripeBillingInterval;
    interval_count?: number;
  };
  metadata: {
    plan_name: PlanName;
    billing_cycle: 'monthly' | 'annual';
  };
}

// ============================================================================
// 4. STRIPE SUBSCRIPTIONS
// ============================================================================

/** Подписка в Stripe */
export interface StripeSubscription {
  id: string;
  customer: string;
  status: StripeSubscriptionStatus;
  items: {
    data: Array<{
      id: string;
      price: StripePrice;
      quantity: number;
    }>;
  };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
  trial_start?: number;
  trial_end?: number;
  latest_invoice?: string;
  default_payment_method?: string;
  metadata: {
    user_id: string;
    plan_name: PlanName;
  };
  created: number;
}

/** Статусы подписки в Stripe */
export type StripeSubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

/** Данные для создания подписки */
export interface CreateStripeSubscriptionData {
  customer: string;
  items: Array<{
    price: string;
    quantity?: number;
  }>;
  payment_behavior?: 'default_incomplete' | 'allow_incomplete' | 'error_if_incomplete';
  payment_settings?: {
    payment_method_types?: string[];
    save_default_payment_method?: 'on_subscription' | 'off';
  };
  expand?: string[];
  trial_period_days?: number;
  metadata: {
    user_id: string;
    plan_name: PlanName;
  };
}

// ============================================================================
// 5. STRIPE PAYMENT METHODS
// ============================================================================

/** Способ оплаты в Stripe */
export interface StripePaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    country?: string;
    exp_month: number;
    exp_year: number;
    last4: string;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  };
  billing_details: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
  created: number;
}

/** Данные для создания способа оплаты */
export interface CreatePaymentMethodData {
  type: 'card';
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name?: string;
    email?: string;
  };
}

// ============================================================================
// 6. STRIPE INVOICES
// ============================================================================

/** Счет в Stripe */
export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  status: StripeInvoiceStatus;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: number;
  due_date?: number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  payment_intent?: string;
  lines: {
    data: Array<{
      id: string;
      amount: number;
      currency: string;
      description?: string;
      period: {
        start: number;
        end: number;
      };
    }>;
  };
}

/** Статусы счета в Stripe */
export type StripeInvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void';

// ============================================================================
// 7. STRIPE WEBHOOK EVENTS
// ============================================================================

/** Базовая структура Stripe webhook события */
export interface StripeWebhookEvent {
  id: string;
  type: StripeWebhookEventType;
  api_version: string;
  created: number;
  data: {
    object: any;
    previous_attributes?: any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key?: string;
  };
}

/** Webhook событие подписки */
export interface SubscriptionWebhookEvent extends StripeWebhookEvent {
  type: 'customer.subscription.created' | 'customer.subscription.updated' | 'customer.subscription.deleted';
  data: {
    object: StripeSubscription;
    previous_attributes?: Partial<StripeSubscription>;
  };
}

/** Webhook событие платежа */
export interface InvoiceWebhookEvent extends StripeWebhookEvent {
  type: 'invoice.payment_succeeded' | 'invoice.payment_failed';
  data: {
    object: StripeInvoice;
    previous_attributes?: Partial<StripeInvoice>;
  };
}

// ============================================================================
// 8. STRIPE CHECKOUT
// ============================================================================

/** Сессия Stripe Checkout */
export interface StripeCheckoutSession {
  id: string;
  url: string;
  customer?: string;
  customer_email?: string;
  mode: 'payment' | 'setup' | 'subscription';
  success_url: string;
  cancel_url: string;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  subscription?: string;
  metadata?: Record<string, string>;
}

/** Данные для создания Checkout сессии */
export interface CreateCheckoutSessionData {
  mode: 'subscription';
  customer?: string;
  customer_email?: string;
  line_items: Array<{
    price: string;
    quantity: number;
  }>;
  success_url: string;
  cancel_url: string;
  allow_promotion_codes?: boolean;
  billing_address_collection?: 'auto' | 'required';
  metadata?: {
    user_id: string;
    plan_name: PlanName;
  };
  subscription_data?: {
    trial_period_days?: number;
    metadata?: Record<string, string>;
  };
}

// ============================================================================
// 9. STRIPE ERRORS
// ============================================================================

/** Ошибка Stripe API */
export interface StripeError {
  type: 'card_error' | 'invalid_request_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  code?: string;
  decline_code?: string;
  message: string;
  param?: string;
  payment_intent?: {
    id: string;
    status: StripePaymentStatus;
  };
}

/** Результат операции со Stripe */
export interface StripeResult<T = any> {
  success: boolean;
  data?: T;
  error?: StripeError;
}

// ============================================================================
// 10. МАППИНГ СТАТУСОВ
// ============================================================================

/** Маппинг статусов Stripe -> наши статусы */
export const STRIPE_TO_APP_STATUS_MAP: Record<StripeSubscriptionStatus, SubscriptionStatus> = {
  'incomplete': 'incomplete',
  'incomplete_expired': 'inactive',
  'trialing': 'trialing',
  'active': 'active',
  'past_due': 'past_due',
  'canceled': 'canceled',
  'unpaid': 'past_due',
  'paused': 'inactive'
} as const;

/** Обратный маппинг наши статусы -> Stripe */
export const APP_TO_STRIPE_STATUS_MAP: Record<SubscriptionStatus, StripeSubscriptionStatus> = {
  'active': 'active',
  'inactive': 'canceled',
  'canceled': 'canceled',
  'past_due': 'past_due',
  'trialing': 'trialing',
  'incomplete': 'incomplete'
} as const;

// ============================================================================
// 11. УТИЛИТАРНЫЕ ФУНКЦИИ ТИПОВ
// ============================================================================

/** Проверка успешного платежа */
export const isPaymentSucceeded = (status: StripePaymentStatus): boolean => {
  return status === 'succeeded';
};

/** Проверка активной подписки в Stripe */
export const isStripeSubscriptionActive = (status: StripeSubscriptionStatus): boolean => {
  return status === 'active' || status === 'trialing';
};

/** Проверка необходимости действий пользователя */
export const requiresUserAction = (status: StripePaymentStatus): boolean => {
  return status === 'requires_action' || status === 'requires_confirmation';
};

// ============================================================================
// 12. КОНФИГУРАЦИЯ STRIPE
// ============================================================================

/** Конфигурация Stripe */
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: 'rub';
  locale: 'ru';
  apiVersion: '2023-10-16';
}

/** Настройки для продуктов */
export interface StripeProductConfig {
  [key: string]: {
    productId: string;
    prices: {
      monthly: string;
      annual: string;
    };
  };
}

// ============================================================================
// 13. ЭКСПОРТ КОНСТАНТ
// ============================================================================

/** Коды ошибок карт */
export const CARD_ERROR_CODES = {
  CARD_DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  EXPIRED_CARD: 'expired_card',
  INCORRECT_CVC: 'incorrect_cvc',
  PROCESSING_ERROR: 'processing_error'
} as const;

/** Лейблы для брендов карт */
export const CARD_BRAND_LABELS: Record<string, string> = {
  'visa': 'Visa',
  'mastercard': 'Mastercard',
  'amex': 'American Express',
  'discover': 'Discover',
  'diners': 'Diners Club',
  'jcb': 'JCB',
  'unionpay': 'UnionPay',
  'unknown': 'Неизвестная карта'
} as const;
