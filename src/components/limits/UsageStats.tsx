// ============================================================================
// USAGE STATS COMPONENT
// ============================================================================
// Компонент для отображения статистики использования лимитов
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Factory, 
  FileText, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Infinity
} from 'lucide-react';
import { useUserLimits } from '@/hooks/useUserLimits';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

// ============================================================================
// 1. USAGE STATS COMPONENT
// ============================================================================

export const UsageStats: React.FC = () => {
  const { limits, loading, refetch } = useUserLimits();
  const { subscription, isActive } = useSubscriptionContext();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // ============================================================================
  // 2. LOAD RECENT ACTIVITY
  // ============================================================================

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setLoadingActivity(true);
        
        const response = await fetch('/api/limits/activity');
        const data = await response.json();
        
        if (data.success) {
          setRecentActivity(data.data.activities || []);
        }
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setLoadingActivity(false);
      }
    };

    if (isActive) {
      loadRecentActivity();
    }
  }, [isActive]);

  // ============================================================================
  // 3. LOADING STATE
  // ============================================================================

  if (loading) {
    return <UsageStatsSkeleton />;
  }

  // ============================================================================
  // 4. NO SUBSCRIPTION STATE
  // ============================================================================

  if (!isActive || !limits) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Статистика недоступна
          </h3>
          <p className="text-gray-600 mb-4">
            Активируйте подписку для просмотра статистики использования
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Выбрать план
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // 5. MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UsageCard
          title="Доступ к фабрикам"
          used={limits.factoriesUsed}
          limit={limits.factoriesLimit}
          remaining={limits.factoriesRemaining}
          icon={Factory}
          color="blue"
        />
        
        <UsageCard
          title="RFQ запросы"
          used={limits.rfqUsed}
          limit={limits.rfqLimit}
          remaining={limits.rfqRemaining}
          icon={FileText}
          color="green"
        />
        
        <PlanCard
          planName={subscription?.plan_display_name || 'Unknown'}
          planStatus={subscription?.status || 'inactive'}
          daysRemaining={getDaysRemaining(subscription?.current_period_end)}
        />
        
        <QuickStatsCard limits={limits} />
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab limits={limits} />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <ActivityTab 
            activities={recentActivity} 
            loading={loadingActivity}
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <TrendsTab limits={limits} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ============================================================================
// 6. USAGE CARD COMPONENT
// ============================================================================

interface UsageCardProps {
  title: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const UsageCard: React.FC<UsageCardProps> = ({
  title,
  used,
  limit,
  remaining,
  icon: Icon,
  color
}) => {
  const isUnlimited = limit === null;
  const percentage = limit ? (used / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = remaining !== null && remaining <= 0;

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  return (
    <Card className={`${isAtLimit ? 'border-red-200' : isNearLimit ? 'border-orange-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Icon className={`h-5 w-5 ${colorClasses[color].split(' ')[0]}`} />
          {isUnlimited ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Infinity className="h-3 w-3 mr-1" />
              Безлимит
            </Badge>
          ) : (
            <Badge 
              variant={isAtLimit ? "destructive" : isNearLimit ? "outline" : "secondary"}
              className={isNearLimit && !isAtLimit ? "border-orange-300 text-orange-700" : ""}
            >
              {used} / {limit}
            </Badge>
          )}
        </div>
        
        <h3 className="font-medium text-sm text-gray-900 mb-2">{title}</h3>
        
        {!isUnlimited && (
          <>
            <Progress 
              value={percentage} 
              className={`h-2 mb-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : 'bg-gray-100'}`}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Использовано: {used}</span>
              <span>Осталось: {remaining}</span>
            </div>
          </>
        )}
        
        {isUnlimited && (
          <div className="text-xs text-gray-600">
            Использовано: <span className="font-medium">{used}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 7. PLAN CARD COMPONENT
// ============================================================================

interface PlanCardProps {
  planName: string;
  planStatus: string;
  daysRemaining: number | null;
}

const PlanCard: React.FC<PlanCardProps> = ({
  planName,
  planStatus,
  daysRemaining
}) => {
  const isActive = planStatus === 'active';
  const isExpiring = daysRemaining !== null && daysRemaining <= 7;

  return (
    <Card className={`${!isActive ? 'border-red-200' : isExpiring ? 'border-orange-200' : 'border-purple-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Award className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
          <Badge 
            variant={isActive ? "default" : "destructive"}
            className={isActive ? "bg-purple-600" : ""}
          >
            {isActive ? 'Активен' : 'Неактивен'}
          </Badge>
        </div>
        
        <h3 className="font-medium text-sm text-gray-900 mb-2">
          План: {planName}
        </h3>
        
        {daysRemaining !== null && (
          <div className={`text-xs ${isExpiring ? 'text-orange-600' : 'text-gray-600'}`}>
            {isExpiring ? (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Осталось {daysRemaining} дней</span>
              </div>
            ) : (
              <span>Продлится через {daysRemaining} дней</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 8. QUICK STATS CARD COMPONENT
// ============================================================================

interface QuickStatsCardProps {
  limits: any;
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ limits }) => {
  const totalUsage = limits.factoriesUsed + limits.rfqUsed;
  const efficiency = limits.factoriesLimit 
    ? Math.round((limits.factoriesUsed / limits.factoriesLimit) * 100)
    : 100;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <Badge variant="secondary">
            {efficiency}% эффективность
          </Badge>
        </div>
        
        <h3 className="font-medium text-sm text-gray-900 mb-2">
          Общая активность
        </h3>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div>Всего действий: {totalUsage}</div>
          <div>Эффективность: {efficiency}%</div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 9. OVERVIEW TAB COMPONENT
// ============================================================================

const OverviewTab: React.FC<{ limits: any }> = ({ limits }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Доступ к фабрикам
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Использовано</span>
            <span className="font-medium">{limits.factoriesUsed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Лимит</span>
            <span className="font-medium">{limits.factoriesLimit || 'Безлимит'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Осталось</span>
            <span className="font-medium text-green-600">{limits.factoriesRemaining || 'Безлимит'}</span>
          </div>
          {limits.factoriesLimit && (
            <Progress 
              value={(limits.factoriesUsed / limits.factoriesLimit) * 100} 
              className="h-2"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            RFQ запросы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Использовано</span>
            <span className="font-medium">{limits.rfqUsed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Лимит</span>
            <span className="font-medium">{limits.rfqLimit || 'Безлимит'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Осталось</span>
            <span className="font-medium text-green-600">{limits.rfqRemaining || 'Безлимит'}</span>
          </div>
          {limits.rfqLimit && (
            <Progress 
              value={(limits.rfqUsed / limits.rfqLimit) * 100} 
              className="h-2"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// 10. ACTIVITY TAB COMPONENT
// ============================================================================

interface ActivityTabProps {
  activities: any[];
  loading: boolean;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ activities, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Недавняя активность
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Активность пока отсутствует</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 11. ACTIVITY ITEM COMPONENT
// ============================================================================

const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'factory_access':
        return <Factory className="h-4 w-4 text-blue-600" />;
      case 'rfq_created':
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityText = (action: string, metadata: any) => {
    switch (action) {
      case 'factory_access':
        return 'Получен доступ к фабрике';
      case 'rfq_created':
        return `Создан RFQ: ${metadata?.rfq_title || 'Без названия'}`;
      default:
        return 'Действие выполнено';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.action)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {getActivityText(activity.action, activity.metadata)}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(activity.created_at).toLocaleString('ru-RU')}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// 12. TRENDS TAB COMPONENT
// ============================================================================

const TrendsTab: React.FC<{ limits: any }> = ({ limits }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Анализ использования
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Эффективность использования</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Фабрики</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={limits.factoriesLimit ? (limits.factoriesUsed / limits.factoriesLimit) * 100 : 0} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs text-gray-600">
                    {limits.factoriesLimit ? Math.round((limits.factoriesUsed / limits.factoriesLimit) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">RFQ</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={limits.rfqLimit ? (limits.rfqUsed / limits.rfqLimit) * 100 : 0} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs text-gray-600">
                    {limits.rfqLimit ? Math.round((limits.rfqUsed / limits.rfqLimit) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Рекомендации</h3>
            <div className="space-y-2">
              {limits.factoriesRemaining <= 2 && limits.factoriesLimit && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      Скоро закончатся фабрики
                    </span>
                  </div>
                </div>
              )}
              {limits.rfqRemaining <= 2 && limits.rfqLimit && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      Скоро закончатся RFQ
                    </span>
                  </div>
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Оптимальное использование ресурсов
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 13. USAGE STATS SKELETON
// ============================================================================

const UsageStatsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-5 bg-gray-200 rounded" />
                <div className="h-5 w-12 bg-gray-200 rounded" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-2 bg-gray-200 rounded" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================================
// 14. UTILITY FUNCTIONS
// ============================================================================

const getDaysRemaining = (endDate?: string): number | null => {
  if (!endDate) return null;
  
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// ============================================================================
// 15. EXPORT
// ============================================================================

export default UsageStats;
