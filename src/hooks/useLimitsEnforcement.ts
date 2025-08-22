// ============================================================================
// USE LIMITS ENFORCEMENT HOOK
// ============================================================================
// Хук для принудительной проверки и применения лимитов
// ============================================================================

import { useState, useCallback } from 'react';
import { useUserLimits } from './useUserLimits';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

// ============================================================================
// 1. TYPES
// ============================================================================

interface LimitsEnforcementResult {
  canProceed: boolean;
  reason?: string;
  suggestedAction?: 'upgrade' | 'wait' | 'contact_support';
  suggestedPlan?: string;
  remainingCount?: number;
}

interface FactoryAccessOptions {
  factoryId: string;
  factoryName?: string;
  skipCheck?: boolean;
}

interface RfqCreationOptions {
  title: string;
  description?: string;
  category?: string;
  skipCheck?: boolean;
}

// ============================================================================
// 2. USE LIMITS ENFORCEMENT HOOK
// ============================================================================

export const useLimitsEnforcement = () => {
  const { limits, loading, accessFactory, createRfq, checkLimit, getUpgradeRecommendation } = useUserLimits();
  const { subscription, isActive } = useSubscriptionContext();
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  // ============================================================================
  // 3. CHECK FACTORY ACCESS
  // ============================================================================

  const checkFactoryAccess = useCallback(async (
    options: FactoryAccessOptions
  ): Promise<LimitsEnforcementResult> => {
    // Если проверка отключена
    if (options.skipCheck) {
      return { canProceed: true };
    }

    // Проверяем активность подписки
    if (!isActive) {
      return {
        canProceed: false,
        reason: 'Требуется активная подписка для доступа к фабрикам',
        suggestedAction: 'upgrade',
        suggestedPlan: 'starter'
      };
    }

    // Проверяем лимиты
    if (!limits) {
      return {
        canProceed: false,
        reason: 'Не удалось получить информацию о лимитах',
        suggestedAction: 'contact_support'
      };
    }

    // Проверяем, не исчерпан ли лимит
    if (limits.factoriesRemaining <= 0) {
      const recommendation = getUpgradeRecommendation('factory');
      
      return {
        canProceed: false,
        reason: `Исчерпан лимит доступа к фабрикам (${limits.factoriesUsed}/${limits.factoriesLimit})`,
        suggestedAction: 'upgrade',
        suggestedPlan: recommendation?.recommended_plan,
        remainingCount: 0
      };
    }

    // Проверяем, не был ли уже доступ к этой фабрике
    try {
      const response = await fetch(`/api/limits/factory-access?factory_id=${options.factoryId}`);
      const data = await response.json();

      if (data.success && data.data.has_access) {
        return {
          canProceed: true,
          reason: 'Доступ к этой фабрике уже получен ранее',
          remainingCount: data.data.factories_remaining
        };
      }
    } catch (error) {
      console.error('Error checking existing factory access:', error);
    }

    return {
      canProceed: true,
      remainingCount: limits.factoriesRemaining
    };
  }, [isActive, limits, getUpgradeRecommendation]);

  // ============================================================================
  // 4. ENFORCE FACTORY ACCESS
  // ============================================================================

  const enforceFactoryAccess = useCallback(async (
    options: FactoryAccessOptions
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    const processingKey = `factory_${options.factoryId}`;
    
    if (processing[processingKey]) {
      return { success: false, error: 'Запрос уже обрабатывается' };
    }

    try {
      setProcessing(prev => ({ ...prev, [processingKey]: true }));

      // Проверяем лимиты
      const checkResult = await checkFactoryAccess(options);
      
      if (!checkResult.canProceed) {
        return { 
          success: false, 
          error: checkResult.reason,
          data: {
            suggested_action: checkResult.suggestedAction,
            suggested_plan: checkResult.suggestedPlan
          }
        };
      }

      // Если доступ уже был, возвращаем успех
      if (checkResult.reason?.includes('уже получен')) {
        return {
          success: true,
          data: {
            already_accessed: true,
            factories_remaining: checkResult.remainingCount
          }
        };
      }

      // Выполняем доступ к фабрике
      const result = await accessFactory(options.factoryId);
      
      return { success: true, data: result };

    } catch (error) {
      console.error('Error enforcing factory access:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    } finally {
      setProcessing(prev => ({ ...prev, [processingKey]: false }));
    }
  }, [processing, checkFactoryAccess, accessFactory]);

  // ============================================================================
  // 5. CHECK RFQ CREATION
  // ============================================================================

  const checkRfqCreation = useCallback(async (
    options: RfqCreationOptions
  ): Promise<LimitsEnforcementResult> => {
    // Если проверка отключена
    if (options.skipCheck) {
      return { canProceed: true };
    }

    // Проверяем активность подписки
    if (!isActive) {
      return {
        canProceed: false,
        reason: 'Требуется активная подписка для создания RFQ',
        suggestedAction: 'upgrade',
        suggestedPlan: 'starter'
      };
    }

    // Проверяем лимиты
    if (!limits) {
      return {
        canProceed: false,
        reason: 'Не удалось получить информацию о лимитах',
        suggestedAction: 'contact_support'
      };
    }

    // Если RFQ безлимитные, разрешаем
    if (limits.rfqLimit === null) {
      return { canProceed: true };
    }

    // Проверяем, не исчерпан ли лимит
    if (limits.rfqRemaining <= 0) {
      const recommendation = getUpgradeRecommendation('rfq');
      
      return {
        canProceed: false,
        reason: `Исчерпан лимит создания RFQ (${limits.rfqUsed}/${limits.rfqLimit})`,
        suggestedAction: 'upgrade',
        suggestedPlan: recommendation?.recommended_plan,
        remainingCount: 0
      };
    }

    return {
      canProceed: true,
      remainingCount: limits.rfqRemaining
    };
  }, [isActive, limits, getUpgradeRecommendation]);

  // ============================================================================
  // 6. ENFORCE RFQ CREATION
  // ============================================================================

  const enforceRfqCreation = useCallback(async (
    options: RfqCreationOptions & { rfqData: any }
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    const processingKey = `rfq_${Date.now()}`;
    
    if (processing[processingKey]) {
      return { success: false, error: 'Запрос уже обрабатывается' };
    }

    try {
      setProcessing(prev => ({ ...prev, [processingKey]: true }));

      // Проверяем лимиты
      const checkResult = await checkRfqCreation(options);
      
      if (!checkResult.canProceed) {
        return { 
          success: false, 
          error: checkResult.reason,
          data: {
            suggested_action: checkResult.suggestedAction,
            suggested_plan: checkResult.suggestedPlan
          }
        };
      }

      // Создаем RFQ через API
      const response = await fetch('/api/limits/rfq-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfq_data: options.rfqData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create RFQ');
      }

      return { success: true, data: data.data };

    } catch (error) {
      console.error('Error enforcing RFQ creation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    } finally {
      setProcessing(prev => ({ ...prev, [processingKey]: false }));
    }
  }, [processing, checkRfqCreation]);

  // ============================================================================
  // 7. BULK OPERATIONS
  // ============================================================================

  const checkBulkFactoryAccess = useCallback(async (
    factoryIds: string[]
  ): Promise<Record<string, LimitsEnforcementResult>> => {
    const results: Record<string, LimitsEnforcementResult> = {};
    
    for (const factoryId of factoryIds) {
      results[factoryId] = await checkFactoryAccess({ factoryId });
    }
    
    return results;
  }, [checkFactoryAccess]);

  // ============================================================================
  // 8. UTILITY FUNCTIONS
  // ============================================================================

  const getProcessingStatus = useCallback((key: string): boolean => {
    return processing[key] || false;
  }, [processing]);

  const isAnyProcessing = useCallback((): boolean => {
    return Object.values(processing).some(Boolean);
  }, [processing]);

  const clearProcessing = useCallback(() => {
    setProcessing({});
  }, []);

  // ============================================================================
  // 9. RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Состояние
    limits,
    loading,
    subscription,
    isActive,
    processing,
    
    // Проверки лимитов
    checkFactoryAccess,
    checkRfqCreation,
    checkBulkFactoryAccess,
    
    // Принудительное применение лимитов
    enforceFactoryAccess,
    enforceRfqCreation,
    
    // Утилиты
    getProcessingStatus,
    isAnyProcessing,
    clearProcessing,
    
    // Рекомендации по апгрейду
    getUpgradeRecommendation
  };
};

// ============================================================================
// 10. EXPORT
// ============================================================================

export default useLimitsEnforcement;
