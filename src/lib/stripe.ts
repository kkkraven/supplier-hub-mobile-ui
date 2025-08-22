// ============================================================================
// STRIPE CLIENT CONFIGURATION
// ============================================================================
// Конфигурация и инициализация Stripe клиента
// ============================================================================

import { loadStripe, Stripe } from '@stripe/stripe-js';

// ============================================================================
// 1. STRIPE CONFIGURATION
// ============================================================================

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. Please add it to your .env.local file.'
  );
}

// ============================================================================
// 2. STRIPE INSTANCE
// ============================================================================

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// ============================================================================
// 3. STRIPE CONFIGURATION CONSTANTS
// ============================================================================

export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  currency: 'rub',
  locale: 'ru' as const,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#8b5cf6', // purple-500
      colorBackground: '#ffffff',
      colorText: '#1e293b', // slate-800
      colorDanger: '#ef4444', // red-500
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    },
    rules: {
      '.Input': {
        border: '1px solid #e2e8f0', // slate-200
        borderRadius: '8px',
        fontSize: '14px',
        padding: '12px'
      },
      '.Input:focus': {
        border: '2px solid #8b5cf6', // purple-500
        outline: 'none'
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151' // gray-700
      }
    }
  }
};

// ============================================================================
// 4. PRICE IDS MAPPING
// ============================================================================

export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    annual: process.env.NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID || ''
  },
  professional: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || '',
    annual: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID || ''
  },
  enterprise: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
    annual: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || ''
  }
} as const;

// ============================================================================
// 5. UTILITY FUNCTIONS
// ============================================================================

/**
 * Получить Stripe Price ID по плану и циклу биллинга
 */
export const getStripePriceId = (
  planName: 'starter' | 'professional' | 'enterprise',
  billingCycle: 'monthly' | 'annual'
): string => {
  const priceId = STRIPE_PRICE_IDS[planName][billingCycle];
  
  if (!priceId) {
    throw new Error(`Stripe Price ID not found for plan: ${planName} (${billingCycle})`);
  }
  
  return priceId;
};

/**
 * Проверить валидность Stripe конфигурации
 */
export const validateStripeConfig = (): boolean => {
  try {
    // Проверяем наличие публичного ключа
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return false;
    }

    // Проверяем наличие Price IDs
    const plans = ['starter', 'professional', 'enterprise'] as const;
    const cycles = ['monthly', 'annual'] as const;
    
    for (const plan of plans) {
      for (const cycle of cycles) {
        const priceId = STRIPE_PRICE_IDS[plan][cycle];
        if (!priceId) {
          console.error(`Missing Stripe Price ID for ${plan} ${cycle}`);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Stripe configuration validation failed:', error);
    return false;
  }
};

// ============================================================================
// 6. STRIPE ERROR HANDLING
// ============================================================================

export interface StripeErrorDetails {
  type: string;
  code?: string;
  message: string;
  param?: string;
  decline_code?: string;
}

/**
 * Обработка ошибок Stripe
 */
export const handleStripeError = (error: any): StripeErrorDetails => {
  if (error?.type === 'StripeCardError') {
    return {
      type: 'card_error',
      code: error.code,
      message: getLocalizedErrorMessage(error.code) || error.message,
      decline_code: error.decline_code
    };
  }

  if (error?.type === 'StripeInvalidRequestError') {
    return {
      type: 'invalid_request',
      message: 'Неверный запрос. Пожалуйста, попробуйте еще раз.',
      param: error.param
    };
  }

  if (error?.type === 'StripeAPIError') {
    return {
      type: 'api_error',
      message: 'Ошибка сервера. Пожалуйста, попробуйте позже.'
    };
  }

  if (error?.type === 'StripeConnectionError') {
    return {
      type: 'connection_error',
      message: 'Ошибка соединения. Проверьте интернет-подключение.'
    };
  }

  return {
    type: 'unknown',
    message: error?.message || 'Произошла неизвестная ошибка'
  };
};

/**
 * Локализованные сообщения об ошибках
 */
const getLocalizedErrorMessage = (code?: string): string | null => {
  const errorMessages: Record<string, string> = {
    'card_declined': 'Карта отклонена. Попробуйте другую карту или обратитесь в банк.',
    'insufficient_funds': 'Недостаточно средств на карте.',
    'expired_card': 'Срок действия карты истек.',
    'incorrect_cvc': 'Неверный CVC код.',
    'incorrect_number': 'Неверный номер карты.',
    'invalid_expiry_month': 'Неверный месяц истечения срока действия.',
    'invalid_expiry_year': 'Неверный год истечения срока действия.',
    'processing_error': 'Ошибка обработки платежа. Попробуйте еще раз.',
    'authentication_required': 'Требуется подтверждение платежа.'
  };

  return code ? errorMessages[code] || null : null;
};

// ============================================================================
// 7. EXPORT DEFAULT
// ============================================================================

export default getStripe;
