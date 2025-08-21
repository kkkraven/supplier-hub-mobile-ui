'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Calendar,
  Package,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { RFQ, RFQ_STATUS_LABELS, RFQ_STATUS_COLORS, RFQ_PRIORITY_LABELS, RFQ_PRIORITY_COLORS } from '@/types/rfq';

interface RFQListProps {
  rfqs: RFQ[];
  loading: boolean;
}

export const RFQList: React.FC<RFQListProps> = ({ rfqs, loading }) => {
  const { toast } = useToast();
  const { deleteRFQ } = useRFQ();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Фильтрация RFQ
  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || rfq.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDeleteRFQ = async (rfqId: string, rfqTitle: string) => {
    try {
      await deleteRFQ(rfqId);
      toast({
        title: 'RFQ удален',
        description: `Запрос "${rfqTitle}" успешно удален`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить RFQ',
        variant: 'destructive',
      });
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rfqs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет RFQ</h3>
          <p className="text-gray-500 mb-4">
            У вас пока нет запросов на предложение. Создайте первый RFQ для начала работы с поставщиками.
          </p>
          <Link href="/rfq/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать RFQ
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои RFQ</h1>
          <p className="text-gray-600">
            Управляйте запросами на предложение от поставщиков
          </p>
        </div>
        <Link href="/rfq/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Создать RFQ
          </Button>
        </Link>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
                <SelectItem value="sent">Отправлено</SelectItem>
                <SelectItem value="quoted">Получены предложения</SelectItem>
                <SelectItem value="closed">Закрыто</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center">
              Найдено: {filteredRFQs.length} из {rfqs.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список RFQ */}
      <div className="space-y-4">
        {filteredRFQs.map((rfq) => {
          const deadlineStatus = getDeadlineStatus(rfq.deadline);
          const daysLeft = getDaysUntilDeadline(rfq.deadline);
          
          return (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {rfq.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={RFQ_STATUS_COLORS[rfq.status]}>
                          {RFQ_STATUS_LABELS[rfq.status]}
                        </Badge>
                        <Badge className={RFQ_PRIORITY_COLORS[rfq.priority]}>
                          {RFQ_PRIORITY_LABELS[rfq.priority]}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {rfq.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{rfq.quantity.toLocaleString()} шт.</span>
                      </div>
                      
                      {rfq.category && (
                        <div className="flex items-center gap-1">
                          <span>Категория:</span>
                          <Badge variant="outline">{rfq.category.name}</Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className={getDeadlineColor(deadlineStatus)}>
                          {daysLeft < 0 
                            ? `Просрочено на ${Math.abs(daysLeft)} дн.`
                            : daysLeft === 0 
                              ? 'Сегодня'
                              : `${daysLeft} дн. осталось`
                          }
                        </span>
                        {deadlineStatus === 'urgent' && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      
                      <div className="text-gray-400">
                        Создан {format(new Date(rfq.created_at), 'dd MMM yyyy', { locale: ru })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 lg:flex-col lg:gap-1">
                    <Link href={`/rfq/${rfq.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    {rfq.status === 'draft' && (
                      <Link href={`/rfq/${rfq.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
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
                            onClick={() => handleDeleteRFQ(rfq.id, rfq.title)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
