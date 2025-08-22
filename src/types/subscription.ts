// ============================================================================
// SUBSCRIPTION SYSTEM TYPES
// ============================================================================
// TypeScript типы для системы подписок Supplier Hub
// ============================================================================

// ============================================================================
// 1. БАЗОВЫЕ ТИПЫ
// ============================================================================

/** Статус подписки пользователя */
export type SubscriptionStatus = 
  | 'active'      // Активная подписка
  | 'inactive'    // Неактивная подписка
  | 'canceled'    // Отмененная подписка
  | 'past_due'    // Просроченная оплата
  | 'trialing'    // Пробный период
  | 'incomplete'; // Незавершенная подписка

/** Названия тарифных планов */
export type PlanName = 'starter' | 'professional' | 'enterprise';

/** Действия в истории подписок */
export type SubscriptionAction = 
  | 'created'     // Создана
  | 'activated'   // Активирована
  | 'canceled'    // Отменена
  | 'upgraded'    // Повышена
  | 'downgraded'  // Понижена
  | 'renewed'     // Продлена
  | 'expired';    // Истекла

// ============================================================================
// 2. ИНТЕРФЕЙСЫ ТАБЛИЦ БД
// ============================================================================

/** Тарифный план */
export interface SubscriptionPlan {
  id: string;
  name: PlanName;
  display_name: string;
  description: string | null;
  price_monthly: number; // в копейках
  price_annual: number;  // в копейках
  factory_limit: number;
  rfq_limit: number | null; // null = безлимит
  features: string[];
  limitations: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Подписка пользователя */
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

/** Лимиты пользователя */
export interface UserLimits {
  id: string;
  user_id: string;
  subscription_id: string | null;
  factories_accessed: number;
  factories_accessed_list: string[]; // массив UUID фабрик
  rfq_count_current_month: number;
  rfq_count_total: number;
  last_rfq_reset: string; // дата
  storage_used_mb: number;
  api_calls_current_month: number;
  created_at: string;
  updated_at: string;
}

/** История подписок */
export interface SubscriptionHistory {
  id: string;
  user_id: string;
  subscription_id: string | null;
  plan_id: string | null;
  action: SubscriptionAction;
  old_status: SubscriptionStatus | null;
  new_status: SubscriptionStatus | null;
  metadata: Record<string, any>;
  created_at: string;
}

// ============================================================================
// 3. ТИПЫ ПРЕДСТАВЛЕНИЙ (VIEWS)
// ============================================================================

/** Активная подписка с деталями плана */
export interface ActiveSubscription extends Subscription {
  // Данные плана
  plan_name: PlanName;
  plan_display_name: string;
  plan_description: string | null;
  price_monthly: number;
  price_annual: number;
  factory_limit: number;
  rfq_limit: number | null;
  features: string[];
  limitations: string[];
  is_popular: boolean;
  
  // Данные пользователя
  user_email: string;
  user_name: string | null;
  company_name: string | null;
  
  // Вычисляемые поля
  is_active: boolean;
  days_remaining: number | null;
  
  // Статистика использования
  factories_accessed: number;
  rfq_count_current_month: number;
  rfq_count_total: number;
  
  // Процент использования лимитов
  factory_usage_percent: number;
  rfq_usage_percent: number | null;
}

/** Пользователь с лимитами */
export interface UserWithLimits {
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: string;
  user_created_at: string;
  
  // Подписка
  subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  current_period_end: string | null;
  plan_name: PlanName | null;
  plan_display_name: string | null;
  
  // Лимиты
  factory_limit: number;
  factories_used: number;
  factories_remaining: number;
  rfq_limit: number | null;
  rfq_used_this_month: number;
  rfq_remaining_this_month: number | null;
  rfq_used_total: number;
  
  // Статус доступа
  has_active_subscription: boolean;
  can_access_more_factories: boolean;
  can_create_more_rfq: boolean;
}

/** Статистика тарифного плана */
export interface SubscriptionStats {
  plan_name: PlanName;
  display_name: string;
  price_monthly: number;
  factory_limit: number;
  rfq_limit: number | null;
  
  // Количество подписок
  total_subscriptions: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  past_due_subscriptions: number;
  
  // Средние показатели использования
  avg_factories_used: number;
  avg_rfq_used: number;
  
  // Процент превышения лимитов
  factory_limit_exceeded_percent: number;
  rfq_limit_exceeded_percent: number | null;
  
  // Доходы
  monthly_revenue_rub: number;
  annual_revenue_potential_rub: number;
}

// ============================================================================
// 4. ТИПЫ РЕЗУЛЬТАТОВ ФУНКЦИЙ БД
// ============================================================================

/** Результат проверки лимитов пользователя */
export interface UserLimitsResult {
  factories_limit: number;
  factories_used: number;
  factories_remaining: number;
  rfq_limit: number | null;
  rfq_used: number;
  rfq_remaining: number | null;
  plan_name: string | null;
  subscription_active: boolean;
}

/** Опция для апгрейда плана */
export interface UpgradeOption {
  plan_id: string;
  plan_name: PlanName;
  display_name: string;
  price_monthly: number;
  price_annual: number;
  factory_limit: number;
  rfq_limit: number | null;
  features: string[];
  is_upgrade: boolean;
  price_difference_monthly: number;
}

// ============================================================================
// 5. ТИПЫ ДЛЯ КОМПОНЕНТОВ UI
// ============================================================================

/** Пропсы для карточки тарифного плана */
export interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan?: PlanName;
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Состояние подписки для UI */
export interface SubscriptionState {
  subscription: ActiveSubscription | null;
  limits: UserLimitsResult | null;
  loading: boolean;
  error: string | null;
}

/** Пропсы для компонента лимитов */
export interface LimitsDisplayProps {
  limits: UserLimitsResult;
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
}

/** Пропсы для PaywallGuard */
export interface PaywallGuardProps {
  children: React.ReactNode;
  requiredPlan?: PlanName;
  requiredFeature?: string;
  fallback?: React.ReactNode;
  showUpgradeModal?: boolean;
  className?: string;
  variant?: 'card' | 'overlay' | 'banner' | 'modal';
  showPreview?: boolean;
  previewLines?: number;
  upgradeButtonText?: string;
  customMessage?: string;
  onUpgradeClick?: () => void;
}

// ============================================================================
// 6. ТИПЫ ДЛЯ STRIPE ИНТЕГРАЦИИ
// ============================================================================

/** Данные для создания подписки в Stripe */
export interface CreateSubscriptionData {
  plan_id: string;
  payment_method_id?: string;
  coupon_code?: string;
  billing_cycle: 'monthly' | 'annual';
}

/** Результат создания подписки */
export interface CreateSubscriptionResult {
  subscription: Subscription;
  client_secret?: string; // для подтверждения платежа
  requires_action: boolean;
}

/** Webhook данные от Stripe */
export interface StripeWebhookData {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      status: string;
      current_period_start: number;
      current_period_end: number;
      cancel_at_period_end: boolean;
      canceled_at?: number;
      trial_start?: number;
      trial_end?: number;
      metadata?: Record<string, string>;
    };
  };
}

// ============================================================================
// 7. ТИПЫ ДЛЯ ФОРМ И ВАЛИДАЦИИ
// ============================================================================

/** Данные формы выбора плана */
export interface PlanSelectionForm {
  plan_id: string;
  billing_cycle: 'monthly' | 'annual';
  payment_method_id: string;
  coupon_code?: string;
  agree_to_terms: boolean;
}

/** Ошибки валидации формы */
export interface PlanSelectionErrors {
  plan_id?: string;
  payment_method_id?: string;
  agree_to_terms?: string;
  general?: string;
}

// ============================================================================
// 8. ТИПЫ ДЛЯ АНАЛИТИКИ И ОТЧЕТОВ
// ============================================================================

/** Данные для графика использования */
export interface UsageChartData {
  date: string;
  factories_accessed: number;
  rfq_created: number;
  new_subscriptions: number;
  canceled_subscriptions: number;
}

/** Метрики подписок */
export interface SubscriptionMetrics {
  total_active_subscriptions: number;
  total_monthly_revenue: number;
  total_annual_revenue: number;
  average_factories_per_user: number;
  average_rfq_per_user: number;
  churn_rate: number;
  upgrade_rate: number;
  most_popular_plan: PlanName;
}

// ============================================================================
// 9. УТИЛИТАРНЫЕ ТИПЫ
// ============================================================================

/** Частичное обновление подписки */
export type SubscriptionUpdate = Partial<Pick<Subscription, 
  'status' | 'current_period_end' | 'cancel_at_period_end' | 'canceled_at'
>>;

/** Фильтры для списка подписок */
export interface SubscriptionFilters {
  status?: SubscriptionStatus[];
  plan?: PlanName[];
  created_after?: string;
  created_before?: string;
  expires_after?: string;
  expires_before?: string;
}

/** Опции сортировки */
export interface SubscriptionSortOptions {
  field: 'created_at' | 'updated_at' | 'current_period_end' | 'plan_name';
  direction: 'asc' | 'desc';
}

// ============================================================================
// 10. КОНСТАНТЫ И ЕНУМЫ
// ============================================================================

/** Цвета для статусов подписок */
export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: 'green',
  inactive: 'gray',
  canceled: 'red',
  past_due: 'orange',
  trialing: 'blue',
  incomplete: 'yellow'
} as const;

/** Иконки для статусов подписок */
export const SUBSCRIPTION_STATUS_ICONS: Record<SubscriptionStatus, string> = {
  active: '✅',
  inactive: '⏸️',
  canceled: '❌',
  past_due: '⚠️',
  trialing: '🆓',
  incomplete: '⏳'
} as const;

/** Лейблы для статусов */
export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Активная',
  inactive: 'Неактивная',
  canceled: 'Отменена',
  past_due: 'Просрочена',
  trialing: 'Пробный период',
  incomplete: 'Не завершена'
} as const;

/** Цвета для тарифных планов */
export const PLAN_COLORS: Record<PlanName, string> = {
  starter: 'blue',
  professional: 'purple',
  enterprise: 'gold'
} as const;

// ============================================================================
// 11. TYPE GUARDS
// ============================================================================

/** Проверка активной подписки */
export const isActiveSubscription = (subscription: Subscription | null): subscription is Subscription => {
  if (!subscription) return false;
  return subscription.status === 'active' && 
         (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());
};

/** Проверка истечения пробного периода */
export const isTrialExpired = (subscription: Subscription): boolean => {
  return subscription.status === 'trialing' && 
         subscription.trial_end !== null &&
         new Date(subscription.trial_end) < new Date();
};

/** Проверка возможности апгрейда */
export const canUpgradePlan = (currentPlan: PlanName, targetPlan: PlanName): boolean => {
  const planOrder: Record<PlanName, number> = {
    starter: 1,
    professional: 2,
    enterprise: 3
  };
  
  return planOrder[targetPlan] > planOrder[currentPlan];
};

/** Проверка достижения лимита */
export const isLimitReached = (used: number, limit: number | null): boolean => {
  return limit !== null && used >= limit;
};

// ============================================================================
// 12. ЭКСПОРТ ДЕФОЛТНЫХ ЗНАЧЕНИЙ
// ============================================================================

/** Дефолтные лимиты для нового пользователя */
export const DEFAULT_USER_LIMITS: Omit<UserLimits, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  subscription_id: null,
  factories_accessed: 0,
  factories_accessed_list: [],
  rfq_count_current_month: 0,
  rfq_count_total: 0,
  last_rfq_reset: new Date().toISOString().split('T')[0],
  storage_used_mb: 0,
  api_calls_current_month: 0
};

/** Дефолтное состояние подписки */
export const DEFAULT_SUBSCRIPTION_STATE: SubscriptionState = {
  subscription: null,
  limits: null,
  loading: false,
  error: null
};
