// ============================================================================
// USE USER LIMITS HOOK
// ============================================================================
// React хук для управления лимитами пользователя
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type {
  UserLimitsResult,
  UseUserLimitsResult,
  PlanName
} from '@/types/subscription';

// ============================================================================
// 1. ОСНОВНОЙ ХУК ЛИМИТОВ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

export const useUserLimits = (): UseUserLimitsResult => {
  // Состояние
  const [limits, setLimits] = useState<UserLimitsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Контекст аутентификации
  const { user } = useAuth();

  // ============================================================================
  // 2. ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
  // ============================================================================

  const canAccessMoreFactories = useMemo(() => {
    return limits?.subscription_active && 
           limits.factories_remaining > 0;
  }, [limits]);

  const canCreateMoreRfq = useMemo(() => {
    return limits?.subscription_active && 
           (limits.rfq_limit === null || (limits.rfq_remaining !== null && limits.rfq_remaining > 0));
  }, [limits]);

  const factoryUsagePercent = useMemo(() => {
    if (!limits || limits.factories_limit === 0) return 0;
    return Math.round((limits.factories_used / limits.factories_limit) * 100);
  }, [limits]);

  const rfqUsagePercent = useMemo(() => {
    if (!limits || limits.rfq_limit === null) return null;
    if (limits.rfq_limit === 0) return 0;
    return Math.round((limits.rfq_used / limits.rfq_limit) * 100);
  }, [limits]);

  // ============================================================================
  // 3. ЗАГРУЗКА ЛИМИТОВ
  // ============================================================================

  const fetchLimits = useCallback(async () => {
    if (!user?.id) {
      setLimits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Получаем лимиты через функцию БД
      const { data, error: rpcError } = await supabase
        .rpc('get_user_limits_with_plan', { p_user_id: user.id });

      if (rpcError) {
        console.error('Error fetching user limits:', rpcError);
        setError('Ошибка загрузки лимитов пользователя');
        return;
      }

      // Функция возвращает массив, берем первый элемент
      const limitsData = Array.isArray(data) ? data[0] : data;
      setLimits(limitsData || null);
    } catch (err) {
      console.error('Error in fetchLimits:', err);
      setError('Произошла ошибка при загрузке лимитов');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ============================================================================
  // 4. ДОСТУП К ФАБРИКЕ
  // ============================================================================

  const accessFactory = useCallback(async (factoryId: string): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('Пользователь не авторизован');
    }

    if (!limits?.subscription_active) {
      throw new Error('Нет активной подписки');
    }

    if (limits.factories_remaining <= 0) {
      throw new Error('Превышен лимит доступа к фабрикам');
    }

    try {
      setError(null);

      // Используем функцию БД для увеличения счетчика
      const { data, error: rpcError } = await supabase
        .rpc('increment_factory_access', {
          p_user_id: user.id,
          p_factory_id: factoryId
        });

      if (rpcError) {
        console.error('Error accessing factory:', rpcError);
        throw new Error('Ошибка предоставления доступа к фабрике');
      }

      const success = data === true;
      
      if (success) {
        // Обновляем локальные лимиты
        await fetchLimits();
        console.log('Доступ к фабрике предоставлен');
      }

      return success;
    } catch (err) {
      console.error('Error in accessFactory:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка доступа к фабрике';
      setError(errorMessage);
      throw err;
    }
  }, [user?.id, limits, fetchLimits]);

  // ============================================================================
  // 5. СОЗДАНИЕ RFQ
  // ============================================================================

  const createRfq = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('Пользователь не авторизован');
    }

    if (!limits?.subscription_active) {
      throw new Error('Нет активной подписки');
    }

    if (limits.rfq_limit !== null && limits.rfq_remaining !== null && limits.rfq_remaining <= 0) {
      throw new Error('Превышен лимит RFQ запросов за месяц');
    }

    try {
      setError(null);

      // Используем функцию БД для увеличения счетчика RFQ
      const { data, error: rpcError } = await supabase
        .rpc('increment_rfq_count', { p_user_id: user.id });

      if (rpcError) {
        console.error('Error creating RFQ:', rpcError);
        throw new Error('Ошибка создания RFQ запроса');
      }

      const success = data === true;
      
      if (success) {
        // Обновляем локальные лимиты
        await fetchLimits();
        console.log('RFQ запрос создан');
      }

      return success;
    } catch (err) {
      console.error('Error in createRfq:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания RFQ';
      setError(errorMessage);
      throw err;
    }
  }, [user?.id, limits, fetchLimits]);

  // ============================================================================
  // 6. ПРОВЕРКА ЛИМИТОВ
  // ============================================================================

  const checkLimit = useCallback(async (
    action: 'factory_access' | 'rfq_create',
    resourceId?: string
  ): Promise<boolean> => {
    if (!user?.id || !limits) {
      return false;
    }

    try {
      setError(null);

      if (action === 'factory_access') {
        // Проверяем лимит фабрик
        if (!limits.subscription_active) return false;
        if (limits.factories_remaining <= 0) return false;
        
        // Если указан ID фабрики, проверяем доступ к конкретной фабрике
        if (resourceId) {
          const { data, error: rpcError } = await supabase
            .rpc('can_access_factory', {
              p_user_id: user.id,
              p_factory_id: resourceId
            });

          if (rpcError) {
            console.error('Error checking factory access:', rpcError);
            return false;
          }

          return data === true;
        }

        return true;
      }

      if (action === 'rfq_create') {
        // Проверяем лимит RFQ
        if (!limits.subscription_active) return false;
        if (limits.rfq_limit !== null && limits.rfq_remaining !== null && limits.rfq_remaining <= 0) {
          return false;
        }
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error in checkLimit:', err);
      setError('Ошибка проверки лимитов');
      return false;
    }
  }, [user?.id, limits]);

  // ============================================================================
  // 7. ПОЛУЧЕНИЕ РЕКОМЕНДАЦИЙ ПО АПГРЕЙДУ
  // ============================================================================

  const getUpgradeRecommendation = useCallback((): {
    shouldUpgrade: boolean;
    recommendedPlan?: PlanName;
    reason?: string;
  } => {
    if (!limits) {
      return { shouldUpgrade: false };
    }

    // Если лимит фабрик исчерпан
    if (limits.factories_remaining === 0 && limits.plan_name === 'Starter') {
      return {
        shouldUpgrade: true,
        recommendedPlan: 'professional',
        reason: 'Исчерпан лимит доступа к фабрикам'
      };
    }

    // Если лимит RFQ исчерпан
    if (limits.rfq_limit !== null && limits.rfq_remaining === 0) {
      return {
        shouldUpgrade: true,
        recommendedPlan: 'professional',
        reason: 'Исчерпан лимит RFQ запросов'
      };
    }

    // Если использовано более 80% лимитов
    if (factoryUsagePercent >= 80 || (rfqUsagePercent !== null && rfqUsagePercent >= 80)) {
      return {
        shouldUpgrade: true,
        recommendedPlan: limits.plan_name === 'Starter' ? 'professional' : 'enterprise',
        reason: 'Близко к исчерпанию лимитов'
      };
    }

    return { shouldUpgrade: false };
  }, [limits, factoryUsagePercent, rfqUsagePercent]);

  // ============================================================================
  // 8. СБРОС ОШИБОК
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // 9. ЭФФЕКТЫ
  // ============================================================================

  // Загружаем лимиты при монтировании и изменении пользователя
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Подписываемся на изменения лимитов в реальном времени
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user_limits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_limits',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User limits changed:', payload);
          fetchLimits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchLimits]);

  // ============================================================================
  // 10. ВОЗВРАТ РЕЗУЛЬТАТА
  // ============================================================================

  return {
    // Состояние
    limits,
    loading,
    error,
    
    // Вычисляемые значения
    canAccessMoreFactories,
    canCreateMoreRfq,
    factoryUsagePercent,
    rfqUsagePercent,
    
    // Действия
    refetch: fetchLimits,
    accessFactory,
    createRfq,
    checkLimit,
    getUpgradeRecommendation,
    clearError
  };
};

// ============================================================================
// 11. ДОПОЛНИТЕЛЬНЫЕ ХУКИ
// ============================================================================

/**
 * Хук для проверки конкретного лимита
 */
export const useLimitCheck = (action: 'factory_access' | 'rfq_create', resourceId?: string) => {
  const { checkLimit, limits, loading } = useUserLimits();
  const [canPerformAction, setCanPerformAction] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const performCheck = useCallback(async () => {
    if (loading || !limits) return;

    try {
      setChecking(true);
      const result = await checkLimit(action, resourceId);
      setCanPerformAction(result);
    } catch (err) {
      console.error('Error checking limit:', err);
      setCanPerformAction(false);
    } finally {
      setChecking(false);
    }
  }, [checkLimit, action, resourceId, loading, limits]);

  useEffect(() => {
    performCheck();
  }, [performCheck]);

  return {
    canPerformAction,
    checking: checking || loading,
    recheck: performCheck
  };
};

/**
 * Хук для отслеживания использования лимитов
 */
export const useLimitUsage = () => {
  const { limits, factoryUsagePercent, rfqUsagePercent } = useUserLimits();

  const getUsageStatus = useCallback((type: 'factory' | 'rfq') => {
    const percent = type === 'factory' ? factoryUsagePercent : rfqUsagePercent;
    
    if (percent === null || percent === undefined) return 'unlimited';
    if (percent >= 100) return 'exceeded';
    if (percent >= 90) return 'critical';
    if (percent >= 75) return 'warning';
    return 'normal';
  }, [factoryUsagePercent, rfqUsagePercent]);

  const getUsageColor = useCallback((status: string) => {
    switch (status) {
      case 'exceeded': return 'red';
      case 'critical': return 'orange';
      case 'warning': return 'yellow';
      case 'normal': return 'green';
      case 'unlimited': return 'blue';
      default: return 'gray';
    }
  }, []);

  return {
    limits,
    factoryUsage: {
      percent: factoryUsagePercent,
      status: getUsageStatus('factory'),
      color: getUsageColor(getUsageStatus('factory'))
    },
    rfqUsage: {
      percent: rfqUsagePercent,
      status: getUsageStatus('rfq'),
      color: getUsageColor(getUsageStatus('rfq'))
    }
  };
};

// ============================================================================
// 12. ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================================================

export default useUserLimits;
