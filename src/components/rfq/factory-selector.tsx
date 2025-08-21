'use client';

import React, { useState, useEffect } from 'react';
import { Search, Check, Building2, Mail, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FactorySelection } from '@/types/rfq';

interface FactorySelectorProps {
  categoryId?: string;
  onFactoriesSelected: (factoryIds: string[]) => void;
  selectedFactoryIds?: string[];
}

export const FactorySelector: React.FC<FactorySelectorProps> = ({
  categoryId,
  onFactoriesSelected,
  selectedFactoryIds = []
}) => {
  const [factories, setFactories] = useState<FactorySelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);

  // Загружаем фабрики при монтировании компонента
  useEffect(() => {
    const loadFactories = async () => {
      try {
        setLoading(true);
        // Здесь будет вызов API для получения фабрик
        // Пока используем моковые данные
        const mockFactories: FactorySelection[] = [
          {
            factory_id: '1',
            selected: selectedFactoryIds.includes('1'),
            factory: {
              id: '1',
              legal_name_cn: '上海制造有限公司',
              legal_name_en: 'Shanghai Manufacturing Co., Ltd.',
              city: '上海',
              segment: 'Электроника',
              email: 'contact@shanghai-mfg.com',
              contact_person: '张经理',
              categories: ['electronics', 'components']
            }
          },
          {
            factory_id: '2',
            selected: selectedFactoryIds.includes('2'),
            factory: {
              id: '2',
              legal_name_cn: '深圳科技工厂',
              legal_name_en: 'Shenzhen Tech Factory',
              city: '深圳',
              segment: 'Технологии',
              email: 'info@shenzhen-tech.com',
              contact_person: '李工程师',
              categories: ['technology', 'electronics']
            }
          },
          {
            factory_id: '3',
            selected: selectedFactoryIds.includes('3'),
            factory: {
              id: '3',
              legal_name_cn: '广州工业集团',
              legal_name_en: 'Guangzhou Industrial Group',
              city: '广州',
              segment: 'Промышленность',
              email: 'sales@guangzhou-ind.com',
              contact_person: '王总监',
              categories: ['industrial', 'machinery']
            }
          }
        ];

        setFactories(mockFactories);
        setSelectedCount(mockFactories.filter(f => f.selected).length);
      } catch (error) {
        console.error('Ошибка при загрузке фабрик:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFactories();
  }, [categoryId, selectedFactoryIds]);

  // Фильтрация фабрик по поисковому запросу
  const filteredFactories = factories.filter(factory => {
    const searchLower = searchTerm.toLowerCase();
    return (
      factory.factory.legal_name_cn.toLowerCase().includes(searchLower) ||
      factory.factory.legal_name_en?.toLowerCase().includes(searchLower) ||
      factory.factory.city.toLowerCase().includes(searchLower) ||
      factory.factory.segment.toLowerCase().includes(searchLower) ||
      factory.factory.contact_person.toLowerCase().includes(searchLower)
    );
  });

  // Обработка выбора/отмены выбора фабрики
  const handleFactoryToggle = (factoryId: string, selected: boolean) => {
    const updatedFactories = factories.map(factory => 
      factory.factory_id === factoryId 
        ? { ...factory, selected }
        : factory
    );
    
    setFactories(updatedFactories);
    setSelectedCount(updatedFactories.filter(f => f.selected).length);
    
    const selectedIds = updatedFactories
      .filter(f => f.selected)
      .map(f => f.factory_id);
    
    onFactoriesSelected(selectedIds);
  };

  // Выбрать все фабрики
  const selectAll = () => {
    const updatedFactories = factories.map(factory => ({
      ...factory,
      selected: true
    }));
    
    setFactories(updatedFactories);
    setSelectedCount(updatedFactories.length);
    
    const selectedIds = updatedFactories.map(f => f.factory_id);
    onFactoriesSelected(selectedIds);
  };

  // Отменить выбор всех фабрик
  const deselectAll = () => {
    const updatedFactories = factories.map(factory => ({
      ...factory,
      selected: false
    }));
    
    setFactories(updatedFactories);
    setSelectedCount(0);
    onFactoriesSelected([]);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Выбор фабрик для отправки RFQ
        </CardTitle>
        <CardDescription>
          Выберите фабрики, которым будет отправлен запрос на предложение
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск и управление */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск фабрик..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Выбрать все
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Снять выбор
            </Button>
          </div>
        </div>

        {/* Счетчик выбранных */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Найдено фабрик: {filteredFactories.length}</span>
          <span>Выбрано: {selectedCount}</span>
        </div>

        {/* Список фабрик */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredFactories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>Фабрики не найдены</p>
            </div>
          ) : (
            filteredFactories.map((factory) => (
              <div
                key={factory.factory_id}
                className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                  factory.selected 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  checked={factory.selected}
                  onCheckedChange={(checked) => 
                    handleFactoryToggle(factory.factory_id, checked as boolean)
                  }
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {factory.factory.legal_name_cn}
                      </h4>
                      {factory.factory.legal_name_en && (
                        <p className="text-sm text-gray-600 truncate">
                          {factory.factory.legal_name_en}
                        </p>
                      )}
                    </div>
                    {factory.selected && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{factory.factory.city}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{factory.factory.segment}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{factory.factory.contact_person}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {factory.factory.categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
