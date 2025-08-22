// ============================================================================
// SUBSCRIPTION API TYPES
// ============================================================================
// TypeScript типы для API эндпоинтов системы подписок
// ============================================================================

import type { 
  SubscriptionPlan, 
  Subscription, 
  UserLimits, 
  UserLimitsResult,
  UpgradeOption,
  PlanName,
  SubscriptionStatus,
  ActiveSubscription,
  SubscriptionHistory
} from './subscription';
import type { StripeCheckoutSession } from './stripe';

// ============================================================================
// 1. БАЗОВЫЕ API ТИПЫ
// ============================================================================

/** Стандартный ответ API */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Ошибка API */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/** Пагинация */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/** Результат с пагинацией */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// 2. SUBSCRIPTION PLANS API
// ============================================================================

/** GET /api/subscription/plans */
export interface GetPlansResponse extends ApiResponse<SubscriptionPlan[]> {}

/** GET /api/subscription/plans/:id */
export interface GetPlanResponse extends ApiResponse<SubscriptionPlan> {}

/** POST /api/subscription/plans (Admin only) */
export interface CreatePlanRequest {
  name: PlanName;
  display_name: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  factory_limit: number;
  rfq_limit?: number;
  features: string[];
  limitations?: string[];
  is_popular?: boolean;
}

export interface CreatePlanResponse extends ApiResponse<SubscriptionPlan> {}

/** PUT /api/subscription/plans/:id (Admin only) */
export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}
export interface UpdatePlanResponse extends ApiResponse<SubscriptionPlan> {}

// ============================================================================
// 3. SUBSCRIPTIONS API
// ============================================================================

/** GET /api/subscription/current */
export interface GetCurrentSubscriptionResponse extends ApiResponse<ActiveSubscription | null> {}

/** GET /api/subscription/history */
export interface GetSubscriptionHistoryResponse extends ApiResponse<PaginatedResponse<SubscriptionHistory>> {}

/** POST /api/subscription/create */
export interface CreateSubscriptionRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'annual';
  payment_method_id?: string;
  coupon_code?: string;
  trial_days?: number;
}

export interface CreateSubscriptionResponse extends ApiResponse<{
  subscription: Subscription;
  checkout_session?: StripeCheckoutSession;
  client_secret?: string;
  requires_action: boolean;
}> {}

/** POST /api/subscription/upgrade */
export interface UpgradeSubscriptionRequest {
  new_plan_id: string;
  billing_cycle?: 'monthly' | 'annual';
  prorate?: boolean;
}

export interface UpgradeSubscriptionResponse extends ApiResponse<{
  subscription: Subscription;
  invoice_url?: string;
}> {}

/** POST /api/subscription/cancel */
export interface CancelSubscriptionRequest {
  cancel_at_period_end?: boolean;
  reason?: string;
}

export interface CancelSubscriptionResponse extends ApiResponse<Subscription> {}

/** POST /api/subscription/resume */
export interface ResumeSubscriptionResponse extends ApiResponse<Subscription> {}

/** GET /api/subscription/upgrade-options */
export interface GetUpgradeOptionsResponse extends ApiResponse<UpgradeOption[]> {}

// ============================================================================
// 4. USER LIMITS API
// ============================================================================

/** GET /api/subscription/limits */
export interface GetUserLimitsResponse extends ApiResponse<UserLimitsResult> {}

/** POST /api/subscription/limits/factory */
export interface AccessFactoryRequest {
  factory_id: string;
}

export interface AccessFactoryResponse extends ApiResponse<{
  success: boolean;
  remaining_access: number;
}> {}

/** POST /api/subscription/limits/rfq */
export interface CreateRfqRequest {
  rfq_data: Record<string, any>;
}

export interface CreateRfqResponse extends ApiResponse<{
  success: boolean;
  remaining_rfq: number | null;
}> {}

/** GET /api/subscription/limits/check */
export interface CheckLimitsRequest {
  action: 'factory_access' | 'rfq_create';
  resource_id?: string;
}

export interface CheckLimitsResponse extends ApiResponse<{
  allowed: boolean;
  reason?: string;
  upgrade_required?: boolean;
  recommended_plan?: PlanName;
}> {}

// ============================================================================
// 5. BILLING API
// ============================================================================

/** GET /api/subscription/billing/invoices */
export interface GetInvoicesResponse extends ApiResponse<PaginatedResponse<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  invoice_url: string;
  pdf_url?: string;
}>> {}

/** GET /api/subscription/billing/payment-methods */
export interface GetPaymentMethodsResponse extends ApiResponse<Array<{
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}>> {}

/** POST /api/subscription/billing/payment-methods */
export interface AddPaymentMethodRequest {
  payment_method_id: string;
  set_as_default?: boolean;
}

export interface AddPaymentMethodResponse extends ApiResponse<{
  id: string;
  is_default: boolean;
}> {}

/** DELETE /api/subscription/billing/payment-methods/:id */
export interface RemovePaymentMethodResponse extends ApiResponse<{ success: boolean }> {}

/** POST /api/subscription/billing/update-payment-method */
export interface UpdatePaymentMethodRequest {
  payment_method_id: string;
}

export interface UpdatePaymentMethodResponse extends ApiResponse<Subscription> {}

// ============================================================================
// 6. CHECKOUT API
// ============================================================================

/** POST /api/subscription/checkout/create-session */
export interface CreateCheckoutSessionRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'annual';
  success_url: string;
  cancel_url: string;
  coupon_code?: string;
  trial_days?: number;
}

export interface CreateCheckoutSessionResponse extends ApiResponse<{
  session_id: string;
  url: string;
}> {}

/** GET /api/subscription/checkout/session/:id */
export interface GetCheckoutSessionResponse extends ApiResponse<{
  session_id: string;
  status: string;
  subscription_id?: string;
}> {}

// ============================================================================
// 7. ADMIN API
// ============================================================================

/** GET /api/admin/subscriptions */
export interface AdminGetSubscriptionsRequest extends PaginationParams {
  status?: SubscriptionStatus[];
  plan?: PlanName[];
  search?: string;
  created_after?: string;
  created_before?: string;
}

export interface AdminGetSubscriptionsResponse extends ApiResponse<PaginatedResponse<ActiveSubscription>> {}

/** GET /api/admin/subscription-stats */
export interface AdminGetStatsResponse extends ApiResponse<{
  total_subscriptions: number;
  active_subscriptions: number;
  monthly_revenue: number;
  annual_revenue: number;
  churn_rate: number;
  upgrade_rate: number;
  plan_distribution: Record<PlanName, number>;
  recent_activity: Array<{
    user_email: string;
    action: string;
    plan_name: string;
    created_at: string;
  }>;
}> {}

/** PUT /api/admin/subscriptions/:id */
export interface AdminUpdateSubscriptionRequest {
  status?: SubscriptionStatus;
  plan_id?: string;
  current_period_end?: string;
  notes?: string;
}

export interface AdminUpdateSubscriptionResponse extends ApiResponse<Subscription> {}

// ============================================================================
// 8. WEBHOOK API
// ============================================================================

/** POST /api/webhooks/stripe */
export interface StripeWebhookRequest {
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
}

export interface StripeWebhookResponse extends ApiResponse<{
  received: boolean;
  processed: boolean;
}> {}

// ============================================================================
// 9. ТИПЫ ДЛЯ REACT HOOKS
// ============================================================================

/** Состояние хука useSubscription */
export interface UseSubscriptionState {
  subscription: ActiveSubscription | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  daysRemaining: number | null;
  planName: PlanName | null;
}

/** Действия хука useSubscription */
export interface UseSubscriptionActions {
  refetch: () => Promise<void>;
  upgrade: (planId: string, billingCycle?: 'monthly' | 'annual') => Promise<void>;
  cancel: (cancelAtPeriodEnd?: boolean) => Promise<void>;
  resume: () => Promise<void>;
}

/** Результат хука useSubscription */
export interface UseSubscriptionResult extends UseSubscriptionState, UseSubscriptionActions {}

/** Состояние хука useUserLimits */
export interface UseUserLimitsState {
  limits: UserLimitsResult | null;
  loading: boolean;
  error: string | null;
}

/** Действия хука useUserLimits */
export interface UseUserLimitsActions {
  refetch: () => Promise<void>;
  accessFactory: (factoryId: string) => Promise<boolean>;
  createRfq: () => Promise<boolean>;
  checkLimit: (action: 'factory_access' | 'rfq_create', resourceId?: string) => Promise<boolean>;
}

/** Результат хука useUserLimits */
export interface UseUserLimitsResult extends UseUserLimitsState, UseUserLimitsActions {}

/** Состояние хука usePlans */
export interface UsePlansState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
}

/** Результат хука usePlans */
export interface UsePlansResult extends UsePlansState {
  refetch: () => Promise<void>;
}

// ============================================================================
// 10. ТИПЫ ДЛЯ КОНТЕКСТА
// ============================================================================

/** Контекст подписки */
export interface SubscriptionContextValue {
  // Состояние
  subscription: ActiveSubscription | null;
  limits: UserLimitsResult | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  
  // Вычисляемые значения
  isActive: boolean;
  currentPlan: SubscriptionPlan | null;
  canAccessFactory: (factoryId: string) => boolean;
  canCreateRfq: () => boolean;
  
  // Действия
  refetch: () => Promise<void>;
  upgrade: (planId: string, billingCycle?: 'monthly' | 'annual') => Promise<void>;
  cancel: (cancelAtPeriodEnd?: boolean) => Promise<void>;
  resume: () => Promise<void>;
  accessFactory: (factoryId: string) => Promise<boolean>;
  createRfq: () => Promise<boolean>;
}

// ============================================================================
// 11. ТИПЫ ДЛЯ УВЕДОМЛЕНИЙ
// ============================================================================

/** Уведомление о подписке */
export interface SubscriptionNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  duration?: number;
}

/** События подписки для уведомлений */
export type SubscriptionEventType = 
  | 'subscription_created'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'trial_ending'
  | 'limit_reached'
  | 'limit_exceeded';

// ============================================================================
// 12. ТИПЫ ДЛЯ ВАЛИДАЦИИ
// ============================================================================

/** Схема валидации создания подписки */
export interface CreateSubscriptionValidation {
  plan_id: {
    required: boolean;
    type: 'string';
  };
  billing_cycle: {
    required: boolean;
    enum: ['monthly', 'annual'];
  };
  payment_method_id: {
    required: boolean;
    type: 'string';
    minLength: 1;
  };
}

/** Ошибки валидации */
export interface ValidationErrors {
  [field: string]: string[];
}

// ============================================================================
// 13. ЭКСПОРТ УТИЛИТ
// ============================================================================

/** Проверка успешного ответа API */
export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};

/** Извлечение ошибки из ответа API */
export const getApiError = (response: ApiResponse): string => {
  return response.error || response.message || 'Произошла неизвестная ошибка';
};
