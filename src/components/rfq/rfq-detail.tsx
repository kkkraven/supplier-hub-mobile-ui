'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  FileText, 
  Calendar, 
  Package, 
  AlertCircle,
  ExternalLink,
  Trash2,
  Send,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/hooks/use-toast';
import { useRFQ } from '@/hooks/useRFQ';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RFQ, RFQAttachment, RFQ_STATUS_LABELS, RFQ_STATUS_COLORS, RFQ_PRIORITY_LABELS, RFQ_PRIORITY_COLORS, RFQQuote } from '@/types/rfq';
import { RFQQuotesList } from './rfq-quotes-list';
import { QuoteComparison } from './quote-comparison';

interface RFQDetailProps {
  rfq: RFQ;
}

export const RFQDetail: React.FC<RFQDetailProps> = ({ rfq }) => {
  const { toast } = useToast();
  const { deleteRFQ, getAttachments, deleteAttachment, getRFQQuotes, updateQuoteStatus, deleteQuote } = useRFQ();
  const [attachments, setAttachments] = useState<RFQAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(true);
  const [quotes, setQuotes] = useState<RFQQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    const loadAttachments = async () => {
      try {
        const atts = await getAttachments(rfq.id);
        setAttachments(atts);
      } catch (error) {
        console.error('Ошибка при загрузке вложений:', error);
      } finally {
        setLoadingAttachments(false);
      }
    };

    const loadQuotes = async () => {
      try {
        const quotesData = await getRFQQuotes(rfq.id);
        setQuotes(quotesData);
      } catch (error) {
        console.error('Ошибка при загрузке предложений:', error);
      } finally {
        setLoadingQuotes(false);
      }
    };

    loadAttachments();
    loadQuotes();
  }, [rfq.id, getAttachments, getRFQQuotes]);

  const handleDeleteRFQ = async () => {
    try {
      await deleteRFQ(rfq.id);
      toast({
        title: 'RFQ удален',
        description: 'Запрос на предложение успешно удален',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить RFQ',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (attachment) {
        await deleteAttachment(attachmentId, attachment.file_url);
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        toast({
          title: 'Файл удален',
          description: `Файл "${fileName}" успешно удален`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить файл',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuoteStatus = async (quoteId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateQuoteStatus(quoteId, status);
      // Обновляем локальное состояние
      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId ? { ...quote, status } : quote
      ));
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await deleteQuote(quoteId);
      // Обновляем локальное состояние
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
    } catch (error) {
      throw error;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'normal';
  };

  const getDeadlineColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600';
      case 'urgent':
        return 'text-orange-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (fileType.includes('word')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    } else if (fileType.includes('excel')) {
      return <FileText className="w-4 h-4 text-green-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const deadlineStatus = getDeadlineStatus(rfq.deadline);
  const daysLeft = getDaysUntilDeadline(rfq.deadline);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/rfq">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к списку
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{rfq.title}</h1>
            <p className="text-gray-600">
              Создан {format(new Date(rfq.created_at), 'dd MMMM yyyy', { locale: ru })}
            </p>
          </div>
        </div>
        
                 <div className="flex items-center gap-2">
           {rfq.status === 'draft' && (
             <>
               <Link href={`/rfq/${rfq.id}/edit`}>
                 <Button variant="outline" size="sm">
                   <Edit className="w-4 h-4 mr-2" />
                   Редактировать
                 </Button>
               </Link>
               <Link href={`/rfq/${rfq.id}/send`}>
                 <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                   <Send className="w-4 h-4 mr-2" />
                   Отправить фабрикам
                 </Button>
               </Link>
             </>
           )}
           
           {rfq.status === 'sent' && (
             <Link href={`/rfq/${rfq.id}/send`}>
               <Button variant="outline" size="sm">
                 <Eye className="w-4 h-4 mr-2" />
                 Статус отправки
               </Button>
             </Link>
           )}
           
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить RFQ</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить RFQ "{rfq.title}"? 
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteRFQ}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Детали</TabsTrigger>
          <TabsTrigger value="attachments">Вложения</TabsTrigger>
          <TabsTrigger value="quotes">Предложения ({quotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Описание */}
              <Card>
                <CardHeader>
                  <CardTitle>Описание</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Статус и приоритет */}
              <Card>
                <CardHeader>
                  <CardTitle>Статус</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className={RFQ_STATUS_COLORS[rfq.status]}>
                      {RFQ_STATUS_LABELS[rfq.status]}
                    </Badge>
                  </div>
                  <div>
                    <Badge className={RFQ_PRIORITY_COLORS[rfq.priority]}>
                      {RFQ_PRIORITY_LABELS[rfq.priority]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Детали */}
              <Card>
                <CardHeader>
                  <CardTitle>Детали</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Количество:</span>
                    <span className="font-medium">{rfq.quantity.toLocaleString()} шт.</span>
                  </div>
                  
                  {rfq.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Категория:</span>
                      <Badge variant="outline">{rfq.category.name}</Badge>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Дедлайн:</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {format(new Date(rfq.deadline), 'dd MMM yyyy', { locale: ru })}
                      </div>
                      <div className={`text-sm ${getDeadlineColor(deadlineStatus)}`}>
                        {daysLeft < 0 
                          ? `Просрочено на ${Math.abs(daysLeft)} дн.`
                          : daysLeft === 0 
                            ? 'Сегодня'
                            : `${daysLeft} дн. осталось`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {deadlineStatus === 'urgent' && (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Срочный дедлайн!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Технические требования</CardTitle>
              <CardDescription>
                Прикрепленные файлы с техническими требованиями
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAttachments ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : attachments.length > 0 ? (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{attachment.file_name}</div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(attachment.file_size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить файл</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить файл "{attachment.file_name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAttachment(attachment.id, attachment.file_name)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Файлы не прикреплены
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          {loadingQuotes ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <RFQQuotesList
                quotes={quotes}
                onUpdateStatus={handleUpdateQuoteStatus}
                onDeleteQuote={handleDeleteQuote}
              />
              
              {quotes.filter(q => q.status === 'pending').length > 0 && (
                <QuoteComparison
                  quotes={quotes}
                  onUpdateStatus={handleUpdateQuoteStatus}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
