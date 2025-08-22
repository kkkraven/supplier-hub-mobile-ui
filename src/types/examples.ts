// ============================================================================
// SUBSCRIPTION TYPES USAGE EXAMPLES
// ============================================================================
// Примеры использования TypeScript типов системы подписок
// ============================================================================

import type {
  SubscriptionPlan,
  Subscription,
  UserLimitsResult,
  ActiveSubscription,
  PlanName,
  SubscriptionStatus,
  UseSubscriptionResult,
  UseUserLimitsResult,
  CreateSubscriptionRequest,
  ApiResponse,
  StripeCustomer,
  StripeWebhookEvent
} from './index';

// ============================================================================
// 1. ПРИМЕРЫ РАБОТЫ С ТАРИФНЫМИ ПЛАНАМИ
// ============================================================================

// Создание тарифного плана
const examplePlan: SubscriptionPlan = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'professional',
  display_name: 'Professional',
  description: 'Для растущих компаний',
  price_monthly: 80000, // 800 рублей в копейках
  price_annual: 800000,  // 8000 рублей в копейках
  factory_limit: 70,
  rfq_limit: null, // безлимит
  features: [
    'Доступ ко всем 70+ фабрикам',
    'Неограниченные RFQ запросы',
    'Приоритетная техподдержка'
  ],
  limitations: [],
  is_popular: true,
  is_active: true,
  sort_order: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

// Проверка типа плана
const checkPlanType = (planName: string): planName is PlanName => {
  return ['starter', 'professional', 'enterprise'].includes(planName);
};

// Получение цены плана в рублях
const getPlanPriceInRubles = (plan: SubscriptionPlan, billing: 'monthly' | 'annual'): number => {
  return billing === 'monthly' ? plan.price_monthly / 100 : plan.price_annual / 100;
};

// ============================================================================
// 2. ПРИМЕРЫ РАБОТЫ С ПОДПИСКАМИ
// ============================================================================

// Создание подписки
const exampleSubscription: Subscription = {
  id: '456e7890-e89b-12d3-a456-426614174001',
  user_id: '789e1234-e89b-12d3-a456-426614174002',
  plan_id: examplePlan.id,
  stripe_subscription_id: 'sub_1234567890',
  stripe_customer_id: 'cus_1234567890',
  status: 'active',
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  cancel_at_period_end: false,
  canceled_at: null,
  trial_start: null,
  trial_end: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

// Проверка активной подписки
const isSubscriptionActive = (subscription: Subscription): boolean => {
  return subscription.status === 'active' && 
         (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());
};

// Получение дней до истечения
const getDaysUntilExpiry = (subscription: Subscription): number | null => {
  if (!subscription.current_period_end) return null;
  
  const now = new Date();
  const endDate = new Date(subscription.current_period_end);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// ============================================================================
// 3. ПРИМЕРЫ РАБОТЫ С ЛИМИТАМИ
// ============================================================================

// Результат проверки лимитов
const exampleLimits: UserLimitsResult = {
  factories_limit: 70,
  factories_used: 15,
  factories_remaining: 55,
  rfq_limit: null, // безлимит
  rfq_used: 8,
  rfq_remaining: null,
  plan_name: 'Professional',
  subscription_active: true
};

// Проверка возможности доступа к фабрике
const canAccessFactory = (limits: UserLimitsResult): boolean => {
  return limits.subscription_active && limits.factories_remaining > 0;
};

// Проверка возможности создания RFQ
const canCreateRfq = (limits: UserLimitsResult): boolean => {
  return limits.subscription_active && 
         (limits.rfq_limit === null || (limits.rfq_remaining !== null && limits.rfq_remaining > 0));
};

// Получение процента использования фабрик
const getFactoryUsagePercent = (limits: UserLimitsResult): number => {
  if (limits.factories_limit === 0) return 0;
  return Math.round((limits.factories_used / limits.factories_limit) * 100);
};

// ============================================================================
// 4. ПРИМЕРЫ РАБОТЫ С API
// ============================================================================

// Типизированный запрос создания подписки
const createSubscriptionRequest: CreateSubscriptionRequest = {
  plan_id: examplePlan.id,
  billing_cycle: 'monthly',
  payment_method_id: 'pm_1234567890',
  coupon_code: 'WELCOME2024',
  trial_days: 14
};

// Обработка ответа API
const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'API request failed');
  }
  return response.data;
};

// Типизированная функция API запроса
const fetchUserSubscription = async (userId: string): Promise<ActiveSubscription | null> => {
  try {
    const response = await fetch(`/api/subscription/current?user_id=${userId}`);
    const data: ApiResponse<ActiveSubscription | null> = await response.json();
    
    return handleApiResponse(data);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
};

// ============================================================================
// 5. ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ В REACT КОМПОНЕНТАХ
// ============================================================================

// Типизированный хук подписки
const useSubscriptionExample = (): UseSubscriptionResult => {
  // Реальная реализация будет в отдельном файле
  return {
    subscription: null,
    loading: false,
    error: null,
    isActive: false,
    daysRemaining: null,
    planName: null,
    refetch: async () => {},
    upgrade: async (planId: string) => {},
    cancel: async () => {},
    resume: async () => {}
  };
};

// Пример компонента с типизацией
interface SubscriptionCardProps {
  subscription: ActiveSubscription;
  onUpgrade: (planId: string) => void;
  onCancel: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onUpgrade, 
  onCancel 
}) => {
  const isActive = subscription.is_active;
  const daysRemaining = subscription.days_remaining;
  
  return (
    <div className="subscription-card">
      <h3>{subscription.plan_display_name}</h3>
      <p>Статус: {isActive ? 'Активна' : 'Неактивна'}</p>
      {daysRemaining && (
        <p>Осталось дней: {daysRemaining}</p>
      )}
      <button onClick={() => onUpgrade('new-plan-id')}>
        Улучшить план
      </button>
      <button onClick={onCancel}>
        Отменить подписку
      </button>
    </div>
  );
};

// ============================================================================
// 6. ПРИМЕРЫ РАБОТЫ СО STRIPE
// ============================================================================

// Создание Stripe клиента
const createStripeCustomer = async (userEmail: string, userId: string): Promise<StripeCustomer> => {
  const customerData = {
    email: userEmail,
    metadata: {
      user_id: userId,
      company_name: 'Example Company'
    }
  };
  
  // Здесь был бы реальный вызов Stripe API
  return {
    id: 'cus_example123',
    email: userEmail,
    metadata: customerData.metadata,
    created: Date.now() / 1000,
    tax_exempt: 'none'
  };
};

// Обработка Stripe webhook
const handleStripeWebhook = (event: StripeWebhookEvent): void => {
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Подписка создана:', event.data.object);
      break;
    case 'customer.subscription.updated':
      console.log('Подписка обновлена:', event.data.object);
      break;
    case 'invoice.payment_succeeded':
      console.log('Платеж успешен:', event.data.object);
      break;
    default:
      console.log('Неизвестное событие:', event.type);
  }
};

// ============================================================================
// 7. ПРИМЕРЫ ВАЛИДАЦИИ И ПРОВЕРОК
// ============================================================================

// Валидация статуса подписки
const validateSubscriptionStatus = (status: string): status is SubscriptionStatus => {
  const validStatuses: SubscriptionStatus[] = [
    'active', 'inactive', 'canceled', 'past_due', 'trialing', 'incomplete'
  ];
  return validStatuses.includes(status as SubscriptionStatus);
};

// Проверка возможности апгрейда
const canUpgradeToPlan = (currentPlan: PlanName, targetPlan: PlanName): boolean => {
  const planHierarchy: Record<PlanName, number> = {
    starter: 1,
    professional: 2,
    enterprise: 3
  };
  
  return planHierarchy[targetPlan] > planHierarchy[currentPlan];
};

// Расчет стоимости апгрейда
const calculateUpgradeCost = (
  currentPlan: SubscriptionPlan, 
  newPlan: SubscriptionPlan, 
  billingCycle: 'monthly' | 'annual'
): number => {
  const currentPrice = billingCycle === 'monthly' 
    ? currentPlan.price_monthly 
    : currentPlan.price_annual;
    
  const newPrice = billingCycle === 'monthly' 
    ? newPlan.price_monthly 
    : newPlan.price_annual;
    
  return Math.max(0, newPrice - currentPrice);
};

// ============================================================================
// 8. ПРИМЕРЫ РАБОТЫ С ФОРМАМИ
// ============================================================================

// Состояние формы выбора плана
interface PlanSelectionFormState {
  selectedPlanId: string;
  billingCycle: 'monthly' | 'annual';
  paymentMethodId: string;
  couponCode: string;
  agreeToTerms: boolean;
  errors: Record<string, string>;
}

// Валидация формы
const validatePlanSelectionForm = (formData: Partial<PlanSelectionFormState>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formData.selectedPlanId) {
    errors.selectedPlanId = 'Выберите тарифный план';
  }
  
  if (!formData.paymentMethodId) {
    errors.paymentMethodId = 'Добавьте способ оплаты';
  }
  
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = 'Необходимо согласиться с условиями';
  }
  
  return errors;
};

// ============================================================================
// 9. ПРИМЕРЫ УТИЛИТАРНЫХ ФУНКЦИЙ
// ============================================================================

// Форматирование цены
const formatPrice = (priceInCents: number, currency: 'rub' | 'usd' = 'rub'): string => {
  const price = priceInCents / 100;
  const symbol = currency === 'rub' ? '₽' : '$';
  return `${price.toLocaleString('ru-RU')} ${symbol}`;
};

// Форматирование даты
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Получение цвета статуса
const getStatusColor = (status: SubscriptionStatus): string => {
  const colors: Record<SubscriptionStatus, string> = {
    active: 'green',
    inactive: 'gray',
    canceled: 'red',
    past_due: 'orange',
    trialing: 'blue',
    incomplete: 'yellow'
  };
  
  return colors[status];
};

// ============================================================================
// 10. ЭКСПОРТ ПРИМЕРОВ
// ============================================================================

export {
  // Данные
  examplePlan,
  exampleSubscription,
  exampleLimits,
  
  // Функции проверки
  isSubscriptionActive,
  canAccessFactory,
  canCreateRfq,
  canUpgradeToPlan,
  
  // Утилиты
  formatPrice,
  formatDate,
  getStatusColor,
  calculateUpgradeCost,
  
  // Валидация
  validateSubscriptionStatus,
  validatePlanSelectionForm,
  
  // API
  handleApiResponse,
  fetchUserSubscription,
  
  // Stripe
  handleStripeWebhook,
  
  // React
  SubscriptionCard
};
