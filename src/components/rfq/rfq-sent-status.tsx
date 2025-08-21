'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Building2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RFQSentFactory, SENT_STATUS_LABELS, SENT_STATUS_COLORS } from '@/types/rfq';

interface RFQSentStatusProps {
  rfqId: string;
  sentFactories: RFQSentFactory[];
  onRefresh?: () => void;
}

export const RFQSentStatus: React.FC<RFQSentStatusProps> = ({
  rfqId,
  sentFactories,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Статистика по статусам
  const getStatusStats = () => {
    const stats = {
      sent: 0,
      delivered: 0,
      read: 0,
      error: 0
    };

    sentFactories.forEach(factory => {
      stats[factory.status]++;
    });

    return stats;
  };

  const stats = getStatusStats();
  const totalSent = sentFactories.length;

  // Обработка обновления статуса
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Получение иконки для статуса
  const getStatusIcon = (status: RFQSentFactory['status']) => {
    switch (status) {
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (sentFactories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">RFQ не отправлен</h3>
          <p className="text-gray-500">
            Этот RFQ еще не был отправлен фабрикам
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Статус отправки RFQ
              </CardTitle>
              <CardDescription>
                Отслеживание доставки запроса на предложение фабрикам
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
              <div className="text-sm text-blue-600">Отправлено</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-sm text-green-600">Доставлено</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.read}</div>
              <div className="text-sm text-purple-600">Прочитано</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-red-600">Ошибки</div>
            </div>
          </div>

          {/* Прогресс */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Общий прогресс</span>
              <span>{totalSent} фабрик</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${totalSent > 0 ? (stats.delivered + stats.read) / totalSent * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список фабрик */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Детали отправки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentFactories.map((sentFactory) => (
              <div
                key={sentFactory.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(sentFactory.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {sentFactory.factory?.legal_name_cn || 'Неизвестная фабрика'}
                      </h4>
                      <Badge className={SENT_STATUS_COLORS[sentFactory.status]}>
                        {SENT_STATUS_LABELS[sentFactory.status]}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Email:</span>
                        <span>{sentFactory.email}</span>
                      </div>
                      
                      {sentFactory.factory?.contact_person && (
                        <div className="flex items-center gap-2">
                          <span>Контакт:</span>
                          <span>{sentFactory.factory.contact_person}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span>Отправлено:</span>
                        <span>
                          {format(new Date(sentFactory.sent_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sentFactory.status === 'error' && sentFactory.error_message && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{sentFactory.error_message}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Рекомендации */}
      {stats.error > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              Рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-orange-700 space-y-2">
              <p>Обнаружены ошибки при отправке RFQ некоторым фабрикам:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Проверьте корректность email адресов фабрик</li>
                <li>Убедитесь, что фабрики активны в системе</li>
                <li>Попробуйте отправить RFQ повторно через некоторое время</li>
                <li>Свяжитесь с технической поддержкой при повторных ошибках</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
