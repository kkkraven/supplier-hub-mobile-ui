'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ArrowLeft } from 'lucide-react';
import { Input } from '../ui/input';
import { TouchButton } from '../ui/touch-button';
import { MobileFactoryCard, MobileFactoryCardCompact } from '../ui/mobile-factory-card';
import { MobileFilters, MobileFiltersCompact } from '../ui/mobile-filters';
import { MobilePagination, MobileInfiniteScroll, MobileLoadingState, MobileEmptyState } from '../ui/mobile-pagination';
import { MobileLayout, MobileContainer, MobileSection } from '../ui/mobile-layout';
import { useIsMobile } from '../ui/use-mobile';
import { useRouter } from 'next/navigation';

// Моковые данные для демонстрации
const mockFactories = [
  {
    factory_id: '1',
    legal_name_en: 'Textile Factory Co. Ltd',
    legal_name_cn: '纺织厂有限公司',
    city: 'Shanghai',
    province: 'Shanghai',
    segment: 'premium',
    moq_units: 500,
    lead_time_days: 25,
    capacity_month: 50000,
    specialization: ['Knit', 'Sportswear'],
    certifications: { bsci: true, iso9001: true },
    last_verified: '2024-01-15',
    interaction_level: 'active',
    last_interaction_date: '2024-01-20',
    wechat_id: 'factory1',
    phone: '+86 138 0000 0001',
    email: 'contact@factory1.com',
    website: 'https://factory1.com',
    address_cn: '上海市浦东新区工厂路123号'
  },
  {
    factory_id: '2',
    legal_name_en: 'Fashion Manufacturing Ltd',
    legal_name_cn: '时尚制造有限公司',
    city: 'Guangzhou',
    province: 'Guangdong',
    segment: 'standard',
    moq_units: 300,
    lead_time_days: 20,
    capacity_month: 30000,
    specialization: ['Woven', 'Casual wear'],
    certifications: { iso9001: true },
    last_verified: '2024-01-10',
    interaction_level: 'new',
    last_interaction_date: null,
    wechat_id: 'factory2',
    phone: '+86 139 0000 0002',
    email: 'info@factory2.com',
    website: 'https://factory2.com',
    address_cn: '广州市番禺区工业大道456号'
  },
  {
    factory_id: '3',
    legal_name_en: 'Premium Garments Factory',
    legal_name_cn: '优质服装厂',
    city: 'Shenzhen',
    province: 'Guangdong',
    segment: 'premium',
    moq_units: 200,
    lead_time_days: 30,
    capacity_month: 25000,
    specialization: ['Outerwear', 'Premium'],
    certifications: { bsci: true, iso9001: true, gots: true },
    last_verified: '2024-01-20',
    interaction_level: 'active',
    last_interaction_date: '2024-01-25',
    wechat_id: 'factory3',
    phone: '+86 137 0000 0003',
    email: 'sales@factory3.com',
    website: 'https://factory3.com',
    address_cn: '深圳市宝安区工业园789号'
  }
];

export function MobileFactoryListPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [factories, setFactories] = useState(mockFactories);
  const [activeFilters, setActiveFilters] = useState({});

  // Фильтры
  const filters = [
    {
      key: 'segment',
      label: 'Сегмент',
      type: 'select' as const,
      options: [
        { value: 'premium', label: 'Премиум', count: 2 },
        { value: 'standard', label: 'Стандарт', count: 1 },
        { value: 'budget', label: 'Бюджет', count: 0 }
      ]
    },
    {
      key: 'specialization',
      label: 'Специализация',
      type: 'multiselect' as const,
      options: [
        { value: 'knit', label: 'Трикотаж', count: 1 },
        { value: 'woven', label: 'Ткань', count: 1 },
        { value: 'outerwear', label: 'Верхняя одежда', count: 1 },
        { value: 'sportswear', label: 'Спортивная одежда', count: 1 }
      ]
    },
    {
      key: 'city',
      label: 'Город',
      type: 'select' as const,
      options: [
        { value: 'shanghai', label: 'Шанхай', count: 1 },
        { value: 'guangzhou', label: 'Гуанчжоу', count: 1 },
        { value: 'shenzhen', label: 'Шэньчжэнь', count: 1 }
      ]
    },
    {
      key: 'moq',
      label: 'Минимальный заказ',
      type: 'range' as const,
      options: []
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Здесь будет логика поиска
  };

  const handleFiltersChange = (newFilters: any) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
    // Здесь будет логика фильтрации
  };

  const handleFactoryClick = (factoryId: string) => {
    router.push(`/factories/${factoryId}`);
  };

  const handleFactoryChat = (factoryId: string) => {
    router.push(`/rfq/create?factory=${factoryId}`);
  };

  const handleLoadMore = () => {
    setLoading(true);
    // Симуляция загрузки
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const filteredFactories = factories.filter(factory => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        factory.legal_name_en?.toLowerCase().includes(searchLower) ||
        factory.legal_name_cn?.toLowerCase().includes(searchLower) ||
        factory.city?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredFactories.length / 6);
  const startIndex = (currentPage - 1) * 6;
  const endIndex = startIndex + 6;
  const currentFactories = filteredFactories.slice(startIndex, endIndex);

  return (
    <MobileLayout>
      <MobileContainer>
        {/* Header */}
        <MobileSection className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TouchButton
              variant="ghost"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => router.back()}
              touchTarget="default"
            >
              Назад
            </TouchButton>
            
            <div className="flex items-center gap-2">
              <TouchButton
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                icon={<Grid className="w-4 h-4" />}
                onClick={() => setViewMode('grid')}
                touchTarget="default"
              />
              <TouchButton
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                icon={<List className="w-4 h-4" />}
                onClick={() => setViewMode('list')}
                touchTarget="default"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Каталог фабрик
          </h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск фабрик..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <MobileFilters
            filters={filters}
            activeFilters={activeFilters}
            onFiltersChange={handleFiltersChange}
            onClearAll={() => setActiveFilters({})}
          />
        </MobileSection>

        {/* Results */}
        <MobileSection>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Найдено {filteredFactories.length} фабрик
            </p>
          </div>

          {/* Factory Cards */}
          {loading ? (
            <MobileLoadingState message="Загрузка фабрик..." />
          ) : currentFactories.length === 0 ? (
            <MobileEmptyState
              title="Фабрики не найдены"
              description="Попробуйте изменить параметры поиска или фильтры"
              action={
                <TouchButton
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilters({});
                  }}
                  touchTarget="default"
                >
                  Сбросить фильтры
                </TouchButton>
              }
            />
          ) : (
            <div className={`space-y-4 ${
              viewMode === 'grid' && !isMobile ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''
            }`}>
              {currentFactories.map((factory) => (
                viewMode === 'list' ? (
                  <MobileFactoryCardCompact
                    key={factory.factory_id}
                    factory={factory}
                    onClick={handleFactoryClick}
                    onChat={handleFactoryChat}
                  />
                ) : (
                  <MobileFactoryCard
                    key={factory.factory_id}
                    factory={factory}
                    onClick={handleFactoryClick}
                    onChat={handleFactoryChat}
                  />
                )
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <MobilePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                compact={isMobile}
              />
            </div>
          )}

          {/* Infinite Scroll Alternative */}
          {isMobile && (
            <div className="mt-8">
              <MobileInfiniteScroll
                hasMore={currentPage < totalPages}
                isLoading={loading}
                onLoadMore={handleLoadMore}
              />
            </div>
          )}
        </MobileSection>
      </MobileContainer>
    </MobileLayout>
  );
}
