import React, { useState } from 'react';
import { 
  Users, 
  Factory, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  LogOut,
  BarChart3,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  X,
  Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { MassFactoryImport } from '../mass-factory-import';
import { DataExport } from '../data-export';

interface AdminDashboardPageProps {
  onNavigate?: (page: string) => void;
  onLogout: () => void;
}

interface Factory {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  category: string;
  moq: string;
  leadTime: string;
  rating: number;
  deals: number;
  status: 'active' | 'pending' | 'suspended';
  certifications: string[];
  createdAt: string;
  lastActivity: string;
}

interface RFQRequest {
  id: string;
  customerName: string;
  category: string;
  quantity: string;
  deadline: string;
  status: 'new' | 'assigned' | 'quoted' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export function AdminDashboardPage({ onNavigate, onLogout }: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddFactoryDialog, setShowAddFactoryDialog] = useState(false);
  const [showMassImportDialog, setShowMassImportDialog] = useState(false);
  const [showDataExportDialog, setShowDataExportDialog] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [factoryList, setFactoryList] = useState<Factory[]>([]);

  // Mock data
  const stats = {
    totalFactories: 30 + factoryList.length,
    activeFactories: 25 + factoryList.filter(f => f.status === 'active').length,
    pendingApproval: 5 + factoryList.filter(f => f.status === 'pending').length,
    totalUsers: 1247,
    newUsersThisMonth: 89,
    totalRFQs: 342,
    newRFQsToday: 12
  };

  const initialFactories: Factory[] = [
    {
      id: '1',
      name: 'MKIUJN Knitting Factory',
      nameEn: 'MKIUJN Knitting Factory',
      city: '东莞 / Dongguan',
      category: 'Knit',
      moq: '300 шт',
      leadTime: '18 дней',
      rating: 4.7,
      deals: 35,
      status: 'active',
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      createdAt: '2024-01-15',
      lastActivity: '2024-07-20'
    },
    {
      id: '2',
      name: 'DGCD Knitting Factory',
      nameEn: 'DGCD Knitting Factory',
      city: '东莞 / Dongguan',
      category: 'Knit',
      moq: '350 шт',
      leadTime: '20 дней',
      rating: 4.6,
      deals: 28,
      status: 'active',
      certifications: ['BSCI', 'WRAP'],
      createdAt: '2024-02-10',
      lastActivity: '2024-07-25'
    },
    {
      id: '3',
      name: 'Vivian Chen Denim Factory',
      nameEn: 'Vivian Chen Denim Factory',
      city: '新塘 / Xintang',
      category: 'Denim',
      moq: '300 шт',
      leadTime: '20 дней',
      rating: 4.7,
      deals: 25,
      status: 'active',
      certifications: ['BSCI', 'WRAP', 'OEKO-TEX'],
      createdAt: '2024-01-15',
      lastActivity: '2024-07-20'
    }
  ];

  const allFactories = [...initialFactories, ...factoryList];

  const rfqRequests: RFQRequest[] = [
    {
      id: 'rfq001',
      customerName: 'Startup Fashion Brand',
      category: 'Knit',
      quantity: '500 pieces',
      deadline: '2024-08-15',
      status: 'new',
      priority: 'high',
      createdAt: '2024-07-25'
    },
    {
      id: 'rfq002',
      customerName: 'Eco Clothing Co.',
      category: 'Woven',
      quantity: '300 pieces',
      deadline: '2024-08-20',
      status: 'assigned',
      priority: 'medium',
      createdAt: '2024-07-24'
    },
    {
      id: 'rfq003',
      customerName: 'Sports Brand Inc.',
      category: 'Activewear',
      quantity: '1000 pieces',
      deadline: '2024-09-01',
      status: 'quoted',
      priority: 'low',
      createdAt: '2024-07-23'
    }
  ];

  const filteredFactories = allFactories.filter(factory => {
    const matchesSearch = factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factory.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factory.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || factory.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleMassImport = (importedFactories: any[]) => {
    const convertedFactories: Factory[] = importedFactories.map(factory => ({
      id: factory.id,
      name: factory.name,
      nameEn: factory.nameEn || factory.name,
      city: factory.city,
      category: factory.category.charAt(0).toUpperCase() + factory.category.slice(1),
      moq: factory.moq,
      leadTime: factory.leadTime,
      rating: factory.rating,
      deals: factory.deals,
      status: factory.status,
      certifications: factory.certifications,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0]
    }));

    setFactoryList(prev => [...prev, ...convertedFactories]);
    setShowMassImportDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-white">Активна</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-white">На модерации</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Приостановлена</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRFQStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-primary text-white">Новая</Badge>;
      case 'assigned':
        return <Badge className="bg-warning text-white">Назначена</Badge>;
      case 'quoted':
        return <Badge className="bg-success text-white">Процитирована</Badge>;
      case 'closed':
        return <Badge variant="secondary">Закрыта</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-warning text-white">Высокий</Badge>;
      case 'medium':
        return <Badge className="bg-accent-purple text-white">Средний</Badge>;
      case 'low':
        return <Badge variant="secondary">Низкий</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
              <p className="text-sm text-gray-600">Управление Factura Supplier Hub</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => onNavigate?.('landing')}
              >
                Вернуться на сайт
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="factories">Фабрики ({stats.totalFactories})</TabsTrigger>
            <TabsTrigger value="rfqs">RFQ запросы ({stats.totalRFQs})</TabsTrigger>
            <TabsTrigger value="users">Пользователи ({stats.totalUsers})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего фабрик</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFactories}</div>
                  <p className="text-xs text-muted-foreground">
                    +{factoryList.length} добавлено через импорт
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные фабрики</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeFactories}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingApproval} ожидают модерации
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.newUsersThisMonth} в этом месяце
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RFQ запросы</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRFQs}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.newRFQsToday} сегодня
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    className="gradient-factura h-20 flex-col"
                    onClick={() => setShowMassImportDialog(true)}
                  >
                    <Upload className="w-6 h-6 mb-2" />
                    Массовый импорт фабрик
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setShowAddFactoryDialog(true)}
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    Добавить фабрику
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setShowDataExportDialog(true)}
                  >
                    <Download className="w-6 h-6 mb-2" />
                    Экспорт данных
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    Аналитика
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Последние RFQ запросы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rfqRequests.slice(0, 5).map((rfq) => (
                      <div key={rfq.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{rfq.customerName}</p>
                          <p className="text-sm text-gray-600">{rfq.category} • {rfq.quantity}</p>
                        </div>
                        <div className="text-right">
                          {getRFQStatusBadge(rfq.status)}
                          <p className="text-xs text-gray-500 mt-1">{rfq.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Фабрики на модерации</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allFactories.filter(f => f.status === 'pending').map((factory) => (
                      <div key={factory.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{factory.name}</p>
                          <p className="text-sm text-gray-600">{factory.city} • {factory.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-success hover:bg-success/90">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Одобрить
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Factories Tab */}
          <TabsContent value="factories" className="space-y-6">
            {/* Factory Management Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Управление фабриками</h2>
                <p className="text-gray-600">Добавляйте, редактируйте и модерируйте фабрики</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowMassImportDialog(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Массовый импорт
                </Button>
                <Button 
                  className="gradient-factura"
                  onClick={() => setShowAddFactoryDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить фабрику
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по названию, городу, категории..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Статус фабрики" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="pending">На модерации</SelectItem>
                  <SelectItem value="suspended">Приостановленные</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
            </div>

            {/* Factories Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Фабрика</TableHead>
                      <TableHead>Город</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>MOQ</TableHead>
                      <TableHead>Рейтинг</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата добавления</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFactories.map((factory) => (
                      <TableRow key={factory.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{factory.name}</p>
                            <p className="text-sm text-gray-600">{factory.nameEn}</p>
                          </div>
                        </TableCell>
                        <TableCell>{factory.city}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{factory.category}</Badge>
                        </TableCell>
                        <TableCell>{factory.moq}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            ⭐ {factory.rating > 0 ? factory.rating : 'N/A'}
                            <span className="text-sm text-gray-500">({factory.deals} сделок)</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(factory.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {factory.createdAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-warning hover:text-warning">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RFQs Tab */}
          <TabsContent value="rfqs" className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">RFQ запросы</h2>
                <p className="text-gray-600">Управление запросами от клиентов</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Дедлайн</TableHead>
                      <TableHead>Приоритет</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfqRequests.map((rfq) => (
                      <TableRow key={rfq.id}>
                        <TableCell className="font-mono text-sm">{rfq.id}</TableCell>
                        <TableCell className="font-medium">{rfq.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rfq.category}</Badge>
                        </TableCell>
                        <TableCell>{rfq.quantity}</TableCell>
                        <TableCell>{rfq.deadline}</TableCell>
                        <TableCell>{getPriorityBadge(rfq.priority)}</TableCell>
                        <TableCell>{getRFQStatusBadge(rfq.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{rfq.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary-light">
                              Назначить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
              <p className="text-gray-600">Статистика и управление пользователями платформы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Новые пользователи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.newUsersThisMonth}</div>
                  <p className="text-sm text-gray-600">за этот месяц</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Активные подписки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">156</div>
                  <p className="text-sm text-gray-600">оплаченных планов</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Конверсия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent-purple">12.5%</div>
                  <p className="text-sm text-gray-600">из trial в paid</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Подробная статистика пользователей будет доступна в следующей версии админ панели.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mass Import Dialog */}
      <Dialog open={showMassImportDialog} onOpenChange={setShowMassImportDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Массовый импорт фабрик</DialogTitle>
            <DialogDescription>
              Импортируйте готовый набор фабрик со всеми данными и фотографиями
            </DialogDescription>
          </DialogHeader>
          
          <MassFactoryImport onImport={handleMassImport} />
        </DialogContent>
      </Dialog>

      {/* Add Factory Dialog */}
      <Dialog open={showAddFactoryDialog} onOpenChange={setShowAddFactoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить новую фабрику</DialogTitle>
            <DialogDescription>
              Введите информацию о фабрике для добавления в каталог
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="factoryName">Название фабрики (RU)</Label>
              <Input id="factoryName" placeholder="Название на русском" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="factoryNameEn">Название фабрики (EN)</Label>
              <Input id="factoryNameEn" placeholder="Factory Name in English" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input id="city" placeholder="广州 / Guangzhou" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knit">Knit / Трикотаж</SelectItem>
                  <SelectItem value="woven">Woven / Ткань</SelectItem>
                  <SelectItem value="outerwear">Outerwear / Верхняя одежда</SelectItem>
                  <SelectItem value="denim">Denim / Джинсовая одежда</SelectItem>
                  <SelectItem value="activewear">Activewear / Спортивная одежда</SelectItem>
                  <SelectItem value="accessories">Accessories / Аксессуары</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="moq">MOQ</Label>
              <Input id="moq" placeholder="300 шт" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time</Label>
              <Input id="leadTime" placeholder="15 дней" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" placeholder="Описание специализации фабрики..." />
          </div>

          <div className="space-y-3">
            <Label>Сертификации</Label>
            <div className="grid grid-cols-3 gap-2">
              {['GOTS', 'OEKO-TEX', 'WRAP', 'BSCI', 'GRS', 'RDS'].map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Checkbox id={cert} />
                  <Label htmlFor={cert} className="text-sm">{cert}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddFactoryDialog(false)}>
              Отмена
            </Button>
            <Button className="gradient-factura">
              Добавить фабрику
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Export Dialog */}
      <Dialog open={showDataExportDialog} onOpenChange={setShowDataExportDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Экспорт данных фабрик</DialogTitle>
            <DialogDescription>
              Выберите тип экспорта и настройте параметры для выгрузки данных
            </DialogDescription>
          </DialogHeader>
          
          <DataExport 
            factories={allFactories.map(factory => ({
              factory_id: factory.id,
              legal_name_cn: factory.name,
              legal_name_en: factory.nameEn,
              city: factory.city,
              province: '',
              segment: 'mid' as const,
              address_cn: '',
              wechat_id: '',
              phone: '',
              email: '',
              website: '',
              moq_units: parseInt(factory.moq) || 0,
              lead_time_days: parseInt(factory.leadTime) || 0,
              capacity_month: 0,
              certifications: {},
              interaction_level: 0,
              created_at: factory.createdAt,
              rating: factory.rating,
              reviewCount: factory.deals,
              specialization: factory.certifications,
              verified: factory.status === 'active'
            }))}
            onExport={(type, data) => {
              console.log(`Экспорт ${type}:`, data);
              setShowDataExportDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}