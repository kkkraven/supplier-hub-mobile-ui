// ============================================================================
// TYPES INDEX
// ============================================================================
// Центральный экспорт всех TypeScript типов проекта
// ============================================================================

// ============================================================================
// 1. СУЩЕСТВУЮЩИЕ ТИПЫ
// ============================================================================

// Factory types
export * from './factory';

// ============================================================================
// 2. НОВЫЕ ТИПЫ СИСТЕМЫ ПОДПИСОК
// ============================================================================

// Основные типы подписок
export * from './subscription';

// Stripe интеграция
export * from './stripe';

// API типы
export * from './subscription-api';

// ============================================================================
// 3. ПЕРЕЭКСПОРТ ЧАСТО ИСПОЛЬЗУЕМЫХ ТИПОВ
// ============================================================================

// Основные типы подписок
export type {
  // Базовые типы
  SubscriptionStatus,
  PlanName,
  SubscriptionAction,
  
  // Интерфейсы таблиц
  SubscriptionPlan,
  Subscription,
  UserLimits,
  SubscriptionHistory,
  
  // Типы представлений
  ActiveSubscription,
  UserWithLimits,
  SubscriptionStats,
  
  // Результаты функций
  UserLimitsResult,
  UpgradeOption,
  
  // UI типы
  SubscriptionState,
  PlanCardProps,
  LimitsDisplayProps,
  PaywallGuardProps,
  
  // Константы
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_ICONS,
  SUBSCRIPTION_STATUS_LABELS,
  PLAN_COLORS
} from './subscription';

// Stripe типы
export type {
  // Базовые Stripe типы
  StripePaymentStatus,
  StripeWebhookEventType,
  StripeBillingInterval,
  
  // Основные объекты
  StripeCustomer,
  StripeProduct,
  StripePrice,
  StripeSubscription,
  StripePaymentMethod,
  StripeInvoice,
  
  // Webhook события
  StripeWebhookEvent,
  SubscriptionWebhookEvent,
  InvoiceWebhookEvent,
  
  // Checkout
  StripeCheckoutSession,
  CreateCheckoutSessionData,
  
  // Ошибки
  StripeError,
  StripeResult,
  
  // Конфигурация
  StripeConfig,
  StripeProductConfig
} from './stripe';

// API типы
export type {
  // Базовые API типы
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  
  // Subscription Plans API
  GetPlansResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  
  // Subscriptions API
  GetCurrentSubscriptionResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  UpgradeSubscriptionRequest,
  CancelSubscriptionRequest,
  
  // User Limits API
  GetUserLimitsResponse,
  AccessFactoryRequest,
  CreateRfqRequest,
  CheckLimitsRequest,
  
  // React Hooks
  UseSubscriptionResult,
  UseUserLimitsResult,
  UsePlansResult,
  
  // Context
  SubscriptionContextValue,
  
  // Уведомления
  SubscriptionNotification,
  SubscriptionEventType
} from './subscription-api';

// ============================================================================
// 4. УТИЛИТАРНЫЕ ТИПЫ
// ============================================================================

/** Общий тип для ID */
export type ID = string;

/** Тип для временных меток */
export type Timestamp = string;

/** Тип для цен в копейках */
export type PriceInCents = number;

/** Тип для процентов (0-100) */
export type Percentage = number;

// ============================================================================
// 5. ГЛОБАЛЬНЫЕ УТИЛИТАРНЫЕ ТИПЫ
// ============================================================================

/** Делает все свойства опциональными, кроме указанных */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/** Делает указанные свойства обязательными */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Исключает null и undefined */
export type NonNullable<T> = T extends null | undefined ? never : T;

/** Тип для обработчиков событий */
export type EventHandler<T = any> = (event: T) => void;

/** Тип для асинхронных обработчиков */
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

/** Тип для функций загрузки данных */
export type DataLoader<T, P = void> = P extends void 
  ? () => Promise<T>
  : (params: P) => Promise<T>;

// ============================================================================
// 6. КОНСТАНТЫ ТИПОВ
// ============================================================================

/** Поддерживаемые валюты */
export const SUPPORTED_CURRENCIES = ['rub', 'usd', 'eur'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

/** Поддерживаемые локали */
export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

/** Роли пользователей */
export const USER_ROLES = ['user', 'admin', 'moderator'] as const;
export type UserRole = typeof USER_ROLES[number];

// ============================================================================
// 7. ТИПЫ ДЛЯ КОМПОНЕНТОВ
// ============================================================================

/** Базовые пропсы компонента */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/** Пропсы для компонентов с загрузкой */
export interface LoadingComponentProps extends BaseComponentProps {
  loading?: boolean;
  error?: string | null;
}

/** Пропсы для модальных окон */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/** Пропсы для форм */
export interface FormProps<T = any> extends BaseComponentProps {
  onSubmit: (data: T) => void | Promise<void>;
  initialValues?: Partial<T>;
  loading?: boolean;
  error?: string | null;
}

// ============================================================================
// 8. ТИПЫ ДЛЯ СОСТОЯНИЯ ПРИЛОЖЕНИЯ
// ============================================================================

/** Общее состояние загрузки */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/** Состояние с данными */
export interface DataState<T> extends LoadingState {
  data: T | null;
}

/** Состояние списка с пагинацией */
export interface PaginatedState<T> extends LoadingState {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ============================================================================
// 9. ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================================================

// Основные типы для удобного импорта
export const SubscriptionTypes = {
  // Статусы
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  CANCELED: 'canceled' as const,
  PAST_DUE: 'past_due' as const,
  TRIALING: 'trialing' as const,
  
  // Планы
  STARTER: 'starter' as const,
  PROFESSIONAL: 'professional' as const,
  ENTERPRISE: 'enterprise' as const
};

export const StripeTypes = {
  // Статусы платежей
  SUCCEEDED: 'succeeded' as const,
  REQUIRES_ACTION: 'requires_action' as const,
  REQUIRES_CONFIRMATION: 'requires_confirmation' as const,
  
  // Интервалы
  MONTHLY: 'month' as const,
  YEARLY: 'year' as const
};
