import React, { useState } from 'react';
import { Download, FileText, Users, BarChart3, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Factory } from '@/types/factory';
import { 
  exportFactoriesToCSV, 
  exportContactInfoToCSV, 
  exportFactoryStatsToCSV,
  downloadCSV 
} from '@/lib/export-utils';

interface DataExportProps {
  factories: Factory[];
  onExport?: (type: string, data: string) => void;
}

interface ExportOptions {
  includeContactInfo: boolean;
  includeCoordinates: boolean;
  includeCertifications: boolean;
  includeStats: boolean;
  format: 'csv' | 'json';
  filename: string;
}

export function DataExport({ factories, onExport }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'contact' | 'stats'>('all');
  const [options, setOptions] = useState<ExportOptions>({
    includeContactInfo: true,
    includeCoordinates: true,
    includeCertifications: true,
    includeStats: false,
    format: 'csv',
    filename: `factories_export_${new Date().toISOString().split('T')[0]}`
  });
  const [lastExport, setLastExport] = useState<{
    type: string;
    filename: string;
    recordCount: number;
    timestamp: Date;
  } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Используем API для экспорта
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: exportType,
          includeContactInfo: options.includeContactInfo,
          filename: options.filename
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при экспорте данных');
      }

      const result = await response.json();
      
      if (result.success) {
        // Скачиваем файл
        const link = document.createElement('a');
        link.href = result.filePath;
        link.download = result.filename;
        link.click();
        
        setLastExport({
          type: exportType,
          filename: result.filename,
          recordCount: result.recordCount,
          timestamp: new Date(result.timestamp)
        });
        
        onExport?.(exportType, 'Экспорт завершен успешно');
      } else {
        throw new Error(result.error || 'Ошибка при экспорте');
      }
      
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      // Fallback к клиентскому экспорту
      try {
        let csvContent = '';
        let filename = options.filename;
        
        switch (exportType) {
          case 'all':
            csvContent = exportFactoriesToCSV(factories, options.includeContactInfo);
            filename = `${filename}_complete.csv`;
            break;
          case 'contact':
            csvContent = exportContactInfoToCSV(factories);
            filename = `${filename}_contacts.csv`;
            break;
          case 'stats':
            csvContent = exportFactoryStatsToCSV(factories);
            filename = `${filename}_statistics.csv`;
            break;
        }
        
        downloadCSV(csvContent, filename);
        
        setLastExport({
          type: exportType,
          filename,
          recordCount: factories.length,
          timestamp: new Date()
        });
        
        onExport?.(exportType, csvContent);
      } catch (fallbackError) {
        console.error('Ошибка при fallback экспорте:', fallbackError);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStats = () => {
    const total = factories.length;
    const withEmail = factories.filter(f => f.email).length;
    const withWebsite = factories.filter(f => f.website).length;
    const withCoordinates = factories.filter(f => f.lat_lng).length;
    
    return { total, withEmail, withWebsite, withCoordinates };
  };

  const stats = getExportStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Экспорт данных фабрик
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Выберите тип экспорта и настройте параметры для выгрузки данных фабрик в различных форматах.
          </p>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Статистика данных
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Всего фабрик</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withEmail}</div>
              <div className="text-sm text-muted-foreground">С email</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.withWebsite}</div>
              <div className="text-sm text-muted-foreground">С веб-сайтом</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.withCoordinates}</div>
              <div className="text-sm text-muted-foreground">С координатами</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки экспорта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки экспорта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Тип экспорта */}
          <div className="space-y-3">
            <Label>Тип экспорта</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  exportType === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setExportType('all')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Полный экспорт</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Все данные фабрик с контактной информацией
                </p>
              </div>
              
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  exportType === 'contact' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setExportType('contact')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Только контакты</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Только контактная информация фабрик
                </p>
              </div>
              
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  exportType === 'stats' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setExportType('stats')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Статистика</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Аналитическая статистика по фабрикам
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Дополнительные опции */}
          {exportType === 'all' && (
            <div className="space-y-4">
              <Label>Дополнительные опции</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeContactInfo"
                    checked={options.includeContactInfo}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeContactInfo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeContactInfo">Включить контактную информацию</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCoordinates"
                    checked={options.includeCoordinates}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeCoordinates: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeCoordinates">Включить координаты</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCertifications"
                    checked={options.includeCertifications}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeCertifications: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeCertifications">Включить сертификации</Label>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Настройки файла */}
          <div className="space-y-4">
            <Label>Настройки файла</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Имя файла</Label>
                <input
                  id="filename"
                  type="text"
                  value={options.filename}
                  onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="factories_export"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Формат</Label>
                <Select value={options.format} onValueChange={(value: 'csv' | 'json') => 
                  setOptions(prev => ({ ...prev, format: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопка экспорта */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleExport}
            disabled={isExporting || factories.length === 0}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Экспорт...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Экспортировать данные
              </>
            )}
          </Button>
          
          {factories.length === 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Нет данных для экспорта. Убедитесь, что фабрики загружены.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Последний экспорт */}
      {lastExport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Последний экспорт
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Тип:</span>
                <Badge variant="outline">
                  {exportType === 'all' ? 'Полный экспорт' : 
                   exportType === 'contact' ? 'Контакты' : 'Статистика'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Файл:</span>
                <span className="text-sm font-mono">{lastExport.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Записей:</span>
                <span className="text-sm">{lastExport.recordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Время:</span>
                <span className="text-sm">
                  {lastExport.timestamp.toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
