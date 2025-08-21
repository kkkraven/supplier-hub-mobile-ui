'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Save, Send, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { useRFQ } from '@/hooks/useRFQ';
import { RFQ, RFQPriority } from '@/types/rfq';
import { cn } from '@/lib/utils';

// Схема валидации
const rfqSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  quantity: z.number().min(1, 'Количество должно быть больше 0'),
  deadline: z.date({
    required_error: 'Выберите дедлайн',
  }),
  priority: z.enum(['low', 'medium', 'high'] as const),
  category_id: z.string().min(1, 'Выберите категорию'),
});

type RFQFormData = z.infer<typeof rfqSchema>;

interface RFQFormProps {
  rfq?: RFQ; // Для редактирования
  categories: Array<{ id: string; name: string; slug: string }>;
  onSuccess?: (rfq: RFQ) => void;
}

export const RFQForm: React.FC<RFQFormProps> = ({ rfq, categories, onSuccess }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { createRFQ, updateRFQ, uploadAttachment, loading } = useRFQ();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RFQFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: rfq ? {
      title: rfq.title,
      description: rfq.description,
      quantity: rfq.quantity,
      deadline: new Date(rfq.deadline),
      priority: rfq.priority,
      category_id: rfq.category_id,
    } : {
      priority: 'medium',
    }
  });

  const watchedPriority = watch('priority');
  const watchedDeadline = watch('deadline');

  const onSubmit = async (data: RFQFormData) => {
    try {
      let createdRFQ: RFQ;

      if (rfq) {
        // Обновляем существующий RFQ
        createdRFQ = await updateRFQ(rfq.id, {
          ...data,
          deadline: data.deadline.toISOString(),
        });
        toast({
          title: 'RFQ обновлен',
          description: 'Запрос на предложение успешно обновлен',
        });
      } else {
        // Создаем новый RFQ
        createdRFQ = await createRFQ({
          ...data,
          deadline: data.deadline.toISOString(),
          status: 'draft',
        });
        toast({
          title: 'RFQ создан',
          description: 'Черновик запроса на предложение создан',
        });
      }

      // Загружаем файлы, если они есть
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        try {
          for (const file of selectedFiles) {
            await uploadAttachment(createdRFQ.id, file);
          }
          toast({
            title: 'Файлы загружены',
            description: 'Все файлы успешно прикреплены к RFQ',
          });
        } catch (error) {
          toast({
            title: 'Ошибка загрузки файлов',
            description: 'Некоторые файлы не удалось загрузить',
            variant: 'destructive',
          });
        } finally {
          setUploadingFiles(false);
        }
      }

      onSuccess?.(createdRFQ);
      router.push('/rfq');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при сохранении RFQ',
        variant: 'destructive',
      });
    }
  };

  const handleSendRFQ = async (data: RFQFormData) => {
    try {
      const createdRFQ = await createRFQ({
        ...data,
        deadline: data.deadline.toISOString(),
        status: 'sent',
      });

      // Загружаем файлы
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          await uploadAttachment(createdRFQ.id, file);
        }
        setUploadingFiles(false);
      }

      toast({
        title: 'RFQ отправлен',
        description: 'Запрос на предложение отправлен поставщикам',
      });

      onSuccess?.(createdRFQ);
      router.push('/rfq');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при отправке RFQ',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: RFQPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {rfq ? 'Редактировать RFQ' : 'Создать новый RFQ'}
          </CardTitle>
          <CardDescription>
            Заполните форму для создания запроса на предложение от поставщиков
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Название RFQ *</Label>
                <Input
                  id="title"
                  placeholder="Введите название запроса"
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <Select
                  value={watch('category_id')}
                  onValueChange={(value) => setValue('category_id', value)}
                >
                  <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-sm text-red-500">{errors.category_id.message}</p>
                )}
              </div>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                placeholder="Подробно опишите ваши требования к продукции"
                rows={4}
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Количество и приоритет */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  {...register('quantity', { valueAsNumber: true })}
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select
                  value={watchedPriority}
                  onValueChange={(value: RFQPriority) => setValue('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
                {watchedPriority && (
                  <Badge className={cn('mt-2', getPriorityColor(watchedPriority))}>
                    {watchedPriority === 'low' && 'Низкий приоритет'}
                    {watchedPriority === 'medium' && 'Средний приоритет'}
                    {watchedPriority === 'high' && 'Высокий приоритет'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Дедлайн *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watchedDeadline && 'text-muted-foreground',
                        errors.deadline ? 'border-red-500' : ''
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedDeadline ? (
                        format(watchedDeadline, 'PPP', { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedDeadline}
                      onSelect={(date) => setValue('deadline', date!)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors.deadline && (
                  <p className="text-sm text-red-500">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            {/* Загрузка файлов */}
            <div className="space-y-2">
              <Label>Технические требования (файлы)</Label>
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={5}
                maxSize={20 * 1024 * 1024} // 20MB
                acceptedFileTypes={[
                  'image/*',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ]}
              />
              <p className="text-sm text-gray-500">
                Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, изображения
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || loading || uploadingFiles}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {rfq ? 'Обновить' : 'Сохранить черновик'}
              </Button>
              
              {!rfq && (
                <Button
                  type="button"
                  variant="default"
                  disabled={isSubmitting || loading || uploadingFiles}
                  onClick={handleSubmit(handleSendRFQ)}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить RFQ
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting || loading || uploadingFiles}
              >
                Отмена
              </Button>
            </div>

            {(isSubmitting || loading || uploadingFiles) && (
              <div className="text-center text-sm text-gray-500">
                {uploadingFiles ? 'Загрузка файлов...' : 'Сохранение...'}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
