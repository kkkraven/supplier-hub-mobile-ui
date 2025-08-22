// ============================================================================
// STRIPE PROVIDER COMPONENT
// ============================================================================
// Провайдер для интеграции Stripe Elements
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '@/lib/stripe';

// ============================================================================
// 1. STRIPE PROVIDER PROPS
// ============================================================================

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
  customOptions?: Partial<StripeElementsOptions>;
}

// ============================================================================
// 2. STRIPE PROVIDER COMPONENT
// ============================================================================

export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  clientSecret,
  customOptions = {}
}) => {
  const [stripePromise] = useState(() => loadStripe(STRIPE_CONFIG.publishableKey));

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: STRIPE_CONFIG.appearance,
    locale: STRIPE_CONFIG.locale,
    ...customOptions
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

// ============================================================================
// 3. STRIPE ELEMENTS WRAPPER
// ============================================================================

interface StripeElementsWrapperProps {
  children: React.ReactNode;
  amount?: number;
  currency?: string;
  paymentMethodTypes?: string[];
}

export const StripeElementsWrapper: React.FC<StripeElementsWrapperProps> = ({
  children,
  amount,
  currency = 'rub',
  paymentMethodTypes = ['card']
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!amount) return;

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            payment_method_types: paymentMethodTypes
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.client_secret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, currency, paymentMethodTypes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Ошибка загрузки платежной формы</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Инициализация платежной формы...</div>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      {children}
    </StripeProvider>
  );
};

// ============================================================================
// 4. EXPORT DEFAULT
// ============================================================================

export default StripeProvider;
