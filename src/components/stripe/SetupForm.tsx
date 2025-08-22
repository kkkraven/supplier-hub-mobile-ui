// ============================================================================
// STRIPE SETUP FORM COMPONENT
// ============================================================================
// Форма для добавления способа оплаты без немедленного платежа
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield } from 'lucide-react';

// ============================================================================
// 1. SETUP FORM PROPS
// ============================================================================

interface SetupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  showBillingAddress?: boolean;
}

// ============================================================================
// 2. SETUP FORM COMPONENT
// ============================================================================

export const SetupForm: React.FC<SetupFormProps> = ({
  onSuccess,
  onCancel,
  onError,
  showBillingAddress = true
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  // ============================================================================
  // 3. INITIALIZE SETUP INTENT
  // ============================================================================

  React.useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create setup intent');
        }

        setClientSecret(data.client_secret);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    if (stripe && !clientSecret) {
      createSetupIntent();
    }
  }, [stripe, clientSecret, onError]);

  // ============================================================================
  // 4. FORM SUBMISSION HANDLER
  // ============================================================================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Подтверждаем setup intent
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/account?setup=success`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message || 'Ошибка при добавлении карты');
        onError?.(confirmError.message || 'Setup failed');
      } else if (setupIntent && setupIntent.status === 'succeeded') {
        onSuccess?.();
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
  // 5. PAYMENT ELEMENT CHANGE HANDLER
  // ============================================================================

  const handlePaymentElementChange = (event: any) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // ============================================================================
  // 6. LOADING STATE
  // ============================================================================

  if (!clientSecret) {
    return (
      <div className="text-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-600">Инициализация формы...</p>
      </div>
    );
  }

  // ============================================================================
  // 7. MAIN FORM
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Данные карты
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
          Данные карты будут сохранены безопасно. Списания не произойдет.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Сохранить карту
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Отмена
          </Button>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-center text-slate-500">
        Карта будет использоваться для автоматического продления подписки
      </p>
    </form>
  );
};

// ============================================================================
// 8. EXPORT
// ============================================================================

export default SetupForm;
