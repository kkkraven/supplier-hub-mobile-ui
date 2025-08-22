// ============================================================================
// BILLING SECTION COMPONENT
// ============================================================================
// Компонент для управления биллингом и способами оплаты
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Download, 
  Eye, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ БИЛЛИНГА
// ============================================================================

export const BillingSection: React.FC = () => {
  const { subscription, isActive } = useSubscriptionContext();
  
  return (
    <div className="space-y-6">
      {/* Текущая подписка и биллинг */}
      <CurrentBillingCard subscription={subscription} isActive={isActive} />
      
      {/* Способы оплаты */}
      <PaymentMethodsCard />
      
      {/* История платежей */}
      <BillingHistoryCard />
      
      {/* Настройки биллинга */}
      <BillingSettingsCard />
    </div>
  );
};

// ============================================================================
// 2. КАРТОЧКА ТЕКУЩЕГО БИЛЛИНГА
// ============================================================================

interface CurrentBillingCardProps {
  subscription: any;
  isActive: boolean;
}

const CurrentBillingCard: React.FC<CurrentBillingCardProps> = ({ 
  subscription, 
  isActive 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          Текущая подписка и биллинг
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription && isActive ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">План:</span>
                  <Badge variant="default">{subscription.plan_display_name}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Стоимость:</span>
                  <span className="font-semibold">
                    {Math.round(subscription.price_monthly / 100)}₽/мес
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Следующий платеж:</span>
                  <span className="font-medium">
                    {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('ru-RU')
                      : '—'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Статус:</span>
                  <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium mb-2">Итого в месяц</h4>
                  <div className="text-2xl font-bold text-slate-800">
                    {Math.round(subscription.price_monthly / 100)}₽
                  </div>
                  <div className="text-sm text-slate-500">
                    НДС не облагается
                  </div>
                </div>
                
                {subscription.cancel_at_period_end && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Подписка будет отменена {' '}
                      {subscription.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString('ru-RU')
                        : 'в конце периода'
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Скачать последний счет
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Изменить дату списания
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Управление в Stripe
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600 mb-2">
              Нет активной подписки
            </h3>
            <p className="text-slate-500 mb-4">
              Выберите план для начала использования сервиса
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Выбрать план
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. КАРТОЧКА СПОСОБОВ ОПЛАТЫ
// ============================================================================

const PaymentMethodsCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  // Моковые данные способов оплаты
  const paymentMethods = [
    {
      id: 'pm_1',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      },
      is_default: true
    },
    {
      id: 'pm_2',
      type: 'card',
      card: {
        brand: 'mastercard',
        last4: '5555',
        exp_month: 8,
        exp_year: 2024
      },
      is_default: false
    }
  ];

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    // Здесь будет логика добавления способа оплаты
    setTimeout(() => setLoading(false), 1000);
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (confirm('Удалить способ оплаты?')) {
      // Логика удаления
      console.log('Remove payment method:', id);
    }
  };

  const handleSetDefault = async (id: string) => {
    // Логика установки по умолчанию
    console.log('Set default payment method:', id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            Способы оплаты
          </CardTitle>
          <Button 
            onClick={handleAddPaymentMethod}
            disabled={loading}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить карту
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <div 
                key={method.id} 
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center text-xs font-medium">
                    {method.card.brand.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">
                      •••• •••• •••• {method.card.last4}
                    </div>
                    <div className="text-sm text-slate-500">
                      Истекает {method.card.exp_month}/{method.card.exp_year}
                    </div>
                  </div>
                  {method.is_default && (
                    <Badge variant="outline" className="text-xs">
                      По умолчанию
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Сделать основной
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600 mb-2">
              Нет сохраненных способов оплаты
            </h3>
            <p className="text-slate-500 mb-4">
              Добавьте карту для автоматической оплаты подписки
            </p>
            <Button onClick={handleAddPaymentMethod} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить карту
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 4. КАРТОЧКА ИСТОРИИ ПЛАТЕЖЕЙ
// ============================================================================

const BillingHistoryCard: React.FC = () => {
  // Моковые данные истории платежей
  const invoices = [
    {
      id: 'inv_1',
      date: '2024-01-15',
      amount: 80000, // в копейках
      status: 'paid',
      invoice_url: '#',
      plan_name: 'Professional'
    },
    {
      id: 'inv_2',
      date: '2023-12-15',
      amount: 80000,
      status: 'paid',
      invoice_url: '#',
      plan_name: 'Professional'
    },
    {
      id: 'inv_3',
      date: '2023-11-15',
      amount: 30000,
      status: 'paid',
      invoice_url: '#',
      plan_name: 'Starter'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Оплачен
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
            <Calendar className="h-3 w-3 mr-1" />
            Ожидает
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Не оплачен
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          История платежей
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map(invoice => (
              <div 
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(invoice.date).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-slate-500">
                      План {invoice.plan_name}
                    </div>
                  </div>
                  
                  <div className="font-semibold">
                    {Math.round(invoice.amount / 100)}₽
                  </div>
                  
                  {getStatusBadge(invoice.status)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600 mb-2">
              Нет истории платежей
            </h3>
            <p className="text-slate-500">
              История ваших платежей будет отображаться здесь
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 5. КАРТОЧКА НАСТРОЕК БИЛЛИНГА
// ============================================================================

const BillingSettingsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки биллинга</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Уведомления</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Email о предстоящих платежах</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Уведомления об успешных платежах</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Предупреждения о неудачных платежах</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Автоматическое продление</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Автоматически продлевать подписку</span>
              </label>
              
              <div className="text-xs text-slate-500 pl-6">
                Подписка будет автоматически продлена в конце периода
              </div>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                При отключении автопродления подписка будет отменена в конце текущего периода
              </AlertDescription>
            </Alert>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-end">
          <Button>
            Сохранить настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 6. ЭКСПОРТ
// ============================================================================

export default BillingSection;
