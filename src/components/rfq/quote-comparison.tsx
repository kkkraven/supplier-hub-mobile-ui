'use client';

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Clock, 
  Package, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Star,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RFQQuote, QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/types/rfq';

interface QuoteComparisonProps {
  quotes: RFQQuote[];
  onUpdateStatus: (quoteId: string, status: 'accepted' | 'rejected') => Promise<void>;
}

export const QuoteComparison: React.FC<QuoteComparisonProps> = ({
  quotes,
  onUpdateStatus
}) => {
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'price' | 'lead_time' | 'moq'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Фильтрация и сортировка предложений
  const filteredQuotes = useMemo(() => {
    let filtered = quotes.filter(quote => quote.status === 'pending');
    
    // Сортировка
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'lead_time':
          aValue = a.lead_time_days;
          bValue = b.lead_time_days;
          break;
        case 'moq':
          aValue = a.moq_units;
          bValue = b.moq_units;
          break;
        default:
          aValue = a.price;
          bValue = b.price;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return filtered;
  }, [quotes, sortBy, sortOrder]);

  // Обработка выбора предложений
  const handleQuoteSelection = (quoteId: string, checked: boolean) => {
    const newSelected = new Set(selectedQuotes);
    if (checked) {
      newSelected.add(quoteId);
    } else {
      newSelected.delete(quoteId);
    }
    setSelectedQuotes(newSelected);
  };

  // Выбрать все предложения
  const selectAll = () => {
    setSelectedQuotes(new Set(filteredQuotes.map(q => q.id)));
  };

  // Снять выбор со всех предложений
  const deselectAll = () => {
    setSelectedQuotes(new Set());
  };

  // Обработка изменения статуса
  const handleStatusUpdate = async (quoteId: string, status: 'accepted' | 'rejected') => {
    try {
      await onUpdateStatus(quoteId, status);
      // Удаляем из выбранных после изменения статуса
      const newSelected = new Set(selectedQuotes);
      newSelected.delete(quoteId);
      setSelectedQuotes(newSelected);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  // Найти лучшие значения для каждого параметра
  const bestValues = useMemo(() => {
    if (filteredQuotes.length === 0) return null;
    
    const prices = filteredQuotes.map(q => q.price);
    const leadTimes = filteredQuotes.map(q => q.lead_time_days);
    const moqs = filteredQuotes.map(q => q.moq_units);
    
    return {
      minPrice: Math.min(...prices),
      minLeadTime: Math.min(...leadTimes),
      minMoq: Math.min(...moqs),
    };
  }, [filteredQuotes]);

  if (filteredQuotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет предложений для сравнения</h3>
          <p className="text-gray-500">
            Все предложения уже обработаны или нет активных предложений
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Сравнение предложений
              </CardTitle>
              <CardDescription>
                Сравните предложения от разных фабрик и выберите лучшие
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAll}
              >
                Выбрать все
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={deselectAll}
              >
                Снять выбор
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Фильтры сортировки */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Сортировка по:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'lead_time' | 'moq')}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="price">Цена</option>
                <option value="lead_time">Срок поставки</option>
                <option value="moq">Мин. объем</option>
              </select>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Статистика */}
          {bestValues && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {bestValues.minPrice.toLocaleString()} USD
                </div>
                <div className="text-sm text-green-600">Лучшая цена</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {bestValues.minLeadTime} дней
                </div>
                <div className="text-sm text-blue-600">Быстрейшая поставка</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {bestValues.minMoq} шт.
                </div>
                <div className="text-sm text-purple-600">Мин. объем</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица сравнения */}
      <Card>
        <CardHeader>
          <CardTitle>Детальное сравнение</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Checkbox
                      checked={selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAll();
                        } else {
                          deselectAll();
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-3">Фабрика</th>
                  <th className="text-left p-3">Цена (USD)</th>
                  <th className="text-left p-3">Срок поставки</th>
                  <th className="text-left p-3">Мин. объем</th>
                  <th className="text-left p-3">Статус</th>
                  <th className="text-left p-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote, index) => {
                  const isBestPrice = bestValues && quote.price === bestValues.minPrice;
                  const isBestLeadTime = bestValues && quote.lead_time_days === bestValues.minLeadTime;
                  const isBestMoq = bestValues && quote.moq_units === bestValues.minMoq;
                  
                  return (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedQuotes.has(quote.id)}
                          onCheckedChange={(checked) => 
                            handleQuoteSelection(quote.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {quote.factory?.legal_name_cn || 'Неизвестная фабрика'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {quote.factory?.city}, {quote.factory?.segment}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {quote.price.toLocaleString()}
                          </span>
                          {isBestPrice && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Лучшая
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{quote.lead_time_days} дней</span>
                          {isBestLeadTime && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              Быстрейшая
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{quote.moq_units} шт.</span>
                          {isBestMoq && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              Мин. объем
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                          {QUOTE_STATUS_LABELS[quote.status]}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(quote.id, 'accepted')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Принять
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Выбранные предложения */}
      {selectedQuotes.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Выбрано предложений: {selectedQuotes.size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredQuotes
                .filter(quote => selectedQuotes.has(quote.id))
                .map(quote => (
                  <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {quote.factory?.legal_name_cn || 'Неизвестная фабрика'}
                      </span>
                      <span className="text-gray-500">
                        {quote.price.toLocaleString()} USD
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(quote.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Принять
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


