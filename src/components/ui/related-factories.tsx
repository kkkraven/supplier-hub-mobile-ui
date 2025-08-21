'use client';

import React from 'react';
import { ArrowRight, Factory } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { FactoryCard } from '../factory-card';
import { Factory as FactoryType } from '../../types/factory';
import { useRouter } from 'next/navigation';

interface RelatedFactoriesProps {
  factories: FactoryType[];
  currentFactoryId: string;
  category: string;
  maxDisplay?: number;
  className?: string;
}

export function RelatedFactories({ 
  factories, 
  currentFactoryId, 
  category,
  maxDisplay = 3,
  className = '' 
}: RelatedFactoriesProps) {
  const router = useRouter();

  // Фильтруем фабрики, исключая текущую и ограничивая количество
  const relatedFactories = factories
    .filter(factory => factory.factory_id !== currentFactoryId)
    .slice(0, maxDisplay);

  if (relatedFactories.length === 0) {
    return null;
  }

  const handleFactoryClick = (factoryId: string) => {
    router.push(`/factories/${factoryId}`);
  };

  const handleFactoryChat = (factoryId: string) => {
    console.log('Start chat with factory:', factoryId);
  };

  const handleViewAll = () => {
    router.push(`/categories/${category}`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Factory className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Похожие фабрики</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewAll}
          className="flex items-center gap-2"
        >
          Посмотреть все
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedFactories.map((factory) => (
          <Card key={factory.factory_id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {factory.legal_name_en || factory.legal_name_cn}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{factory.city}</span>
                    {factory.province && <span>• {factory.province}</span>}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {factory.segment}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Рейтинг:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{factory.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">MOQ:</span>
                  <span className="font-medium">
                    {factory.moq_units ? `${factory.moq_units} шт` : 'По запросу'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Срок:</span>
                  <span className="font-medium">
                    {factory.lead_time_days ? `${factory.lead_time_days} дн` : 'По запросу'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleFactoryClick(factory.factory_id)}
                >
                  Подробнее
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleFactoryChat(factory.factory_id)}
                >
                  Чат
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
