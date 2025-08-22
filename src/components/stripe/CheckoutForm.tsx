// ============================================================================
// STRIPE CHECKOUT FORM COMPONENT
// ============================================================================
// Форма оплаты с интеграцией Stripe Elements
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';

// ============================================================================
// 1. CHECKOUT FORM PROPS
// ============================================================================

interface CheckoutFormProps {
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
  submitButtonText?: string;
  showBillingAddress?: boolean;
  planName?: string;
  planPrice?: number;
  billingCycle?: 'monthly' | 'annual';
}

// ============================================================================
// 2. CHECKOUT FORM COMPONENT
// ============================================================================

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess,
  onError,
  submitButtonText = 'Оплатить подписку',
  showBillingAddress = true,
  planName,
  planPrice,
  billingCycle = 'monthly'
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // ============================================================================
  // 3. FORM SUBMISSION HANDLER
  // ============================================================================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Подтверждаем платеж
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message || 'Ошибка при отправке формы');
        setIsLoading(false);
        return;
      }

      // Подтверждаем платежный интент
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account?payment=success`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message || 'Ошибка при подтверждении платежа');
        onError?.(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsComplete(true);
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 4. PAYMENT ELEMENT CHANGE HANDLER
  // ============================================================================

  const handlePaymentElementChange = (event: any) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // ============================================================================
  // 5. SUCCESS STATE
  // ============================================================================

  if (isComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Платеж успешно завершен!
          </h3>
          <p className="text-green-600 mb-4">
            Ваша подписка активирована. Добро пожаловать!
          </p>
          <Button 
            onClick={() => window.location.href = '/account'}
            className="bg-green-600 hover:bg-green-700"
          >
            Перейти в аккаунт
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // 6. MAIN FORM
  // ============================================================================

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          Оплата подписки
        </CardTitle>
        {planName && (
          <div className="text-sm text-slate-600">
            План: <span className="font-semibold">{planName}</span>
            {planPrice && (
              <span className="ml-2">
                — {Math.round(planPrice / 100)}₽/{billingCycle === 'monthly' ? 'мес' : 'год'}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Element */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Платежная информация
            </label>
            <div className="border rounded-lg p-4 bg-white">
              <PaymentElement
                onChange={handlePaymentElementChange}
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card'],
                  fields: {
                    billingDetails: {
                      name: 'auto',
                      email: 'auto'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Billing Address */}
          {showBillingAddress && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Адрес плательщика
              </label>
              <div className="border rounded-lg p-4 bg-white">
                <AddressElement
                  options={{
                    mode: 'billing',
                    fields: {
                      phone: 'always'
                    },
                    validation: {
                      phone: {
                        required: 'never'
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 text-green-600" />
            <span>
              Ваши данные защищены 256-битным SSL шифрованием
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || !elements || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обработка платежа...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {submitButtonText}
              </>
            )}
          </Button>

          {/* Payment Methods Info */}
          <div className="text-center text-xs text-slate-500">
            Принимаем Visa, Mastercard, МИР
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 7. SUBSCRIPTION CHECKOUT WRAPPER
// ============================================================================

interface SubscriptionCheckoutProps {
  planId: string;
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'annual';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  planId,
  planName,
  planPrice,
  billingCycle,
  onSuccess,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: planId,
            billing_cycle: billingCycle
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create subscription');
        }

        // Если есть checkout_session URL, редиректим на Stripe Checkout
        if (data.data?.checkout_session?.url) {
          window.location.href = data.data.checkout_session.url;
          return;
        }

        // Иначе используем client_secret для Payment Element
        if (data.data?.client_secret) {
          setClientSecret(data.data.client_secret);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    createSubscription();
  }, [planId, billingCycle]);

  if (loading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Подготовка формы оплаты...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <div className="text-red-600 mb-4">Ошибка создания подписки</div>
          <div className="text-sm text-slate-600 mb-4">{error}</div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              Попробовать снова
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="ghost">
                Отмена
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CheckoutForm
      planName={planName}
      planPrice={planPrice}
      billingCycle={billingCycle}
      onSuccess={onSuccess}
      onError={(error) => setError(error)}
    />
  );
};

// ============================================================================
// 8. EXPORT
// ============================================================================

export default CheckoutForm;
