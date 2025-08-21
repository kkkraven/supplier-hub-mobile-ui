'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Send, DollarSign, Clock, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RFQ, RFQQuote } from '@/types/rfq';

interface QuoteFormProps {
  rfq: RFQ;
  factoryId: string;
  onSubmit: (quoteData: QuoteFormData) => Promise<void>;
  existingQuote?: RFQQuote;
}

const quoteFormSchema = z.object({
  price: z.coerce.number().min(0.01, { message: 'Цена должна быть больше 0' }),
  currency: z.enum(['USD', 'EUR', 'CNY', 'RUB'], { required_error: 'Выберите валюту' }),
  lead_time_days: z.coerce.number().min(1, { message: 'Срок поставки должен быть не менее 1 дня' }),
  moq_units: z.coerce.number().min(1, { message: 'Минимальный объем заказа должен быть не менее 1' }),
  description: z.string().min(10, { message: 'Описание должно содержать не менее 10 символов' }).max(2000, { message: 'Описание не должно превышать 2000 символов' }),
  terms_conditions: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

export const QuoteForm: React.FC<QuoteFormProps> = ({
  rfq,
  factoryId,
  onSubmit,
  existingQuote
}) => {
  const { toast } = useToast();
  const [isSubmitting, setSubmitting] = useState(false);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      price: existingQuote?.price || 0,
      currency: existingQuote?.currency || 'USD',
      lead_time_days: existingQuote?.lead_time_days || 30,
      moq_units: existingQuote?.moq_units || 1,
      description: existingQuote?.description || '',
      terms_conditions: existingQuote?.terms_conditions || '',
    },
  });

  const handleSubmit = async (data: QuoteFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
      toast({
        title: 'Предложение отправлено',
        description: 'Ваше предложение успешно отправлено заказчику',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить предложение',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Информация о RFQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Информация о запросе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
            <p className="text-gray-600 mt-1">{rfq.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Количество:</span>
              <span className="font-medium">{rfq.quantity.toLocaleString()} шт.</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">Дедлайн:</span>
              <span className="font-medium">{new Date(rfq.deadline).toLocaleDateString('ru-RU')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={rfq.priority === 'high' ? 'bg-red-100 text-red-700' : rfq.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                {rfq.priority === 'high' ? 'Высокий' : rfq.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Форма предложения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {existingQuote ? 'Редактировать предложение' : 'Создать предложение'}
          </CardTitle>
          <CardDescription>
            Заполните детали вашего предложения для этого запроса
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Цена и валюта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Цена за единицу *</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('price')}
                    className="pl-8"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {form.formState.errors.price && (
                  <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Валюта *</Label>
                <Select
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value as 'USD' | 'EUR' | 'CNY' | 'RUB')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - Доллар США</SelectItem>
                    <SelectItem value="EUR">EUR - Евро</SelectItem>
                    <SelectItem value="CNY">CNY - Китайский юань</SelectItem>
                    <SelectItem value="RUB">RUB - Российский рубль</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.currency && (
                  <p className="text-sm text-red-600">{form.formState.errors.currency.message}</p>
                )}
              </div>
            </div>

            {/* Сроки и объемы */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead_time_days">Срок поставки (дни) *</Label>
                <div className="relative">
                  <Input
                    id="lead_time_days"
                    type="number"
                    min="1"
                    placeholder="30"
                    {...form.register('lead_time_days')}
                    className="pl-8"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {form.formState.errors.lead_time_days && (
                  <p className="text-sm text-red-600">{form.formState.errors.lead_time_days.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="moq_units">Минимальный объем заказа (шт.) *</Label>
                <div className="relative">
                  <Input
                    id="moq_units"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...form.register('moq_units')}
                    className="pl-8"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {form.formState.errors.moq_units && (
                  <p className="text-sm text-red-600">{form.formState.errors.moq_units.message}</p>
                )}
              </div>
            </div>

            {/* Описание предложения */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание предложения *</Label>
              <Textarea
                id="description"
                placeholder="Опишите ваше предложение, включая технические характеристики, качество, дополнительные услуги..."
                rows={4}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Условия и положения */}
            <div className="space-y-2">
              <Label htmlFor="terms_conditions">Условия и положения</Label>
              <Textarea
                id="terms_conditions"
                placeholder="Укажите особые условия поставки, оплаты, гарантии и другие важные детали..."
                rows={3}
                {...form.register('terms_conditions')}
              />
              <p className="text-sm text-gray-500">
                Необязательное поле для дополнительных условий
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {existingQuote ? 'Обновить предложение' : 'Отправить предложение'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Информация о статусе */}
      {existingQuote && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-800">
              <Badge className={existingQuote.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : existingQuote.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {existingQuote.status === 'pending' ? 'Ожидает рассмотрения' : existingQuote.status === 'accepted' ? 'Принято' : 'Отклонено'}
              </Badge>
              <span className="text-sm">
                Предложение создано {new Date(existingQuote.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


