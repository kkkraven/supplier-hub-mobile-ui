// ============================================================================
// PAYWALL VARIANTS COMPONENTS
// ============================================================================
// Дополнительные варианты отображения paywall
// ============================================================================

'use client';

import React, { useState } from 'react';
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
  Gift
} from 'lucide-react';
import type { PlanName } from '@/types/subscription';

// ============================================================================
// 1. PAYWALL OVERLAY
// ============================================================================

interface PaywallOverlayProps {
  children: React.ReactNode;
  requiredPlan: PlanName;
  requiredFeature?: string;
  currentPlan: PlanName | null;
  isActive: boolean;
  plans: any[];
  onUpgrade: (planId?: string) => Promise<void> | void;
  showPreview?: boolean;
  previewLines?: number;
  customMessage?: string;
  upgradeButtonText?: string;
}

export const PaywallOverlay: React.FC<PaywallOverlayProps> = ({
  children,
  requiredPlan,
  requiredFeature,
  currentPlan,
  isActive,
  plans,
  onUpgrade,
  showPreview = false,
  previewLines = 3,
  customMessage,
  upgradeButtonText
}) => {
  const requiredPlanData = plans.find(plan => plan.name === requiredPlan);

  return (
    <div className="relative">
      {/* Контент с размытием */}
      <div className={`${showPreview ? 'blur-sm' : 'blur-md'} pointer-events-none`}>
        {showPreview ? (
          <div className="relative overflow-hidden">
            {children}
            <div 
              className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"
              style={{ maskImage: 'linear-gradient(to top, black, transparent)' }}
            />
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Overlay с paywall */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <Card className="max-w-md mx-4 shadow-2xl border-2 border-purple-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">
              {!isActive ? 'Требуется подписка' : 'Требуется апгрейд'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              {customMessage || (requiredFeature 
                ? `Функция "${requiredFeature}" доступна в плане ${requiredPlanData?.display_name}`
                : `Контент доступен в плане ${requiredPlanData?.display_name} или выше`
              )}
            </p>
            
            {requiredPlanData && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PlanIcon plan={requiredPlan} />
                  <span className="font-semibold">{requiredPlanData.display_name}</span>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(requiredPlanData.price_monthly / 100)}₽/мес
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => onUpgrade(requiredPlanData?.id)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                size="sm"
              >
                {upgradeButtonText || 'Получить доступ'}
              </Button>
              <Button variant="outline" size="sm">
                Подробнее
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 2. PAYWALL BANNER
// ============================================================================

interface PaywallBannerProps {
  requiredPlan: PlanName;
  requiredFeature?: string;
  currentPlan: PlanName | null;
  isActive: boolean;
  plans: any[];
  onUpgrade: (planId?: string) => Promise<void> | void;
  customMessage?: string;
  upgradeButtonText?: string;
}

export const PaywallBanner: React.FC<PaywallBannerProps> = ({
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

  return (
    <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
          <Crown className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-purple-800">
            {!isActive ? 'Требуется подписка' : 'Требуется апгрейд'}
          </h4>
          <p className="text-sm text-purple-700">
            {customMessage || (requiredFeature 
              ? `Функция "${requiredFeature}" доступна в плане ${requiredPlanData?.display_name}`
              : `Для доступа к этому контенту нужен план ${requiredPlanData?.display_name}`
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {requiredPlanData && (
            <div className="text-right mr-3">
              <div className="text-sm font-semibold text-purple-800">
                {Math.round(requiredPlanData.price_monthly / 100)}₽
              </div>
              <div className="text-xs text-purple-600">в месяц</div>
            </div>
          )}
          <Button 
            onClick={() => onUpgrade(requiredPlanData?.id)}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
            size="sm"
          >
            {upgradeButtonText || 'Получить доступ'}
          </Button>
        </div>
      </div>
    </Alert>
  );
};

// ============================================================================
// 3. PAYWALL MODAL
// ============================================================================

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: PlanName;
  requiredFeature?: string;
  currentPlan: PlanName | null;
  isActive: boolean;
  plans: any[];
  onUpgrade: (planId?: string) => Promise<void> | void;
  customMessage?: string;
  upgradeButtonText?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                <Crown className="h-4 w-4 text-white" />
              </div>
              {!isActive ? 'Требуется подписка' : 'Требуется апгрейд'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-slate-600">
              {customMessage || (requiredFeature 
                ? `Функция "${requiredFeature}" доступна в плане ${requiredPlanData?.display_name} или выше`
                : `Этот контент доступен только подписчикам плана ${requiredPlanData?.display_name}`
              )}
            </p>
          </div>
          
          {/* Сравнение планов */}
          <div className="grid grid-cols-1 gap-3">
            {currentPlanData && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PlanIcon plan={currentPlan!} />
                  <div>
                    <div className="font-medium text-sm">Текущий план</div>
                    <div className="text-xs text-slate-500">{currentPlanData.display_name}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {Math.round(currentPlanData.price_monthly / 100)}₽/мес
                </div>
              </div>
            )}
            
            {requiredPlanData && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2">
                  <PlanIcon plan={requiredPlan} />
                  <div>
                    <div className="font-medium text-sm">Требуется план</div>
                    <div className="text-xs text-purple-600">{requiredPlanData.display_name}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-purple-700">
                  {Math.round(requiredPlanData.price_monthly / 100)}₽/мес
                </div>
              </div>
            )}
          </div>
          
          {/* Преимущества */}
          {requiredPlanData && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Что вы получите:</h4>
              <div className="space-y-1">
                {requiredPlanData.features?.slice(0, 3).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Действия */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => onUpgrade(requiredPlanData?.id)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {upgradeButtonText || (!isActive ? 'Оформить подписку' : 'Улучшить план')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Позже
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// 4. UPGRADE MODAL
// ============================================================================

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: PlanName;
  plans: any[];
  onUpgrade: (planId: string, billingCycle?: 'monthly' | 'annual') => Promise<void>;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  requiredPlan,
  plans,
  onUpgrade
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [upgrading, setUpgrading] = useState(false);
  
  const getPlanHierarchy = (planName: PlanName): number => {
    const hierarchy: Record<PlanName, number> = {
      starter: 1,
      professional: 2,
      enterprise: 3
    };
    return hierarchy[planName] || 0;
  };
  
  const availablePlans = plans.filter(plan => 
    getPlanHierarchy(plan.name) >= getPlanHierarchy(requiredPlan)
  );

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(true);
      await onUpgrade(planId, billingCycle);
      onClose();
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Выберите план подписки
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Переключатель периода */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Ежегодно
                <Badge className="ml-1 text-xs bg-green-100 text-green-800">-17%</Badge>
              </button>
            </div>
          </div>
          
          {/* Планы */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePlans.map(plan => (
              <PlanModalCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isRecommended={plan.name === requiredPlan}
                onSelect={() => handleUpgrade(plan.id)}
                upgrading={upgrading}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// 5. PLAN MODAL CARD
// ============================================================================

interface PlanModalCardProps {
  plan: any;
  billingCycle: 'monthly' | 'annual';
  isRecommended: boolean;
  onSelect: () => void;
  upgrading: boolean;
}

const PlanModalCard: React.FC<PlanModalCardProps> = ({
  plan,
  billingCycle,
  isRecommended,
  onSelect,
  upgrading
}) => {
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;
  const displayPrice = Math.round(price / 100);
  const monthlyPrice = billingCycle === 'annual' ? Math.round(price / 100 / 12) : displayPrice;

  return (
    <div className={`relative rounded-lg border-2 p-4 ${
      isRecommended 
        ? 'border-purple-500 bg-purple-50' 
        : 'border-slate-200 bg-white hover:border-purple-300'
    } transition-colors`}>
      {isRecommended && (
        <Badge className="absolute -top-2 left-4 bg-purple-500 text-white">
          Рекомендуется
        </Badge>
      )}
      
      <div className="text-center space-y-3">
        <PlanIcon plan={plan.name} className="mx-auto" />
        
        <div>
          <h3 className="font-semibold text-lg">{plan.display_name}</h3>
          <p className="text-sm text-slate-600">{plan.description}</p>
        </div>
        
        <div>
          <div className="text-2xl font-bold">
            {billingCycle === 'annual' ? monthlyPrice : displayPrice}₽
          </div>
          <div className="text-sm text-slate-500">
            {billingCycle === 'annual' ? 'в месяц (при годовой оплате)' : 'в месяц'}
          </div>
        </div>
        
        <div className="space-y-1 text-left">
          <div className="text-sm font-medium">Включено:</div>
          <div className="text-sm">
            <strong>{plan.factory_limit}</strong> фабрик
          </div>
          <div className="text-sm">
            <strong>{plan.rfq_limit || 'Безлимит'}</strong> RFQ запросов
          </div>
        </div>
        
        <Button
          onClick={onSelect}
          disabled={upgrading}
          className={`w-full ${
            isRecommended 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
              : ''
          }`}
          variant={isRecommended ? 'default' : 'outline'}
        >
          {upgrading ? 'Оформление...' : 'Выбрать план'}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// 6. PLAN ICON COMPONENT
// ============================================================================

export const PlanIcon: React.FC<{ plan: PlanName; className?: string }> = ({ 
  plan, 
  className = "h-8 w-8" 
}) => {
  const iconProps = { className };
  
  switch (plan) {
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
