// ============================================================================
// USAGE ANALYTICS COMPONENT
// ============================================================================
// Компонент аналитики использования подписки
// ============================================================================

'use client';

import React from 'react';
import { useSubscriptionContext, useUsageStats } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Factory, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ АНАЛИТИКИ
// ============================================================================

export const UsageAnalytics: React.FC = () => {
  const { limits, subscription } = useSubscriptionContext();
  const usageStats = useUsageStats();

  if (!limits || !subscription) {
    return <NoDataState />;
  }

  return (
    <div className="space-y-6">
      {/* Обзор использования */}
      <UsageOverviewCard limits={limits} usageStats={usageStats} />
      
      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FactoryUsageCard limits={limits} />
        <RfqUsageCard limits={limits} />
      </div>
      
      {/* Рекомендации */}
      <RecommendationsCard limits={limits} />
      
      {/* Исторические данные */}
      <HistoricalDataCard />
    </div>
  );
};

// ============================================================================
// 2. КАРТОЧКА ОБЗОРА ИСПОЛЬЗОВАНИЯ
// ============================================================================

interface UsageOverviewCardProps {
  limits: any;
  usageStats: any;
}

const UsageOverviewCard: React.FC<UsageOverviewCardProps> = ({ 
  limits, 
  usageStats 
}) => {
  const getUsageStatus = (percentage: number | null) => {
    if (percentage === null) return { color: 'blue', label: 'Безлимит' };
    if (percentage >= 90) return { color: 'red', label: 'Критично' };
    if (percentage >= 75) return { color: 'orange', label: 'Высокое' };
    if (percentage >= 50) return { color: 'yellow', label: 'Среднее' };
    return { color: 'green', label: 'Низкое' };
  };

  const factoryStatus = getUsageStatus(usageStats?.factory.percentage);
  const rfqStatus = getUsageStatus(usageStats?.rfq.percentage);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Обзор использования
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Общая активность */}
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {limits.factories_used + limits.rfq_used}
            </div>
            <div className="text-sm text-slate-600">Всего действий</div>
          </div>
          
          {/* Фабрики */}
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Factory className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {usageStats?.factory.percentage || 0}%
            </div>
            <div className="text-sm text-slate-600">Фабрики</div>
            <Badge 
              variant="outline" 
              className={`mt-1 text-xs border-${factoryStatus.color}-200 text-${factoryStatus.color}-700`}
            >
              {factoryStatus.label}
            </Badge>
          </div>
          
          {/* RFQ */}
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {usageStats?.rfq.percentage !== null ? `${usageStats.rfq.percentage}%` : '∞'}
            </div>
            <div className="text-sm text-slate-600">RFQ запросы</div>
            <Badge 
              variant="outline" 
              className={`mt-1 text-xs border-${rfqStatus.color}-200 text-${rfqStatus.color}-700`}
            >
              {rfqStatus.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. КАРТОЧКА ИСПОЛЬЗОВАНИЯ ФАБРИК
// ============================================================================

interface FactoryUsageCardProps {
  limits: any;
}

const FactoryUsageCard: React.FC<FactoryUsageCardProps> = ({ limits }) => {
  const percentage = limits.factories_limit > 0 
    ? Math.round((limits.factories_used / limits.factories_limit) * 100)
    : 0;

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-orange-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-blue-500" />
          Использование фабрик
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {limits.factories_used} / {limits.factories_limit}
          </div>
          <div className="text-sm text-slate-600 mb-4">
            Использовано фабрик
          </div>
          
          <Progress value={percentage} className="h-3 mb-2" />
          
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>0</span>
            <span className="font-medium">{percentage}%</span>
            <span>{limits.factories_limit}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {limits.factories_remaining}
            </div>
            <div className="text-xs text-slate-500">Осталось</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {limits.factories_used}
            </div>
            <div className="text-xs text-slate-500">Использовано</div>
          </div>
        </div>
        
        {percentage >= 80 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Приближаетесь к лимиту</span>
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Рассмотрите возможность апгрейда плана
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 4. КАРТОЧКА ИСПОЛЬЗОВАНИЯ RFQ
// ============================================================================

interface RfqUsageCardProps {
  limits: any;
}

const RfqUsageCard: React.FC<RfqUsageCardProps> = ({ limits }) => {
  const percentage = limits.rfq_limit !== null && limits.rfq_limit > 0
    ? Math.round((limits.rfq_used / limits.rfq_limit) * 100)
    : null;

  const isUnlimited = limits.rfq_limit === null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-500" />
          RFQ запросы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {limits.rfq_used} {isUnlimited ? '' : `/ ${limits.rfq_limit}`}
          </div>
          <div className="text-sm text-slate-600 mb-4">
            {isUnlimited ? 'Безлимитные RFQ' : 'RFQ за месяц'}
          </div>
          
          {!isUnlimited && percentage !== null ? (
            <>
              <Progress value={percentage} className="h-3 mb-2" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>0</span>
                <span className="font-medium">{percentage}%</span>
                <span>{limits.rfq_limit}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 text-blue-600">
              <div className="text-2xl">∞</div>
              <div className="text-sm">Безлимит</div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {isUnlimited ? '∞' : limits.rfq_remaining}
            </div>
            <div className="text-xs text-slate-500">Осталось</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {limits.rfq_used}
            </div>
            <div className="text-xs text-slate-500">Использовано</div>
          </div>
        </div>
        
        {!isUnlimited && percentage !== null && percentage >= 80 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Приближаетесь к лимиту</span>
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Рассмотрите апгрейд до безлимитного плана
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 5. КАРТОЧКА РЕКОМЕНДАЦИЙ
// ============================================================================

interface RecommendationsCardProps {
  limits: any;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ limits }) => {
  const recommendations = getRecommendations(limits);

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="text-center py-8">
          <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Отличное использование!
          </h3>
          <p className="text-green-600">
            Вы эффективно используете свой план подписки
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg"
            >
              <div className={`p-2 rounded-full ${rec.color}`}>
                {rec.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-800 mb-1">
                  {rec.title}
                </h4>
                <p className="text-sm text-slate-600">
                  {rec.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 6. КАРТОЧКА ИСТОРИЧЕСКИХ ДАННЫХ
// ============================================================================

const HistoricalDataCard: React.FC = () => {
  // Моковые исторические данные
  const historicalData = [
    { month: 'Январь', factories: 12, rfq: 8 },
    { month: 'Февраль', factories: 18, rfq: 12 },
    { month: 'Март', factories: 15, rfq: 10 },
    { month: 'Апрель', factories: 22, rfq: 15 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          История использования
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historicalData.map((data, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
            >
              <div className="font-medium text-slate-800">
                {data.month}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-blue-500" />
                  <span>{data.factories} фабрик</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>{data.rfq} RFQ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 7. СОСТОЯНИЕ БЕЗ ДАННЫХ
// ============================================================================

const NoDataState: React.FC = () => (
  <Card>
    <CardContent className="text-center py-12">
      <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-600 mb-2">
        Нет данных для аналитики
      </h3>
      <p className="text-slate-500">
        Аналитика будет доступна после активации подписки и начала использования сервиса
      </p>
    </CardContent>
  </Card>
);

// ============================================================================
// 8. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

const getRecommendations = (limits: any) => {
  const recommendations = [];
  
  const factoryUsage = limits.factories_limit > 0 
    ? (limits.factories_used / limits.factories_limit) * 100
    : 0;
    
  const rfqUsage = limits.rfq_limit !== null && limits.rfq_limit > 0
    ? (limits.rfq_used / limits.rfq_limit) * 100
    : 0;

  if (factoryUsage >= 90) {
    recommendations.push({
      title: 'Лимит фабрик почти исчерпан',
      description: 'Рассмотрите апгрейд плана для доступа к большему количеству фабрик',
      icon: <AlertTriangle className="h-4 w-4 text-white" />,
      color: 'bg-red-500'
    });
  } else if (factoryUsage >= 75) {
    recommendations.push({
      title: 'Высокое использование фабрик',
      description: 'Вы активно используете доступ к фабрикам. Подумайте об апгрейде для большего лимита',
      icon: <TrendingUp className="h-4 w-4 text-white" />,
      color: 'bg-orange-500'
    });
  }

  if (limits.rfq_limit !== null && rfqUsage >= 90) {
    recommendations.push({
      title: 'Лимит RFQ почти исчерпан',
      description: 'Переходите на план с безлимитными RFQ запросами',
      icon: <AlertTriangle className="h-4 w-4 text-white" />,
      color: 'bg-red-500'
    });
  }

  if (factoryUsage < 25 && rfqUsage < 25) {
    recommendations.push({
      title: 'Низкое использование',
      description: 'Вы используете малую часть доступных возможностей. Рассмотрите план с меньшим лимитом',
      icon: <TrendingDown className="h-4 w-4 text-white" />,
      color: 'bg-blue-500'
    });
  }

  return recommendations;
};

// ============================================================================
// 9. ЭКСПОРТ
// ============================================================================

export default UsageAnalytics;
