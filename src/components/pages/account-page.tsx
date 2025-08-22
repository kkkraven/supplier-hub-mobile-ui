// ============================================================================
// ACCOUNT PAGE COMPONENT
// ============================================================================
// Главная страница управления аккаунтом и подпиской
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Crown, 
  CreditCard, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building2,
  Mail,
  Phone
} from 'lucide-react';

// Импорт компонентов
import { LimitsDisplay } from '@/components/subscription/LimitsDisplay';
import { SubscriptionOverview } from '@/components/account/SubscriptionOverview';
import { BillingSection } from '@/components/account/BillingSection';
import { UsageAnalytics } from '@/components/account/UsageAnalytics';
import { AccountSettings } from '@/components/account/AccountSettings';
import { PlanUpgradeSection } from '@/components/account/PlanUpgradeSection';

// ============================================================================
// 1. ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ АККАУНТА
// ============================================================================

export const AccountPageComponent: React.FC = () => {
  const { user } = useAuth();
  const { subscription, limits, loading, error, isActive } = useSubscriptionContext();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Пожалуйста, войдите в систему для доступа к странице аккаунта.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Мой аккаунт</h1>
              <p className="text-slate-600 mt-2">
                Управление подпиской, лимитами и настройками
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isActive ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Активная подписка
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Нет подписки
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Профиль пользователя */}
        <UserProfileCard user={user} />

        {/* Основной контент */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Обзор</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Подписка</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Биллинг</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Аналитика</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Настройки</span>
              </TabsTrigger>
            </TabsList>

            {/* Вкладка "Обзор" */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <SubscriptionOverview />
                  <PlanUpgradeSection />
                </div>
                <div className="space-y-6">
                  <LimitsDisplay />
                </div>
              </div>
            </TabsContent>

            {/* Вкладка "Подписка" */}
            <TabsContent value="subscription" className="space-y-6">
              <SubscriptionManagement />
            </TabsContent>

            {/* Вкладка "Биллинг" */}
            <TabsContent value="billing" className="space-y-6">
              <BillingSection />
            </TabsContent>

            {/* Вкладка "Аналитика" */}
            <TabsContent value="analytics" className="space-y-6">
              <UsageAnalytics />
            </TabsContent>

            {/* Вкладка "Настройки" */}
            <TabsContent value="settings" className="space-y-6">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. КАРТОЧКА ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

interface UserProfileCardProps {
  user: any;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Аватар */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          
          {/* Информация о пользователе */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-800">
              {user.full_name || 'Пользователь'}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.company_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{user.company_name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                С {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </Badge>
            </div>
          </div>
          
          {/* Действия */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. УПРАВЛЕНИЕ ПОДПИСКОЙ
// ============================================================================

const SubscriptionManagement: React.FC = () => {
  const { subscription, isActive, upgrade, cancel, resume } = useSubscriptionContext();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      await cancel(true); // отменить в конце периода
      alert('Подписка будет отменена в конце текущего периода');
    } catch (error) {
      alert('Ошибка отмены подписки');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setLoading(true);
      await resume();
      alert('Подписка возобновлена');
    } catch (error) {
      alert('Ошибка возобновления подписки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Текущая подписка */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-500" />
            Текущая подписка
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">План:</span>
                    <Badge variant="default">{subscription.plan_display_name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Статус:</span>
                    <Badge variant={isActive ? "default" : "destructive"}>
                      {isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Цена:</span>
                    <span className="font-medium">
                      {Math.round(subscription.price_monthly / 100)}₽/мес
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Начало периода:</span>
                    <span className="font-medium">
                      {subscription.current_period_start 
                        ? new Date(subscription.current_period_start).toLocaleDateString('ru-RU')
                        : '—'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Конец периода:</span>
                    <span className="font-medium">
                      {subscription.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString('ru-RU')
                        : '—'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Дней осталось:</span>
                    <span className="font-medium text-blue-600">
                      {subscription.days_remaining || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Действия с подпиской */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => upgrade('professional-plan-id')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  Улучшить план
                </Button>
                
                {subscription.cancel_at_period_end ? (
                  <Button 
                    onClick={handleResume}
                    disabled={loading}
                    variant="outline"
                  >
                    Возобновить подписку
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCancel}
                    disabled={loading}
                    variant="outline"
                  >
                    Отменить подписку
                  </Button>
                )}
                
                <Button variant="outline">
                  Изменить способ оплаты
                </Button>
                
                <Button variant="outline">
                  Скачать счета
                </Button>
              </div>
              
              {subscription.cancel_at_period_end && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Ваша подписка будет отменена {' '}
                    {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('ru-RU')
                      : 'в конце текущего периода'
                    }. До этого времени у вас сохранится полный доступ ко всем функциям.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                Нет активной подписки
              </h3>
              <p className="text-slate-500 mb-4">
                Выберите подходящий план для доступа ко всем функциям
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                Выбрать план
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* История подписок */}
      <Card>
        <CardHeader>
          <CardTitle>История подписок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            История подписок будет отображаться здесь
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// 4. ЭКСПОРТ
// ============================================================================

export default AccountPageComponent;
