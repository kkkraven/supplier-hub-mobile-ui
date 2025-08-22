// ============================================================================
// LIMITS DISPLAY COMPONENT
// ============================================================================
// Компонент для отображения лимитов пользователя
// ============================================================================

'use client';

import React from 'react';
import { useSubscriptionContext, useUsageStats } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Factory, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Crown,
  Infinity
} from 'lucide-react';
import type { LimitsDisplayProps } from '@/types/subscription';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ ОТОБРАЖЕНИЯ ЛИМИТОВ
// ============================================================================

export const LimitsDisplay: React.FC<LimitsDisplayProps> = ({
  showUpgradeButton = true,
  onUpgrade,
  className = ''
}) => {
  const { limits, loading, error, upgrade } = useSubscriptionContext();
  const usageStats = useUsageStats();

  if (loading) {
    return <LimitsSkeleton />;
  }

  if (error) {
    return <LimitsError error={error} />;
  }

  if (!limits) {
    return <NoSubscriptionCard onUpgrade={onUpgrade} />;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Автоматически выбираем следующий план
      const nextPlan = limits.plan_name === 'Starter' ? 'professional' : 'enterprise';
      upgrade('plan-id-' + nextPlan, 'monthly'); // В реальном приложении ID будет из БД
    }
  };

  return (
    <div className={`limits-display space-y-4 ${className}`}>
      {/* Заголовок с планом */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">
                План: {limits.plan_name}
              </CardTitle>
            </div>
            <Badge 
              variant={limits.subscription_active ? "default" : "destructive"}
              className="text-xs"
            >
              {limits.subscription_active ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Лимиты фабрик */}
      <LimitCard
        title="Доступ к фабрикам"
        icon={<Factory className="h-5 w-5" />}
        used={limits.factories_used}
        limit={limits.factories_limit}
        remaining={limits.factories_remaining}
        unit="фабрик"
        color="blue"
        description="Количество фабрик, к которым у вас есть доступ"
      />

      {/* Лимиты RFQ */}
      <LimitCard
        title="RFQ запросы"
        icon={<FileText className="h-5 w-5" />}
        used={limits.rfq_used}
        limit={limits.rfq_limit}
        remaining={limits.rfq_remaining}
        unit="запросов"
        color="green"
        description="Количество RFQ запросов за текущий месяц"
        isUnlimited={limits.rfq_limit === null}
      />

      {/* Статистика использования */}
      {usageStats && (
        <UsageStatsCard stats={usageStats} />
      )}

      {/* Кнопка апгрейда */}
      {showUpgradeButton && (
        <UpgradePrompt
          limits={limits}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
};

// ============================================================================
// 2. КАРТОЧКА ЛИМИТА
// ============================================================================

interface LimitCardProps {
  title: string;
  icon: React.ReactNode;
  used: number;
  limit: number | null;
  remaining: number | null;
  unit: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description?: string;
  isUnlimited?: boolean;
}

const LimitCard: React.FC<LimitCardProps> = ({
  title,
  icon,
  used,
  limit,
  remaining,
  unit,
  color,
  description,
  isUnlimited = false
}) => {
  const percentage = limit && limit > 0 ? (used / limit) * 100 : 0;
  
  const getStatusColor = () => {
    if (isUnlimited) return 'text-blue-600';
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isUnlimited) return <Infinity className="h-4 w-4 text-blue-500" />;
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Числовые показатели */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Использовано:</span>
            <span className="font-medium">{used} {unit}</span>
          </div>
          
          {!isUnlimited && limit !== null && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Лимит:</span>
                <span className="font-medium">{limit} {unit}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Осталось:</span>
                <span className={`font-medium ${getStatusColor()}`}>
                  {remaining || 0} {unit}
                </span>
              </div>
              
              {/* Прогресс-бар */}
              <div className="space-y-2">
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>0</span>
                  <span className={getStatusColor()}>
                    {Math.round(percentage)}%
                  </span>
                  <span>{limit}</span>
                </div>
              </div>
            </>
          )}
          
          {isUnlimited && (
            <div className="flex items-center justify-center gap-2 py-2 text-blue-600">
              <Infinity className="h-4 w-4" />
              <span className="text-sm font-medium">Безлимит</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. СТАТИСТИКА ИСПОЛЬЗОВАНИЯ
// ============================================================================

interface UsageStatsCardProps {
  stats: {
    factory: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    };
    rfq: {
      used: number;
      limit: number | null;
      remaining: number | null;
      percentage: number | null;
    };
  };
}

const UsageStatsCard: React.FC<UsageStatsCardProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-600" />
          <CardTitle className="text-base">Статистика использования</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.factory.percentage}%
            </div>
            <div className="text-xs text-slate-600">Фабрики</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.rfq.percentage !== null ? `${stats.rfq.percentage}%` : '∞'}
            </div>
            <div className="text-xs text-slate-600">RFQ</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-slate-500 text-center">
          Статистика обновляется в реальном времени
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 4. ПРЕДЛОЖЕНИЕ АПГРЕЙДА
// ============================================================================

interface UpgradePromptProps {
  limits: any;
  onUpgrade: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ limits, onUpgrade }) => {
  const shouldShowUpgrade = 
    limits.factories_remaining === 0 || 
    (limits.rfq_limit !== null && limits.rfq_remaining === 0) ||
    (limits.factories_used / limits.factories_limit) >= 0.8;

  if (!shouldShowUpgrade) return null;

  const getUpgradeReason = () => {
    if (limits.factories_remaining === 0) {
      return 'Исчерпан лимит доступа к фабрикам';
    }
    if (limits.rfq_limit !== null && limits.rfq_remaining === 0) {
      return 'Исчерпан лимит RFQ запросов';
    }
    return 'Близко к исчерпанию лимитов';
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800">
              Рекомендуем улучшить план
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              {getUpgradeReason()}
            </p>
          </div>
          <Button 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            Улучшить план
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 5. СОСТОЯНИЯ ЗАГРУЗКИ И ОШИБОК
// ============================================================================

const LimitsSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-slate-200 rounded-lg animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
            <div className="h-2 bg-slate-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const LimitsError: React.FC<{ error: string }> = ({ error }) => (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="text-center p-6">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
      <h3 className="font-semibold text-red-800 mb-2">
        Ошибка загрузки лимитов
      </h3>
      <p className="text-sm text-red-700">{error}</p>
    </CardContent>
  </Card>
);

const NoSubscriptionCard: React.FC<{ onUpgrade?: () => void }> = ({ onUpgrade }) => (
  <Card className="border-slate-200 bg-slate-50">
    <CardContent className="text-center p-6">
      <Crown className="h-8 w-8 text-slate-400 mx-auto mb-3" />
      <h3 className="font-semibold text-slate-800 mb-2">
        Нет активной подписки
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        Оформите подписку для доступа к фабрикам и RFQ запросам
      </p>
      {onUpgrade && (
        <Button onClick={onUpgrade}>
          Выбрать план
        </Button>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// 6. ЭКСПОРТ
// ============================================================================

export default LimitsDisplay;
