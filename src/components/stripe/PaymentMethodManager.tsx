// ============================================================================
// PAYMENT METHOD MANAGER COMPONENT
// ============================================================================
// Управление способами оплаты пользователя
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { StripeProvider } from './StripeProvider';
import { SetupForm } from './SetupForm';

// ============================================================================
// 1. PAYMENT METHOD TYPES
// ============================================================================

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
  };
  billing_details: {
    name: string | null;
    email: string | null;
  };
  created: number;
  is_default?: boolean;
}

// ============================================================================
// 2. PAYMENT METHOD MANAGER COMPONENT
// ============================================================================

export const PaymentMethodManager: React.FC = () => {
  const { subscription, loading: subLoading } = useSubscriptionContext();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);

  // ============================================================================
  // 3. LOAD PAYMENT METHODS
  // ============================================================================

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/payment-methods');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load payment methods');
      }

      setPaymentMethods(data.payment_methods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subLoading && subscription) {
      loadPaymentMethods();
    }
  }, [subscription, subLoading]);

  // ============================================================================
  // 4. DELETE PAYMENT METHOD
  // ============================================================================

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот способ оплаты?')) {
      return;
    }

    try {
      setDeletingMethodId(paymentMethodId);
      setError(null);

      const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      // Обновляем список
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
    } finally {
      setDeletingMethodId(null);
    }
  };

  // ============================================================================
  // 5. SET DEFAULT PAYMENT METHOD
  // ============================================================================

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}/set-default`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set default payment method');
      }

      // Обновляем состояние
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        is_default: pm.id === paymentMethodId
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default payment method');
    }
  };

  // ============================================================================
  // 6. CARD BRAND ICON
  // ============================================================================

  const getCardBrandIcon = (brand: string) => {
    const brandColors: Record<string, string> = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600',
      diners: 'text-purple-600',
      jcb: 'text-blue-500',
      unionpay: 'text-red-500',
      mir: 'text-green-500'
    };

    return (
      <CreditCard 
        className={`h-5 w-5 ${brandColors[brand] || 'text-gray-600'}`} 
      />
    );
  };

  // ============================================================================
  // 7. LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Способы оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // 8. MAIN RENDER
  // ============================================================================

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Способы оплаты
            </CardTitle>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить карту
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет сохраненных карт
              </h3>
              <p className="text-gray-600 mb-4">
                Добавьте способ оплаты для автоматического продления подписки
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить карту
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onDelete={() => handleDeletePaymentMethod(method.id)}
                  onSetDefault={() => handleSetDefault(method.id)}
                  isDeleting={deletingMethodId === method.id}
                />
              ))}
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-4">
            <Shield className="h-4 w-4 text-green-600" />
            <span>
              Все платежные данные надежно защищены и хранятся в Stripe
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadPaymentMethods();
        }}
      />
    </>
  );
};

// ============================================================================
// 9. PAYMENT METHOD CARD COMPONENT
// ============================================================================

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onDelete,
  onSetDefault,
  isDeleting
}) => {
  const isExpired = new Date() > new Date(method.card.exp_year, method.card.exp_month - 1);
  const isExpiringSoon = !isExpired && 
    new Date() > new Date(method.card.exp_year, method.card.exp_month - 3);

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${
      method.is_default ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
    } ${isExpired ? 'opacity-75' : ''}`}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <CreditCard className={`h-5 w-5 ${
            method.card.brand === 'visa' ? 'text-blue-600' :
            method.card.brand === 'mastercard' ? 'text-red-600' :
            method.card.brand === 'mir' ? 'text-green-600' :
            'text-gray-600'
          }`} />
          {method.is_default && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {method.card.brand.toUpperCase()} •••• {method.card.last4}
            </span>
            {method.is_default && (
              <Badge variant="secondary" className="text-xs">
                По умолчанию
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Просрочена
              </Badge>
            )}
            {isExpiringSoon && (
              <Badge variant="outline" className="text-xs text-orange-600">
                Истекает скоро
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {String(method.card.exp_month).padStart(2, '0')}/{method.card.exp_year}
            </span>
            {method.billing_details.name && (
              <>
                <span className="mx-2">•</span>
                <span>{method.billing_details.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!method.is_default && !isExpired && (
          <Button
            onClick={onSetDefault}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Сделать основной
          </Button>
        )}
        
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {isDeleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// 10. ADD PAYMENT METHOD MODAL
// ============================================================================

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить способ оплаты</DialogTitle>
        </DialogHeader>
        
        <StripeProvider>
          <SetupForm
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </StripeProvider>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// 11. EXPORT
// ============================================================================

export default PaymentMethodManager;
