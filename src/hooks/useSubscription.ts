// ============================================================================
// USE SUBSCRIPTION HOOK
// ============================================================================
// React хук для управления подписками пользователя
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type {
  ActiveSubscription,
  SubscriptionPlan,
  UseSubscriptionResult,
  PlanName,
  SubscriptionStatus,
  CreateSubscriptionRequest,
  UpgradeSubscriptionRequest
} from '@/types/subscription';

// ============================================================================
// 1. ОСНОВНОЙ ХУК ПОДПИСКИ
// ============================================================================

export const useSubscription = (): UseSubscriptionResult => {
  // Состояние
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Контекст аутентификации
  const { user } = useAuth();

  // ============================================================================
  // 2. ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
  // ============================================================================

  const isActive = useMemo(() => {
    if (!subscription) return false;
    return subscription.is_active && 
           (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());
  }, [subscription]);

  const daysRemaining = useMemo(() => {
    if (!subscription?.current_period_end) return null;
    
    const now = new Date();
    const endDate = new Date(subscription.current_period_end);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, [subscription]);

  const planName = useMemo(() => {
    return subscription?.plan_name || null;
  }, [subscription]);

  // ============================================================================
  // 3. ЗАГРУЗКА ПОДПИСКИ
  // ============================================================================

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Получаем активную подписку с деталями плана
      const { data, error: supabaseError } = await supabase
        .from('active_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (supabaseError) {
        console.error('Error fetching subscription:', supabaseError);
        setError('Ошибка загрузки подписки');
        return;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
      setError('Произошла ошибка при загрузке подписки');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ============================================================================
  // 4. СОЗДАНИЕ ПОДПИСКИ
  // ============================================================================

  const createSubscription = useCallback(async (
    planId: string, 
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ) => {
    if (!user?.id) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setLoading(true);
      setError(null);

      // Создаем подписку через API
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          user_id: user.id
        } as CreateSubscriptionRequest),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка создания подписки');
      }

      // Если требуется перенаправление на Stripe Checkout
      if (result.data?.checkout_session?.url) {
        window.location.href = result.data.checkout_session.url;
        return;
      }

      // Обновляем локальное состояние
      await fetchSubscription();
    } catch (err) {
      console.error('Error creating subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания подписки';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchSubscription]);

  // ============================================================================
  // 5. АПГРЕЙД ПОДПИСКИ
  // ============================================================================

  const upgrade = useCallback(async (
    newPlanId: string, 
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ) => {
    if (!user?.id || !subscription) {
      throw new Error('Нет активной подписки для апгрейда');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_plan_id: newPlanId,
          billing_cycle: billingCycle,
          prorate: true
        } as UpgradeSubscriptionRequest),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка апгрейда подписки');
      }

      // Обновляем локальное состояние
      await fetchSubscription();
      
      // Показываем уведомление об успешном апгрейде
      console.log('Подписка успешно обновлена!');
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка апгрейда подписки';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, subscription, fetchSubscription]);

  // ============================================================================
  // 6. ОТМЕНА ПОДПИСКИ
  // ============================================================================

  const cancel = useCallback(async (cancelAtPeriodEnd: boolean = true) => {
    if (!user?.id || !subscription) {
      throw new Error('Нет активной подписки для отмены');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_period_end: cancelAtPeriodEnd,
          reason: 'user_requested'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка отмены подписки');
      }

      // Обновляем локальное состояние
      await fetchSubscription();
      
      console.log(cancelAtPeriodEnd 
        ? 'Подписка будет отменена в конце периода' 
        : 'Подписка отменена немедленно'
      );
    } catch (err) {
      console.error('Error canceling subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отмены подписки';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, subscription, fetchSubscription]);

  // ============================================================================
  // 7. ВОЗОБНОВЛЕНИЕ ПОДПИСКИ
  // ============================================================================

  const resume = useCallback(async () => {
    if (!user?.id || !subscription) {
      throw new Error('Нет подписки для возобновления');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка возобновления подписки');
      }

      // Обновляем локальное состояние
      await fetchSubscription();
      
      console.log('Подписка успешно возобновлена!');
    } catch (err) {
      console.error('Error resuming subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка возобновления подписки';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, subscription, fetchSubscription]);

  // ============================================================================
  // 8. ЭФФЕКТЫ
  // ============================================================================

  // Загружаем подписку при монтировании и изменении пользователя
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Подписываемся на изменения подписки в реальном времени
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSubscription]);

  // ============================================================================
  // 9. ВОЗВРАТ РЕЗУЛЬТАТА
  // ============================================================================

  return {
    // Состояние
    subscription,
    loading,
    error,
    
    // Вычисляемые значения
    isActive,
    daysRemaining,
    planName,
    
    // Действия
    refetch: fetchSubscription,
    createSubscription,
    upgrade,
    cancel,
    resume
  };
};

// ============================================================================
// 10. ДОПОЛНИТЕЛЬНЫЕ ХУКИ
// ============================================================================

/**
 * Хук для получения списка доступных планов
 */
export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (supabaseError) {
        console.error('Error fetching plans:', supabaseError);
        setError('Ошибка загрузки тарифных планов');
        return;
      }

      setPlans(data || []);
    } catch (err) {
      console.error('Error in fetchPlans:', err);
      setError('Произошла ошибка при загрузке планов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans
  };
};

/**
 * Хук для получения опций апгрейда
 */
export const useUpgradeOptions = () => {
  const [options, setOptions] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchUpgradeOptions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_upgrade_options', { p_user_id: user.id });

      if (rpcError) {
        console.error('Error fetching upgrade options:', rpcError);
        setError('Ошибка загрузки опций апгрейда');
        return;
      }

      setOptions(data || []);
    } catch (err) {
      console.error('Error in fetchUpgradeOptions:', err);
      setError('Произошла ошибка при загрузке опций апгрейда');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    options,
    loading,
    error,
    refetch: fetchUpgradeOptions
  };
};

// ============================================================================
// 11. ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================================================

export default useSubscription;
