// ============================================================================
// SUBSCRIPTION CONTEXT
// ============================================================================
// React контекст для управления состоянием подписок
// ============================================================================

'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserLimits } from '@/hooks/useUserLimits';
import { useSubscriptionPlans } from '@/hooks/useSubscription';
import type {
  SubscriptionContextValue,
  SubscriptionPlan,
  ActiveSubscription,
  UserLimitsResult,
  PlanName
} from '@/types/subscription';

// ============================================================================
// 1. СОЗДАНИЕ КОНТЕКСТА
// ============================================================================

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ============================================================================
// 2. ПРОВАЙДЕР КОНТЕКСТА
// ============================================================================

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  // Используем наши хуки
  const subscriptionHook = useSubscription();
  const limitsHook = useUserLimits();
  const plansHook = useSubscriptionPlans();

  // ============================================================================
  // 3. ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
  // ============================================================================

  const currentPlan = useMemo(() => {
    if (!subscriptionHook.subscription || !plansHook.plans.length) return null;
    
    return plansHook.plans.find(plan => 
      plan.id === subscriptionHook.subscription?.plan_id
    ) || null;
  }, [subscriptionHook.subscription, plansHook.plans]);

  const isActive = useMemo(() => {
    return subscriptionHook.isActive;
  }, [subscriptionHook.isActive]);

  // ============================================================================
  // 4. ФУНКЦИИ ПРОВЕРКИ ДОСТУПА
  // ============================================================================

  const canAccessFactory = useCallback((factoryId: string): boolean => {
    if (!limitsHook.limits?.subscription_active) return false;
    
    // Проверяем общий лимит
    if (limitsHook.limits.factories_remaining <= 0) return false;
    
    // Здесь можно добавить дополнительную логику проверки
    // например, проверка доступа к конкретной фабрике
    return true;
  }, [limitsHook.limits]);

  const canCreateRfq = useCallback((): boolean => {
    if (!limitsHook.limits?.subscription_active) return false;
    
    // Если лимит не установлен (безлимит)
    if (limitsHook.limits.rfq_limit === null) return true;
    
    // Проверяем остаток лимита
    return limitsHook.limits.rfq_remaining !== null && limitsHook.limits.rfq_remaining > 0;
  }, [limitsHook.limits]);

  // ============================================================================
  // 5. ОБЪЕДИНЕННЫЕ ДЕЙСТВИЯ
  // ============================================================================

  const refetch = useCallback(async () => {
    await Promise.all([
      subscriptionHook.refetch(),
      limitsHook.refetch(),
      plansHook.refetch()
    ]);
  }, [subscriptionHook.refetch, limitsHook.refetch, plansHook.refetch]);

  const upgrade = useCallback(async (
    planId: string, 
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ) => {
    await subscriptionHook.upgrade(planId, billingCycle);
    // Лимиты обновятся автоматически через real-time подписку
  }, [subscriptionHook.upgrade]);

  const cancel = useCallback(async (cancelAtPeriodEnd: boolean = true) => {
    await subscriptionHook.cancel(cancelAtPeriodEnd);
  }, [subscriptionHook.cancel]);

  const resume = useCallback(async () => {
    await subscriptionHook.resume();
  }, [subscriptionHook.resume]);

  const accessFactory = useCallback(async (factoryId: string): Promise<boolean> => {
    return await limitsHook.accessFactory(factoryId);
  }, [limitsHook.accessFactory]);

  const createRfq = useCallback(async (): Promise<boolean> => {
    return await limitsHook.createRfq();
  }, [limitsHook.createRfq]);

  // ============================================================================
  // 6. СОСТОЯНИЕ ЗАГРУЗКИ И ОШИБОК
  // ============================================================================

  const loading = useMemo(() => {
    return subscriptionHook.loading || limitsHook.loading || plansHook.loading;
  }, [subscriptionHook.loading, limitsHook.loading, plansHook.loading]);

  const error = useMemo(() => {
    return subscriptionHook.error || limitsHook.error || plansHook.error;
  }, [subscriptionHook.error, limitsHook.error, plansHook.error]);

  // ============================================================================
  // 7. ЗНАЧЕНИЕ КОНТЕКСТА
  // ============================================================================

  const contextValue: SubscriptionContextValue = {
    // Состояние
    subscription: subscriptionHook.subscription,
    limits: limitsHook.limits,
    plans: plansHook.plans,
    loading,
    error,
    
    // Вычисляемые значения
    isActive,
    currentPlan,
    canAccessFactory,
    canCreateRfq,
    
    // Действия
    refetch,
    upgrade,
    cancel,
    resume,
    accessFactory,
    createRfq
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// ============================================================================
// 8. ХУК ДЛЯ ИСПОЛЬЗОВАНИЯ КОНТЕКСТА
// ============================================================================

export const useSubscriptionContext = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  
  return context;
};

// ============================================================================
// 9. ДОПОЛНИТЕЛЬНЫЕ ХУКИ ДЛЯ УДОБСТВА
// ============================================================================

/**
 * Хук для проверки конкретного плана
 */
export const useHasPlan = (requiredPlan: PlanName): boolean => {
  const { subscription, isActive } = useSubscriptionContext();
  
  return useMemo(() => {
    if (!isActive || !subscription) return false;
    return subscription.plan_name === requiredPlan;
  }, [isActive, subscription, requiredPlan]);
};

/**
 * Хук для проверки минимального уровня плана
 */
export const useHasMinimumPlan = (minimumPlan: PlanName): boolean => {
  const { subscription, isActive } = useSubscriptionContext();
  
  return useMemo(() => {
    if (!isActive || !subscription) return false;
    
    const planHierarchy: Record<PlanName, number> = {
      starter: 1,
      professional: 2,
      enterprise: 3
    };
    
    const currentPlanLevel = planHierarchy[subscription.plan_name];
    const requiredPlanLevel = planHierarchy[minimumPlan];
    
    return currentPlanLevel >= requiredPlanLevel;
  }, [isActive, subscription, minimumPlan]);
};

/**
 * Хук для получения статистики использования
 */
export const useUsageStats = () => {
  const { limits } = useSubscriptionContext();
  
  return useMemo(() => {
    if (!limits) return null;
    
    const factoryUsage = limits.factories_limit > 0 
      ? Math.round((limits.factories_used / limits.factories_limit) * 100)
      : 0;
      
    const rfqUsage = limits.rfq_limit !== null && limits.rfq_limit > 0
      ? Math.round((limits.rfq_used / limits.rfq_limit) * 100)
      : null;
    
    return {
      factory: {
        used: limits.factories_used,
        limit: limits.factories_limit,
        remaining: limits.factories_remaining,
        percentage: factoryUsage
      },
      rfq: {
        used: limits.rfq_used,
        limit: limits.rfq_limit,
        remaining: limits.rfq_remaining,
        percentage: rfqUsage
      }
    };
  }, [limits]);
};

/**
 * Хук для определения необходимости апгрейда
 */
export const useUpgradeNeeded = () => {
  const { limits, plans } = useSubscriptionContext();
  
  return useMemo(() => {
    if (!limits || !limits.subscription_active) {
      return {
        needed: true,
        reason: 'no_subscription',
        recommendedPlan: 'starter' as PlanName
      };
    }
    
    // Если исчерпаны лимиты фабрик
    if (limits.factories_remaining === 0) {
      const nextPlan = limits.plan_name === 'Starter' ? 'professional' : 'enterprise';
      return {
        needed: true,
        reason: 'factory_limit_reached',
        recommendedPlan: nextPlan as PlanName
      };
    }
    
    // Если исчерпаны лимиты RFQ
    if (limits.rfq_limit !== null && limits.rfq_remaining === 0) {
      return {
        needed: true,
        reason: 'rfq_limit_reached',
        recommendedPlan: 'professional' as PlanName
      };
    }
    
    // Если близко к исчерпанию лимитов (более 90%)
    const factoryUsage = limits.factories_limit > 0 
      ? (limits.factories_used / limits.factories_limit) * 100
      : 0;
      
    if (factoryUsage >= 90) {
      const nextPlan = limits.plan_name === 'Starter' ? 'professional' : 'enterprise';
      return {
        needed: true,
        reason: 'approaching_factory_limit',
        recommendedPlan: nextPlan as PlanName
      };
    }
    
    return {
      needed: false,
      reason: null,
      recommendedPlan: null
    };
  }, [limits, plans]);
};

// ============================================================================
// 10. ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================================================

export default SubscriptionProvider;
