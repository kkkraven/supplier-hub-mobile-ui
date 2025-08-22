// ============================================================================
// SUBSCRIPTION HOOKS USAGE EXAMPLES
// ============================================================================
// Примеры использования React хуков для системы подписок
// ============================================================================

'use client';

import React from 'react';
import { useSubscription, useUserLimits, useSubscriptionPlans } from '@/hooks/useSubscription';
import { useSubscriptionContext, useHasPlan, useUsageStats } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================================================
// 1. ПРИМЕР ИСПОЛЬЗОВАНИЯ useSubscription
// ============================================================================

export const SubscriptionExample: React.FC = () => {
  const { 
    subscription, 
    loading, 
    error, 
    isActive, 
    daysRemaining, 
    planName,
    upgrade,
    cancel,
    resume
  } = useSubscription();

  const handleUpgrade = async () => {
    try {
      await upgrade('professional-plan-id', 'monthly');
      alert('План успешно обновлен!');
    } catch (error) {
      alert('Ошибка обновления плана');
    }
  };

  const handleCancel = async () => {
    try {
      await cancel(true); // отменить в конце периода
      alert('Подписка будет отменена в конце периода');
    } catch (error) {
      alert('Ошибка отмены подписки');
    }
  };

  if (loading) return <div>Загрузка подписки...</div>;
  if (error) return <Alert><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Моя подписка</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <span>План:</span>
              <Badge variant={isActive ? "default" : "secondary"}>
                {subscription.plan_display_name}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Статус:</span>
              <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? 'Активна' : 'Неактивна'}
              </Badge>
            </div>
            
            {daysRemaining && (
              <div className="flex items-center justify-between">
                <span>Дней осталось:</span>
                <span className="font-medium">{daysRemaining}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleUpgrade} size="sm">
                Улучшить план
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Отменить
              </Button>
            </div>
          </>
        ) : (
          <div>
            <p>У вас нет активной подписки</p>
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
// 2. ПРИМЕР ИСПОЛЬЗОВАНИЯ useUserLimits
// ============================================================================

export const UserLimitsExample: React.FC = () => {
  const { 
    limits, 
    loading, 
    error,
    canAccessMoreFactories,
    canCreateMoreRfq,
    factoryUsagePercent,
    accessFactory,
    createRfq,
    getUpgradeRecommendation
  } = useUserLimits();

  const [accessing, setAccessing] = React.useState(false);
  const [creatingRfq, setCreatingRfq] = React.useState(false);

  const handleAccessFactory = async () => {
    try {
      setAccessing(true);
      const success = await accessFactory('factory-123');
      if (success) {
        alert('Доступ к фабрике предоставлен!');
      }
    } catch (error) {
      alert('Ошибка предоставления доступа');
    } finally {
      setAccessing(false);
    }
  };

  const handleCreateRfq = async () => {
    try {
      setCreatingRfq(true);
      const success = await createRfq();
      if (success) {
        alert('RFQ запрос создан!');
      }
    } catch (error) {
      alert('Ошибка создания RFQ');
    } finally {
      setCreatingRfq(false);
    }
  };

  const upgradeRecommendation = getUpgradeRecommendation();

  if (loading) return <div>Загрузка лимитов...</div>;
  if (error) return <Alert><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои лимиты</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits ? (
          <>
            {/* Лимиты фабрик */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Фабрики:</span>
                <span>{limits.factories_used} / {limits.factories_limit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Осталось:</span>
                <span className="font-medium">{limits.factories_remaining}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Использовано:</span>
                <span>{factoryUsagePercent}%</span>
              </div>
            </div>

            {/* Лимиты RFQ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>RFQ за месяц:</span>
                <span>
                  {limits.rfq_used} / {limits.rfq_limit || '∞'}
                </span>
              </div>
              {limits.rfq_remaining !== null && (
                <div className="flex items-center justify-between">
                  <span>Осталось RFQ:</span>
                  <span className="font-medium">{limits.rfq_remaining}</span>
                </div>
              )}
            </div>

            {/* Действия */}
            <div className="flex gap-2">
              <Button 
                onClick={handleAccessFactory}
                disabled={!canAccessMoreFactories || accessing}
                size="sm"
              >
                {accessing ? 'Предоставление...' : 'Доступ к фабрике'}
              </Button>
              
              <Button 
                onClick={handleCreateRfq}
                disabled={!canCreateMoreRfq || creatingRfq}
                variant="outline"
                size="sm"
              >
                {creatingRfq ? 'Создание...' : 'Создать RFQ'}
              </Button>
            </div>

            {/* Рекомендации по апгрейду */}
            {upgradeRecommendation.shouldUpgrade && (
              <Alert>
                <AlertDescription>
                  Рекомендуем апгрейд до плана "{upgradeRecommendation.recommendedPlan}": {upgradeRecommendation.reason}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <p>Лимиты недоступны</p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. ПРИМЕР ИСПОЛЬЗОВАНИЯ useSubscriptionPlans
// ============================================================================

export const PlansExample: React.FC = () => {
  const { plans, loading, error } = useSubscriptionPlans();

  if (loading) return <div>Загрузка планов...</div>;
  if (error) return <Alert><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map(plan => (
        <Card key={plan.id} className={plan.is_popular ? 'border-purple-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{plan.display_name}</CardTitle>
              {plan.is_popular && <Badge variant="default">Популярный</Badge>}
            </div>
            <div className="text-2xl font-bold">
              {Math.round(plan.price_monthly / 100)}₽
              <span className="text-sm font-normal text-slate-500">/мес</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>{plan.factory_limit}</strong> фабрик
              </div>
              <div className="text-sm">
                <strong>{plan.rfq_limit || 'Безлимит'}</strong> RFQ запросов
              </div>
              
              <div className="space-y-1 mt-4">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="text-xs text-slate-600">
                    ✓ {feature}
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4">
                Выбрать план
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================================================
// 4. ПРИМЕР ИСПОЛЬЗОВАНИЯ КОНТЕКСТА
// ============================================================================

export const SubscriptionContextExample: React.FC = () => {
  const { 
    subscription, 
    limits, 
    isActive, 
    currentPlan,
    canAccessFactory,
    canCreateRfq,
    upgrade
  } = useSubscriptionContext();

  // Проверка конкретного плана
  const hasProfessionalPlan = useHasPlan('professional');
  
  // Статистика использования
  const usageStats = useUsageStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Контекст подписки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Активна:</span>
            <Badge variant={isActive ? "default" : "destructive"} className="ml-2">
              {isActive ? 'Да' : 'Нет'}
            </Badge>
          </div>
          
          <div>
            <span className="text-slate-600">План:</span>
            <span className="ml-2 font-medium">
              {currentPlan?.display_name || 'Нет'}
            </span>
          </div>
          
          <div>
            <span className="text-slate-600">Professional:</span>
            <Badge variant={hasProfessionalPlan ? "default" : "outline"} className="ml-2">
              {hasProfessionalPlan ? 'Да' : 'Нет'}
            </Badge>
          </div>
          
          <div>
            <span className="text-slate-600">Может создать RFQ:</span>
            <Badge variant={canCreateRfq() ? "default" : "destructive"} className="ml-2">
              {canCreateRfq() ? 'Да' : 'Нет'}
            </Badge>
          </div>
        </div>

        {usageStats && (
          <div className="space-y-2">
            <h4 className="font-medium">Использование:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                Фабрики: {usageStats.factory.used}/{usageStats.factory.limit} ({usageStats.factory.percentage}%)
              </div>
              <div>
                RFQ: {usageStats.rfq.used}/{usageStats.rfq.limit || '∞'} 
                {usageStats.rfq.percentage && ` (${usageStats.rfq.percentage}%)`}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => upgrade('professional-plan-id')}
            size="sm"
          >
            Апгрейд
          </Button>
          
          <Button 
            onClick={() => alert(canAccessFactory('factory-123') ? 'Можно' : 'Нельзя')}
            variant="outline"
            size="sm"
          >
            Проверить доступ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 5. ПРИМЕР ЗАЩИЩЕННОГО КОМПОНЕНТА
// ============================================================================

export const ProtectedComponentExample: React.FC = () => {
  const { isActive } = useSubscriptionContext();
  const hasProfessionalPlan = useHasPlan('professional');

  if (!isActive) {
    return (
      <Alert>
        <AlertDescription>
          Для доступа к этому контенту необходима активная подписка.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasProfessionalPlan) {
    return (
      <Alert>
        <AlertDescription>
          Этот контент доступен только для подписчиков плана Professional или выше.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Премиум контент</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Этот контент доступен только подписчикам Professional плана!</p>
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
          <h3 className="font-semibold mb-2">Эксклюзивная информация</h3>
          <p className="text-sm">
            Здесь может быть расширенная информация о фабриках, 
            детальная аналитика, премиум инструменты и т.д.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 6. ГЛАВНЫЙ КОМПОНЕНТ С ПРИМЕРАМИ
// ============================================================================

export const SubscriptionHooksDemo: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Примеры использования хуков подписок</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">useSubscription</h2>
        <SubscriptionExample />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">useUserLimits</h2>
        <UserLimitsExample />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">useSubscriptionPlans</h2>
        <PlansExample />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">SubscriptionContext</h2>
        <SubscriptionContextExample />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Защищенный компонент</h2>
        <ProtectedComponentExample />
      </section>
    </div>
  );
};

// ============================================================================
// 7. ЭКСПОРТ
// ============================================================================

export default SubscriptionHooksDemo;
