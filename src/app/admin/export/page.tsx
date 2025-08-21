'use client';

import React from 'react';
import { DataExport } from '@/components/data-export';
import { useFactories } from '@/hooks/useFactories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ExportPage() {
  const { factories, loading, error } = useFactories({ limit: 1000 });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Загрузка данных...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка при загрузке данных: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к админ панели
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Экспорт данных фабрик</h1>
        <p className="text-muted-foreground mt-2">
          Выгрузите данные фабрик в различных форматах для анализа и работы
        </p>
      </div>

      {/* Компонент экспорта */}
      <DataExport 
        factories={factories}
        onExport={(type, data) => {
          console.log(`Экспорт ${type} завершен`);
          // Здесь можно добавить уведомление об успешном экспорте
        }}
      />
    </div>
  );
}
