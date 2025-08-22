// ============================================================================
// SUBSCRIPTION OVERVIEW COMPONENT
// ============================================================================
// Компонент обзора подписки на странице аккаунта
// ============================================================================

'use client';

import React from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ ОБЗОРА ПОДПИСКИ
// ============================================================================

export const SubscriptionOverview: React.FC = () => {
  const { subscription, limits, isActive, loading } = useSubscriptionContext();

  if (loading) {
    return <SubscriptionOverviewSkeleton />;
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-500" />
          Обзор подписки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription && isActive ? (
          <>
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {subscription.plan_display_name}
                </div>
                <div className="text-sm text-slate-500">Текущий план</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {subscription.days_remaining || 0}
                </div>
                <div className="text-sm text-slate-500">Дней осталось</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Math.round(subscription.price_monthly / 100)}₽
                </div>
                <div className="text-sm text-slate-500">В месяц</div>
              </div>
            </div>

            {/* Статус и период */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Подписка активна</div>
                    <div className="text-sm text-slate-500">
                      Действует до {' '}
                      {subscription.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'неопределенного срока'
                      }
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Активна
                </Badge>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium text-orange-800">Подписка будет отменена</div>
                      <div className="text-sm text-orange-600">
                        Отмена произойдет в конце текущего периода
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-orange-500 text-orange-700">
                    Отменяется
                  </Badge>
                </div>
              )}
            </div>

            {/* Прогресс периода */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Период подписки</span>
                <span className="text-sm text-slate-500">
                  {subscription.days_remaining} из {' '}
                  {subscription.current_period_start && subscription.current_period_end
                    ? Math.ceil(
                        (new Date(subscription.current_period_end).getTime() - 
                         new Date(subscription.current_period_start).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )
                    : '—'
                  } дней
                </span>
              </div>
              
              {subscription.current_period_start && subscription.current_period_end && (
                <Progress 
                  value={calculatePeriodProgress(
                    subscription.current_period_start, 
                    subscription.current_period_end
                  )} 
                  className="h-2"
                />
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {subscription.current_period_start 
                    ? new Date(subscription.current_period_start).toLocaleDateString('ru-RU')
                    : '—'
                  }
                </span>
                <span>
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString('ru-RU')
                    : '—'
                  }
                </span>
              </div>
            </div>

            {/* Функции плана */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">Включено в план:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.features?.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {subscription.features && subscription.features.length > 6 && (
                  <div className="text-sm text-slate-500 col-span-full">
                    и еще {subscription.features.length - 6} функций...
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <NoActiveSubscriptionState />
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

const calculatePeriodProgress = (startDate: string, endDate: string): number => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  const progress = (elapsed / totalDuration) * 100;
  return Math.max(0, Math.min(100, progress));
};

// ============================================================================
// 3. СОСТОЯНИЕ БЕЗ ПОДПИСКИ
// ============================================================================

const NoActiveSubscriptionState: React.FC = () => (
  <div className="text-center py-12">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-200 to-slate-300">
      <Crown className="h-8 w-8 text-slate-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">
      Нет активной подписки
    </h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">
      Выберите подходящий план для получения доступа к базе фабрик и RFQ системе
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      <div className="p-4 border border-slate-200 rounded-lg">
        <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
        <div className="font-medium text-sm">Starter</div>
        <div className="text-xs text-slate-500">20 фабрик</div>
      </div>
      <div className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50">
        <Crown className="h-6 w-6 text-purple-500 mx-auto mb-2" />
        <div className="font-medium text-sm">Professional</div>
        <div className="text-xs text-slate-500">70+ фабрик</div>
        <Badge className="mt-2 text-xs bg-purple-500">Популярный</Badge>
      </div>
      <div className="p-4 border border-slate-200 rounded-lg">
        <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
        <div className="font-medium text-sm">Enterprise</div>
        <div className="text-xs text-slate-500">Все функции</div>
      </div>
    </div>
  </div>
);

// ============================================================================
// 4. СКЕЛЕТОН ЗАГРУЗКИ
// ============================================================================

const SubscriptionOverviewSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-2 bg-slate-200 rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// 5. ЭКСПОРТ
// ============================================================================

export default SubscriptionOverview;
