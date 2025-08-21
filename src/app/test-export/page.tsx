'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';
import { 
  exportFactoriesToCSV, 
  exportContactInfoToCSV, 
  exportFactoryStatsToCSV,
  downloadCSV 
} from '@/lib/export-utils';

// Тестовые данные
const testFactories = [
  {
    factory_id: 'test-001',
    legal_name_cn: '测试针织厂',
    legal_name_en: 'Test Knitting Factory',
    city: '广州',
    province: '广东',
    segment: 'mid' as const,
    address_cn: '广东省广州市番禺区纺织工业园',
    wechat_id: 'test_factory_001',
    phone: '+86 20 1234 5678',
    email: 'info@testfactory.com',
    website: 'https://testfactory.com',
    moq_units: 300,
    lead_time_days: 15,
    capacity_month: 50000,
    certifications: {
      bsci: true,
      iso9001: true,
      oeko_tex: true
    },
    interaction_level: 2,
    last_interaction_date: '2024-07-25',
    last_verified: '2024-07-20',
    created_at: '2024-01-15',
    lat_lng: { lat: 23.1291, lng: 113.2644 },
    rating: 4.7,
    reviewCount: 25,
    specialization: ['Premium Knit', 'Quality Focus'],
    verified: true
  },
  {
    factory_id: 'test-002',
    legal_name_cn: '优质纺织有限公司',
    legal_name_en: 'Premium Textile Co., Ltd.',
    city: '东莞',
    province: '广东',
    segment: 'high' as const,
    address_cn: '广东省东莞市虎门镇纺织路123号',
    wechat_id: 'premium_textile',
    phone: '+86 769 8765 4321',
    email: 'contact@premiumtextile.com',
    website: 'https://premiumtextile.com',
    moq_units: 200,
    lead_time_days: 18,
    capacity_month: 40000,
    certifications: {
      bsci: true,
      iso9001: true,
      gots: true
    },
    interaction_level: 3,
    last_interaction_date: '2024-07-26',
    last_verified: '2024-07-22',
    created_at: '2024-02-10',
    lat_lng: { lat: 22.8238, lng: 113.6739 },
    rating: 4.9,
    reviewCount: 42,
    specialization: ['Premium Woven', 'Custom Designs'],
    verified: true
  }
];

export default function TestExportPage() {
  const [exportStatus, setExportStatus] = useState<{
    type: string;
    success: boolean;
    message: string;
    filename?: string;
  } | null>(null);

  const testExport = async (type: 'all' | 'contact' | 'stats') => {
    try {
      let csvContent = '';
      let filename = `test_export_${type}_${new Date().toISOString().split('T')[0]}`;

      switch (type) {
        case 'all':
          csvContent = exportFactoriesToCSV(testFactories, true);
          filename = `${filename}_complete.csv`;
          break;
        case 'contact':
          csvContent = exportContactInfoToCSV(testFactories);
          filename = `${filename}_contacts.csv`;
          break;
        case 'stats':
          csvContent = exportFactoryStatsToCSV(testFactories);
          filename = `${filename}_statistics.csv`;
          break;
      }

      downloadCSV(csvContent, filename);

      setExportStatus({
        type,
        success: true,
        message: `Экспорт ${type} завершен успешно`,
        filename
      });

    } catch (error) {
      setExportStatus({
        type,
        success: false,
        message: `Ошибка при экспорте: ${error}`
      });
    }
  };

  const testAPIExport = async (type: 'all' | 'contact' | 'stats') => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          includeContactInfo: true,
          filename: `api_test_${type}`
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExportStatus({
          type: `API ${type}`,
          success: true,
          message: `API экспорт ${type} завершен успешно`,
          filename: result.filename
        });
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      setExportStatus({
        type: `API ${type}`,
        success: false,
        message: `Ошибка API экспорта: ${error}`
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Тестирование экспорта данных</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Клиентский экспорт</h3>
            <div className="flex gap-4">
              <Button onClick={() => testExport('all')}>
                <Download className="w-4 h-4 mr-2" />
                Полный экспорт
              </Button>
              <Button onClick={() => testExport('contact')}>
                <Download className="w-4 h-4 mr-2" />
                Контакты
              </Button>
              <Button onClick={() => testExport('stats')}>
                <Download className="w-4 h-4 mr-2" />
                Статистика
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">API экспорт</h3>
            <div className="flex gap-4">
              <Button onClick={() => testAPIExport('all')}>
                <Download className="w-4 h-4 mr-2" />
                API Полный
              </Button>
              <Button onClick={() => testAPIExport('contact')}>
                <Download className="w-4 h-4 mr-2" />
                API Контакты
              </Button>
              <Button onClick={() => testAPIExport('stats')}>
                <Download className="w-4 h-4 mr-2" />
                API Статистика
              </Button>
            </div>
          </div>

          {exportStatus && (
            <Alert className={exportStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {exportStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={exportStatus.success ? 'text-green-800' : 'text-red-800'}>
                <strong>{exportStatus.type}:</strong> {exportStatus.message}
                {exportStatus.filename && (
                  <div className="mt-1 text-sm">
                    Файл: {exportStatus.filename}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Тестовые данные</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Используются {testFactories.length} тестовые фабрики с полными данными
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Фабрики с контактной информацией</li>
                <li>• Сертификации и координаты</li>
                <li>• Различные сегменты и рейтинги</li>
                <li>• Даты взаимодействия и верификации</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
