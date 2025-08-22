// ============================================================================
// PAYWALL GUARD COMPONENT
// ============================================================================
// Компонент для защиты контента на основе подписки пользователя
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionContext, useHasMinimumPlan } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  Crown, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  X,
  Sparkles,
  Shield,
  Clock,
  Users,
  Star,
  Gift,
  Infinity
} from 'lucide-react';
import type { PlanName, PaywallGuardProps } from '@/types/subscription';
import { PaywallOverlay, PaywallBanner, PaywallModal, UpgradeModal, PlanIcon } from './PaywallVariants';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ PAYWALL GUARD
// ============================================================================

export const PaywallGuard: React.FC<PaywallGuardProps> = ({
  children,
  requiredPlan = 'starter',
  requiredFeature,
  fallback,
  showUpgradeModal = true,
  className = '',
  variant = 'card',
  showPreview = false,
  previewLines = 3,
  upgradeButtonText,
  customMessage,
  onUpgradeClick
}) => {
  const { isActive, subscription, plans, upgrade, loading } = useSubscriptionContext();
  const hasMinimumPlan = useHasMinimumPlan(requiredPlan);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Если загружается, показываем скелетон
  if (loading) {
    return <PaywallSkeleton variant={variant} />;
  }

  // Если есть доступ, показываем контент
  if (isActive && hasMinimumPlan) {
    return <>{children}</>;
  }

  // Если есть кастомный fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Обработчик апгрейда
  const handleUpgrade = async (planId?: string) => {
    if (onUpgradeClick) {
      onUpgradeClick();
      return;
    }

    if (showUpgradeModal) {
      setShowModal(true);
      return;
    }

    if (planId) {
      try {
        await upgrade(planId, 'monthly');
      } catch (error) {
        console.error('Upgrade error:', error);
      }
    } else {
      router.push('/pricing');
    }
  };

  // Показываем paywall в зависимости от варианта
  return (
    <div className={`paywall-guard ${className}`}>
      {variant === 'modal' ? (
        <PaywallModal
          isOpen={true}
          onClose={() => {}}
          requiredPlan={requiredPlan}
          requiredFeature={requiredFeature}
          currentPlan={subscription?.plan_name || null}
          isActive={isActive}
          plans={plans}
          onUpgrade={handleUpgrade}
          customMessage={customMessage}
          upgradeButtonText={upgradeButtonText}
        />
      ) : variant === 'overlay' ? (
        <PaywallOverlay
          children={children}
          requiredPlan={requiredPlan}
          requiredFeature={requiredFeature}
          currentPlan={subscription?.plan_name || null}
          isActive={isActive}
          plans={plans}
          onUpgrade={handleUpgrade}
          showPreview={showPreview}
          previewLines={previewLines}
          customMessage={customMessage}
          upgradeButtonText={upgradeButtonText}
        />
      ) : variant === 'banner' ? (
        <PaywallBanner
          requiredPlan={requiredPlan}
          requiredFeature={requiredFeature}
          currentPlan={subscription?.plan_name || null}
          isActive={isActive}
          plans={plans}
          onUpgrade={handleUpgrade}
          customMessage={customMessage}
          upgradeButtonText={upgradeButtonText}
        />
      ) : (
        <PaywallContent
          requiredPlan={requiredPlan}
          requiredFeature={requiredFeature}
          currentPlan={subscription?.plan_name || null}
          isActive={isActive}
          plans={plans}
          onUpgrade={handleUpgrade}
          customMessage={customMessage}
          upgradeButtonText={upgradeButtonText}
        />
      )}

      {/* Модальное окно апгрейда */}
      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredPlan={requiredPlan}
        plans={plans}
        onUpgrade={upgrade}
      />
    </div>
  );
};

// ============================================================================
// 2. СОДЕРЖИМОЕ PAYWALL
// ============================================================================

interface PaywallContentProps {
  requiredPlan: PlanName;
  requiredFeature?: string;
  currentPlan: PlanName | null;
  isActive: boolean;
  plans: any[];
  onUpgrade: (planId?: string) => Promise<void> | void;
  customMessage?: string;
  upgradeButtonText?: string;
}

const PaywallContent: React.FC<PaywallContentProps> = ({
  requiredPlan,
  requiredFeature,
  currentPlan,
  isActive,
  plans,
  onUpgrade,
  customMessage,
  upgradeButtonText
}) => {
  const requiredPlanData = plans.find(plan => plan.name === requiredPlan);
  const currentPlanData = currentPlan ? plans.find(plan => plan.name === currentPlan) : null;

  const handleUpgrade = async () => {
    if (!requiredPlanData) {
      onUpgrade();
      return;
    }
    
    try {
      await onUpgrade(requiredPlanData.id);
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  return (
    <Card className="paywall-card bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
          <Lock className="h-8 w-8 text-white" />
        </div>
        
        <CardTitle className="text-xl font-bold text-slate-800">
          {!isActive ? 'Требуется подписка' : 'Требуется апгрейд плана'}
        </CardTitle>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          {currentPlan && (
            <Badge variant="outline" className="text-xs">
              Текущий: {currentPlanData?.display_name}
            </Badge>
          )}
          <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
            Требуется: {requiredPlanData?.display_name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div className="text-slate-600">
          {customMessage ? (
            <p>{customMessage}</p>
          ) : requiredFeature ? (
            <p>
              Для использования функции <strong>"{requiredFeature}"</strong> необходим план{' '}
              <strong>{requiredPlanData?.display_name}</strong> или выше.
            </p>
          ) : (
            <p>
              Этот контент доступен только для подписчиков плана{' '}
              <strong>{requiredPlanData?.display_name}</strong> или выше.
            </p>
          )}
        </div>

        {requiredPlanData && (
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PlanIcon plan={requiredPlan} />
                <span className="font-semibold text-slate-800">
                  {requiredPlanData.display_name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">
                  {Math.round(requiredPlanData.price_monthly / 100)}₽
                </div>
                <div className="text-xs text-slate-500">в месяц</div>
              </div>
            </div>
            
            <div className="text-left space-y-2">
              {requiredPlanData.features.slice(0, 3).map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              {requiredPlanData.features.length > 3 && (
                <div className="text-xs text-slate-500 pl-6">
                  и еще {requiredPlanData.features.length - 3} функций...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {upgradeButtonText || (!isActive ? 'Оформить подписку' : 'Улучшить план')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="flex-1">
            Сравнить планы
          </Button>
        </div>

        <div className="text-xs text-slate-500 pt-2">
          Отмена в любое время • Без скрытых платежей
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. ИКОНКИ ПЛАНОВ
// ============================================================================

const PlanIcon: React.FC<{ plan: PlanName }> = ({ plan }) => {
  const iconProps = { className: "h-5 w-5" };
  
  switch (plan) {
    case 'starter':
      return <Zap {...iconProps} className="h-5 w-5 text-blue-500" />;
    case 'professional':
      return <Crown {...iconProps} className="h-5 w-5 text-purple-500" />;
    case 'enterprise':
      return <Crown {...iconProps} className="h-5 w-5 text-yellow-500" />;
    default:
      return <Lock {...iconProps} />;
  }
};

// ============================================================================
// 4. СКЕЛЕТОН ЗАГРУЗКИ
// ============================================================================

const PaywallSkeleton: React.FC<{ variant?: string }> = ({ variant = 'card' }) => {
  if (variant === 'banner') {
    return (
      <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="relative">
        <div className="blur-sm opacity-50">
          <div className="h-64 bg-slate-100 rounded-lg" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse mx-auto" />
              <div className="h-6 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="paywall-skeleton">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-6 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-slate-200 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-slate-100 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 5. СПЕЦИАЛИЗИРОВАННЫЕ КОМПОНЕНТЫ
// ============================================================================

/**
 * Блюр-компонент для скрытия контента
 */
export const BlurredContent: React.FC<{
  children: React.ReactNode;
  requiredPlan?: PlanName;
  blurIntensity?: 'light' | 'medium' | 'heavy';
}> = ({ 
  children, 
  requiredPlan = 'professional',
  blurIntensity = 'medium' 
}) => {
  const hasAccess = useHasMinimumPlan(requiredPlan);
  
  const blurClasses = {
    light: 'blur-sm',
    medium: 'blur-md',
    heavy: 'blur-lg'
  };

  return (
    <div className="relative">
      <div className={`${!hasAccess ? blurClasses[blurIntensity] : ''} transition-all duration-300`}>
        {children}
      </div>
      
      {!hasAccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <PaywallGuard requiredPlan={requiredPlan}>
            {children}
          </PaywallGuard>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент для скрытия контактов фабрик
 */
export const FactoryContactGuard: React.FC<{
  children: React.ReactNode;
  factoryId: string;
  factoryName?: string;
}> = ({ children, factoryId, factoryName }) => {
  const { canAccessFactory, accessFactory, limits } = useSubscriptionContext();
  const [accessing, setAccessing] = React.useState(false);
  
  const hasAccess = canAccessFactory(factoryId);

  const handleAccessFactory = async () => {
    try {
      setAccessing(true);
      await accessFactory(factoryId);
    } catch (error) {
      console.error('Error accessing factory:', error);
    } finally {
      setAccessing(false);
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-md pointer-events-none">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg">
        <Card className="max-w-sm">
          <CardContent className="text-center p-6">
            <Lock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Контакты скрыты</h3>
            <p className="text-sm text-slate-600 mb-4">
              {factoryName ? `Разблокируйте контакты фабрики "${factoryName}"` : 'Разблокируйте контакты фабрики'}
            </p>
            
            <div className="text-xs text-slate-500 mb-4">
              Осталось доступов: {limits?.factories_remaining || 0}
            </div>
            
            <Button 
              onClick={handleAccessFactory}
              disabled={accessing || !limits?.subscription_active}
              className="w-full"
            >
              {accessing ? 'Разблокировка...' : 'Разблокировать контакты'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 6. ЭКСПОРТ
// ============================================================================

export default PaywallGuard;
