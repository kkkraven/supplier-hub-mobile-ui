'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QuoteForm } from '@/components/rfq/quote-form';
import { useRFQ } from '@/hooks/useRFQ';
import { RFQ } from '@/types/rfq';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RFQQuotePage() {
  const params = useParams();
  const rfqId = params.rfqId as string;
  const { toast } = useToast();
  const { fetchRfqById, createQuote } = useRFQ();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        setLoading(true);
        const rfqData = await fetchRfqById(rfqId);
        setRfq(rfqData);
      } catch (error: any) {
        console.error('Ошибка при загрузке RFQ:', error);
        setError(error.message || 'Не удалось загрузить RFQ');
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить RFQ',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (rfqId) {
      loadRFQ();
    }
  }, [rfqId, fetchRfqById, toast]);

  const handleSubmitQuote = async (quoteData: {
    price: number;
    currency: string;
    lead_time_days: number;
    moq_units: number;
    description: string;
    terms_conditions?: string;
  }) => {
    try {
      // Здесь нужно получить factory_id из контекста аутентификации фабрики
      // Пока используем mock factory_id
      const mockFactoryId = 'mock-factory-id';
      
      await createQuote({
        rfq_id: rfqId,
        factory_id: mockFactoryId,
        ...quoteData
      });

      toast({
        title: 'Предложение отправлено',
        description: 'Ваше предложение успешно отправлено',
      });

      // Можно перенаправить на страницу подтверждения
      // router.push(`/rfq/quote/${rfqId}/success`);
    } catch (error: any) {
      console.error('Ошибка при отправке предложения:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить предложение',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-500 mb-4">
              {error || 'RFQ не найден'}
            </p>
            <Link href="/rfq">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к списку
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <Link href="/rfq">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ответ на RFQ</h1>
          <p className="text-gray-600">
            Отправьте ваше предложение по запросу "{rfq.title}"
          </p>
        </div>
      </div>

      {/* Информация о RFQ */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о запросе</CardTitle>
          <CardDescription>
            Детали RFQ, на который вы отвечаете
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Название</label>
              <p className="text-gray-900">{rfq.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Количество</label>
              <p className="text-gray-900">{rfq.quantity.toLocaleString()} шт.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Дедлайн</label>
              <p className="text-gray-900">
                {new Date(rfq.deadline).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Приоритет</label>
              <p className="text-gray-900">{rfq.priority}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Описание</label>
            <p className="text-gray-900 whitespace-pre-wrap">{rfq.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Форма предложения */}
      <QuoteForm
        rfq={rfq}
        onSubmit={handleSubmitQuote}
      />
    </div>
  );
}
