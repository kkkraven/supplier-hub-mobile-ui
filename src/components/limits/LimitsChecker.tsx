// ============================================================================
// LIMITS CHECKER COMPONENT
// ============================================================================
// Компонент для проверки лимитов перед выполнением действий
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Zap, 
  Crown, 
  ArrowRight,
  Factory,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { useUserLimits } from '@/hooks/useUserLimits';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

// ============================================================================
// 1. LIMITS CHECKER PROPS
// ============================================================================

interface LimitsCheckerProps {
  action: 'factory_access' | 'rfq_creation';
  resourceId?: string;
  onSuccess?: (result: any) => void;
  onLimitExceeded?: (limits: any) => void;
  children: React.ReactNode;
  showProgress?: boolean;
  className?: string;
}

// ============================================================================
// 2. LIMITS CHECKER COMPONENT
// ============================================================================

export const LimitsChecker: React.FC<LimitsCheckerProps> = ({
  action,
  resourceId,
  onSuccess,
  onLimitExceeded,
  children,
  showProgress = true,
  className = ''
}) => {
  const { limits, loading, accessFactory, createRfq, checkLimit } = useUserLimits();
  const { subscription, isActive } = useSubscriptionContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const router = useRouter();

  // ============================================================================
  // 3. HANDLE ACTION
  // ============================================================================

  const handleAction = async () => {
    if (!isActive || !limits) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsProcessing(true);
      setLimitError(null);

      let result;
      
      if (action === 'factory_access') {
        if (!resourceId) {
          throw new Error('Factory ID is required for factory access');
        }
        
        // Проверяем лимит
        const canAccess = checkLimit('factory');
        if (!canAccess) {
          setShowUpgradeModal(true);
          onLimitExceeded?.(limits);
          return;
        }

        result = await accessFactory(resourceId);
      } else if (action === 'rfq_creation') {
        // Проверяем лимит RFQ
        const canCreate = checkLimit('rfq');
        if (!canCreate) {
          setShowUpgradeModal(true);
          onLimitExceeded?.(limits);
          return;
        }

        // Для создания RFQ нужны дополнительные данные
        // Этот компонент только проверяет лимиты
        result = { can_create: true };
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Error processing action:', error);
      setLimitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // 4. LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // 5. NO SUBSCRIPTION STATE
  // ============================================================================

  if (!isActive) {
    return (
      <>
        <div className={`relative ${className}`}>
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/90">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Требуется подписка
            </Button>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason="Для выполнения этого действия необходима активная подписка"
          currentPlan={null}
        />
      </>
    );
  }

  // ============================================================================
  // 6. LIMITS EXCEEDED STATE
  // ============================================================================

  const isLimitExceeded = action === 'factory_access' 
    ? (limits?.factoriesRemaining || 0) <= 0
    : action === 'rfq_creation' 
      ? limits?.rfqLimit !== null && (limits?.rfqRemaining || 0) <= 0
      : false;

  if (isLimitExceeded) {
    return (
      <>
        <div className={`relative ${className}`}>
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/90">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Лимит исчерпан
            </Button>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={`Вы достигли лимита ${action === 'factory_access' ? 'доступа к фабрикам' : 'создания RFQ'} для вашего плана`}
          currentPlan={subscription?.plan_name || null}
          limits={limits}
        />
      </>
    );
  }

  // ============================================================================
  // 7. NORMAL STATE WITH PROGRESS
  // ============================================================================

  return (
    <div className={className}>
      {showProgress && limits && (
        <LimitsProgress 
          action={action}
          limits={limits}
          className="mb-4"
        />
      )}

      <div onClick={handleAction} className="cursor-pointer">
        {isProcessing ? (
          <div className="relative">
            <div className="opacity-50 pointer-events-none">
              {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {limitError && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {limitError}
          </AlertDescription>
        </Alert>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="Необходимо обновить план для продолжения"
        currentPlan={subscription?.plan_name || null}
        limits={limits}
      />
    </div>
  );
};

// ============================================================================
// 8. LIMITS PROGRESS COMPONENT
// ============================================================================

interface LimitsProgressProps {
  action: 'factory_access' | 'rfq_creation';
  limits: any;
  className?: string;
}

const LimitsProgress: React.FC<LimitsProgressProps> = ({
  action,
  limits,
  className = ''
}) => {
  const isFactory = action === 'factory_access';
  const used = isFactory ? limits.factoriesUsed : limits.rfqUsed;
  const limit = isFactory ? limits.factoriesLimit : limits.rfqLimit;
  const remaining = isFactory ? limits.factoriesRemaining : limits.rfqRemaining;
  
  if (limit === null) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {isFactory ? <Factory className="h-4 w-4 text-green-600" /> : <FileText className="h-4 w-4 text-green-600" />}
            <span className="text-sm font-medium">
              {isFactory ? 'Доступ к фабрикам' : 'Создание RFQ'}
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Безлимитно
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = remaining <= 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFactory ? <Factory className="h-4 w-4 text-purple-600" /> : <FileText className="h-4 w-4 text-purple-600" />}
              <span className="text-sm font-medium">
                {isFactory ? 'Доступ к фабрикам' : 'Создание RFQ'}
              </span>
            </div>
            <Badge 
              variant={isAtLimit ? "destructive" : isNearLimit ? "outline" : "secondary"}
              className={isNearLimit && !isAtLimit ? "border-orange-300 text-orange-700" : ""}
            >
              {used} / {limit}
            </Badge>
          </div>
          
          <Progress 
            value={percentage} 
            className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : 'bg-gray-100'}`}
          />
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Использовано: {used}</span>
            <span>Осталось: {remaining}</span>
          </div>
          
          {isNearLimit && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800 text-xs">
                {isAtLimit 
                  ? 'Лимит исчерпан. Обновите план для продолжения.'
                  : 'Приближаетесь к лимиту. Рассмотрите возможность обновления плана.'
                }
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 9. UPGRADE MODAL COMPONENT
// ============================================================================

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  currentPlan: string | null;
  limits?: any;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  reason,
  currentPlan,
  limits
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  const getSuggestedPlan = () => {
    if (!currentPlan) return 'starter';
    
    const upgradePath: Record<string, string> = {
      'starter': 'professional',
      'professional': 'enterprise',
      'enterprise': 'enterprise'
    };
    
    return upgradePath[currentPlan] || 'professional';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Обновление плана
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">{reason}</p>
          
          {limits && (
            <div className="space-y-3">
              <h4 className="font-medium">Текущие лимиты:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Factory className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-medium">Фабрики</div>
                  <div className="text-xs text-gray-600">
                    {limits.factoriesUsed} / {limits.factoriesLimit || '∞'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-medium">RFQ</div>
                  <div className="text-xs text-gray-600">
                    {limits.rfqUsed} / {limits.rfqLimit || '∞'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">
              Рекомендуемый план: {getSuggestedPlan().charAt(0).toUpperCase() + getSuggestedPlan().slice(1)}
            </h4>
            <p className="text-sm text-purple-700">
              Получите больше возможностей и расширенные лимиты
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Обновить план
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Позже
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// 10. EXPORT
// ============================================================================

export default LimitsChecker;
