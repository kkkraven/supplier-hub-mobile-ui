// ============================================================================
// PLAN UPGRADE SECTION COMPONENT
// ============================================================================
// Компонент для отображения вариантов апгрейда плана
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useSubscriptionPlans } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  ArrowUp, 
  CheckCircle, 
  Zap, 
  Star,
  TrendingUp
} from 'lucide-react';
import type { PlanName } from '@/types/subscription';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ СЕКЦИИ АПГРЕЙДА
// ============================================================================

export const PlanUpgradeSection: React.FC = () => {
  const { subscription, isActive, upgrade } = useSubscriptionContext();
  const { plans, loading } = useSubscriptionPlans();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  // Если нет активной подписки, показываем все планы
  if (!isActive || !subscription) {
    return <AllPlansSection plans={plans} loading={loading} />;
  }

  // Фильтруем планы для апгрейда
  const currentPlanHierarchy = getPlanHierarchy(subscription.plan_name);
  const upgradeOptions = plans.filter(plan => 
    getPlanHierarchy(plan.name) > currentPlanHierarchy
  );

  if (upgradeOptions.length === 0) {
    return <MaxPlanReachedSection currentPlan={subscription.plan_display_name} />;
  }

  const handleUpgrade = async (planId: string, planName: string) => {
    try {
      setUpgrading(planId);
      await upgrade(planId, 'monthly');
      // Уведомление об успешном апгрейде будет показано через контекст
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Ошибка при апгрейде плана');
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Улучшить план
        </CardTitle>
        <p className="text-sm text-slate-600">
          Получите доступ к дополнительным функциям и увеличьте лимиты
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upgradeOptions.map(plan => (
            <UpgradeOptionCard
              key={plan.id}
              plan={plan}
              currentPlan={subscription}
              onUpgrade={() => handleUpgrade(plan.id, plan.name)}
              upgrading={upgrading === plan.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 2. КАРТОЧКА ВАРИАНТА АПГРЕЙДА
// ============================================================================

interface UpgradeOptionCardProps {
  plan: any;
  currentPlan: any;
  onUpgrade: () => void;
  upgrading: boolean;
}

const UpgradeOptionCard: React.FC<UpgradeOptionCardProps> = ({
  plan,
  currentPlan,
  onUpgrade,
  upgrading
}) => {
  const priceDifference = plan.price_monthly - currentPlan.price_monthly;
  const factoryIncrease = plan.factory_limit - currentPlan.factory_limit;
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <PlanIcon planName={plan.name} />
            <div>
              <h3 className="font-semibold text-slate-800">{plan.display_name}</h3>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </div>
          </div>
          {plan.is_popular && (
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              <Star className="h-3 w-3 mr-1" />
              Популярный
            </Badge>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-slate-800">
            {Math.round(plan.price_monthly / 100)}₽
          </div>
          <div className="text-xs text-slate-500">в месяц</div>
          {priceDifference > 0 && (
            <div className="text-xs text-green-600">
              +{Math.round(priceDifference / 100)}₽
            </div>
          )}
        </div>
      </div>

      {/* Улучшения */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Что улучшится:</h4>
          <div className="space-y-1">
            {factoryIncrease > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>+{factoryIncrease} фабрик</span>
              </div>
            )}
            {plan.rfq_limit === null && currentPlan.rfq_limit !== null && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>Безлимит RFQ</span>
              </div>
            )}
            {plan.rfq_limit !== null && currentPlan.rfq_limit !== null && plan.rfq_limit > currentPlan.rfq_limit && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>+{plan.rfq_limit - currentPlan.rfq_limit} RFQ</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Новые функции:</h4>
          <div className="space-y-1">
            {getNewFeatures(plan, currentPlan).slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                <CheckCircle className="h-3 w-3" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={onUpgrade}
        disabled={upgrading}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        {upgrading ? 'Обновление...' : `Перейти на ${plan.display_name}`}
      </Button>
    </div>
  );
};

// ============================================================================
// 3. СЕКЦИЯ ВСЕХ ПЛАНОВ (ДЛЯ ПОЛЬЗОВАТЕЛЕЙ БЕЗ ПОДПИСКИ)
// ============================================================================

interface AllPlansSectionProps {
  plans: any[];
  loading: boolean;
}

const AllPlansSection: React.FC<AllPlansSectionProps> = ({ plans, loading }) => {
  if (loading) {
    return <PlansSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-500" />
          Выберите план
        </CardTitle>
        <p className="text-sm text-slate-600">
          Получите доступ к базе фабрик и RFQ системе
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 4. КАРТОЧКА ПЛАНА
// ============================================================================

interface PlanCardProps {
  plan: any;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  return (
    <div className={`relative rounded-lg border p-4 ${
      plan.is_popular 
        ? 'border-purple-500 bg-purple-50' 
        : 'border-slate-200 bg-white'
    }`}>
      {plan.is_popular && (
        <Badge className="absolute -top-2 left-4 bg-purple-500 text-white">
          Популярный
        </Badge>
      )}
      
      <div className="text-center mb-4">
        <PlanIcon planName={plan.name} className="mx-auto mb-2" />
        <h3 className="font-semibold text-lg">{plan.display_name}</h3>
        <p className="text-sm text-slate-600 mb-3">{plan.description}</p>
        
        <div className="text-2xl font-bold text-slate-800">
          {Math.round(plan.price_monthly / 100)}₽
        </div>
        <div className="text-sm text-slate-500">в месяц</div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>{plan.factory_limit}</strong> фабрик
        </div>
        <div className="text-sm">
          <strong>{plan.rfq_limit || 'Безлимит'}</strong> RFQ запросов
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {plan.features.slice(0, 3).map((feature: string, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button 
        className={`w-full ${
          plan.is_popular 
            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
            : ''
        }`}
        variant={plan.is_popular ? 'default' : 'outline'}
      >
        Выбрать план
      </Button>
    </div>
  );
};

// ============================================================================
// 5. СЕКЦИЯ МАКСИМАЛЬНОГО ПЛАНА
// ============================================================================

interface MaxPlanReachedSectionProps {
  currentPlan: string;
}

const MaxPlanReachedSection: React.FC<MaxPlanReachedSectionProps> = ({ currentPlan }) => (
  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
    <CardContent className="text-center py-8">
      <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        У вас максимальный план!
      </h3>
      <p className="text-slate-600 mb-4">
        Вы используете план <strong>{currentPlan}</strong> — наш самый продвинутый тариф
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Доступны все функции платформы</span>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И КОМПОНЕНТЫ
// ============================================================================

const getPlanHierarchy = (planName: PlanName): number => {
  const hierarchy: Record<PlanName, number> = {
    starter: 1,
    professional: 2,
    enterprise: 3
  };
  return hierarchy[planName] || 0;
};

const getNewFeatures = (newPlan: any, currentPlan: any): string[] => {
  const currentFeatures = new Set(currentPlan.features || []);
  return (newPlan.features || []).filter((feature: string) => !currentFeatures.has(feature));
};

const PlanIcon: React.FC<{ planName: PlanName; className?: string }> = ({ 
  planName, 
  className = "h-8 w-8" 
}) => {
  const iconProps = { className };
  
  switch (planName) {
    case 'starter':
      return <Zap {...iconProps} className={`${className} text-blue-500`} />;
    case 'professional':
      return <Crown {...iconProps} className={`${className} text-purple-500`} />;
    case 'enterprise':
      return <Crown {...iconProps} className={`${className} text-yellow-500`} />;
    default:
      return <Crown {...iconProps} />;
  }
};

const PlansSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <div className="h-8 w-8 bg-slate-200 rounded animate-pulse mx-auto" />
            <div className="h-6 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-8 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-10 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// 7. ЭКСПОРТ
// ============================================================================

export default PlanUpgradeSection;
