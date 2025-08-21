'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  DollarSign, 
  Clock, 
  Package, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Eye,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RFQQuote, QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/types/rfq';
import { useToast } from '@/hooks/use-toast';

interface RFQQuotesListProps {
  quotes: RFQQuote[];
  onUpdateStatus: (quoteId: string, status: 'accepted' | 'rejected') => Promise<void>;
  onDeleteQuote: (quoteId: string) => Promise<void>;
}

export const RFQQuotesList: React.FC<RFQQuotesListProps> = ({
  quotes,
  onUpdateStatus,
  onDeleteQuote
}) => {
  const { toast } = useToast();
  const [processingQuote, setProcessingQuote] = useState<string | null>(null);

  // Сортировка предложений по цене (от низкой к высокой)
  const sortedQuotes = [...quotes].sort((a, b) => a.price - b.price);

  // Найти лучшее предложение (самое дешевое)
  const bestQuote = sortedQuotes.length > 0 ? sortedQuotes[0] : null;

  // Обработка изменения статуса
  const handleStatusUpdate = async (quoteId: string, status: 'accepted' | 'rejected') => {
    try {
      setProcessingQuote(quoteId);
      await onUpdateStatus(quoteId, status);
      
      const statusText = status === 'accepted' ? 'принято' : 'отклонено';
      toast({
        title: 'Статус обновлен',
        description: `Предложение ${statusText}`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить статус',
        variant: 'destructive',
      });
    } finally {
      setProcessingQuote(null);
    }
  };

  // Обработка удаления предложения
  const handleDelete = async (quoteId: string) => {
    try {
      await onDeleteQuote(quoteId);
      toast({
        title: 'Предложение удалено',
        description: 'Предложение успешно удалено',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить предложение',
        variant: 'destructive',
      });
    }
  };

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Предложения не найдены</h3>
          <p className="text-gray-500">
            Пока нет предложений от фабрик по этому RFQ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Статистика предложений
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quotes.length}</div>
              <div className="text-sm text-blue-600">Всего предложений</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quotes.filter(q => q.status === 'accepted').length}
              </div>
              <div className="text-sm text-green-600">Принято</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {quotes.filter(q => q.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600">Ожидает</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {quotes.filter(q => q.status === 'rejected').length}
              </div>
              <div className="text-sm text-red-600">Отклонено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список предложений */}
      <div className="space-y-4">
        {sortedQuotes.map((quote, index) => (
          <Card 
            key={quote.id} 
            className={`relative ${
              quote.id === bestQuote?.id ? 'border-green-300 bg-green-50' : ''
            }`}
          >
            {quote.id === bestQuote?.id && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Лучшая цена
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      {quote.factory?.legal_name_cn || 'Неизвестная фабрика'}
                    </h3>
                    {quote.factory?.legal_name_en && (
                      <span className="text-sm text-gray-500">
                        ({quote.factory.legal_name_en})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Получено {format(new Date(quote.created_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {quote.price.toLocaleString()} {quote.currency}
                  </div>
                  <div className="text-sm text-gray-500">за единицу</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Основные параметры */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Срок поставки:</span>
                  <span className="font-medium">{quote.lead_time_days} дней</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Мин. объем:</span>
                  <span className="font-medium">{quote.moq_units} шт.</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Позиция:</span>
                  <span className="font-medium">#{index + 1} из {quotes.length}</span>
                </div>
              </div>

              {/* Описание */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Описание предложения</h4>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{quote.description}</p>
              </div>

              {/* Условия и положения */}
              {quote.terms_conditions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Условия и положения</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{quote.terms_conditions}</p>
                </div>
              )}

              {/* Контактная информация */}
              {quote.factory && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Контактная информация</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{quote.factory.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Контакт:</span>
                      <span className="ml-2">{quote.factory.contact_person}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Город:</span>
                      <span className="ml-2">{quote.factory.city}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Сегмент:</span>
                      <span className="ml-2">{quote.factory.segment}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Действия */}
              {quote.status === 'pending' && (
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(quote.id, 'accepted')}
                    disabled={processingQuote === quote.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Принять
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                    disabled={processingQuote === quote.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Отклонить
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Удалить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить предложение?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите удалить предложение от {quote.factory?.legal_name_cn}? 
                          Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(quote.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};


