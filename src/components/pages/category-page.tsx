'use client';

import React, { useState } from 'react';
import { ArrowLeft, Grid, List, TrendingUp, MapPin, Star, Users, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../ui/pagination';
import { FactoryCard } from '../factory-card';
import { FactoryListItem } from '../factory-list-item';
import { LoadingSpinner, FactoryCardSkeleton } from '../ui/loading-spinner';
import { FactorySearch, SearchFilters } from '../ui/factory-search';
import { useFactories } from '../../hooks/useFactories';
import { useSearchParamsState } from '../../hooks/useSearchParams';
import { useRouter } from 'next/navigation';
import { SubcategoriesList } from '../ui/subcategories-list';

// Определяем категории с подкатегориями
export const CATEGORIES = {
  knit: {
    slug: 'knit',
    name: 'Трикотаж',
    nameEn: 'Knit',
    description: 'Фабрики по производству трикотажных изделий',
    icon: '🧶',
    color: 'bg-blue-500',
    stats: {
      totalFactories: 45,
      avgRating: 4.2,
      avgLeadTime: 25,
      avgMOQ: 500
    },
    subcategories: [
      {
        slug: 'socks-hosiery',
        name: 'Носки и чулочно-носочные изделия',
        nameEn: 'Socks & Hosiery',
        description: 'Производство носков, гольфов, чулок и колготок',
        icon: '🧦',
        color: 'bg-blue-400'
      }
    ]
  },
  woven: {
    slug: 'woven',
    name: 'Ткань',
    nameEn: 'Woven',
    description: 'Фабрики по производству тканевых изделий',
    icon: '🧵',
    color: 'bg-green-500',
    stats: {
      totalFactories: 38,
      avgRating: 4.1,
      avgLeadTime: 30,
      avgMOQ: 300
    },
    subcategories: [
      {
        slug: 'men-women-apparel',
        name: 'Мужская и женская одежда',
        nameEn: 'Men/Women Apparel',
        description: 'Производство мужской и женской одежды из тканей',
        icon: '👕',
        color: 'bg-green-400'
      }
    ]
  },
  sports: {
    slug: 'sports',
    name: 'Спортивная одежда',
    nameEn: 'Sports',
    description: 'Фабрики по производству спортивной одежды',
    icon: '🏃‍♂️',
    color: 'bg-orange-500',
    stats: {
      totalFactories: 32,
      avgRating: 4.3,
      avgLeadTime: 28,
      avgMOQ: 400
    },
    subcategories: []
  },
  luxury: {
    slug: 'luxury',
    name: 'Премиум одежда',
    nameEn: 'Luxury',
    description: 'Фабрики по производству премиальной одежды',
    icon: '👑',
    color: 'bg-purple-500',
    stats: {
      totalFactories: 25,
      avgRating: 4.5,
      avgLeadTime: 35,
      avgMOQ: 200
    },
    subcategories: []
  },
  technical: {
    slug: 'technical',
    name: 'Техническая одежда',
    nameEn: 'Technical',
    description: 'Фабрики по производству технической одежды',
    icon: '🔧',
    color: 'bg-gray-500',
    stats: {
      totalFactories: 28,
      avgRating: 4.0,
      avgLeadTime: 32,
      avgMOQ: 350
    },
    subcategories: []
  },
  denim: {
    slug: 'denim',
    name: 'Джинсовая одежда',
    nameEn: 'Denim',
    description: 'Фабрики по производству джинсовой одежды',
    icon: '👖',
    color: 'bg-indigo-500',
    stats: {
      totalFactories: 35,
      avgRating: 4.2,
      avgLeadTime: 27,
      avgMOQ: 450
    },
    subcategories: []
  },
  accessories: {
    slug: 'accessories',
    name: 'Аксессуары',
    nameEn: 'Accessories',
    description: 'Фабрики по производству аксессуаров',
    icon: '👜',
    color: 'bg-pink-500',
    stats: {
      totalFactories: 42,
      avgRating: 4.1,
      avgLeadTime: 22,
      avgMOQ: 250
    },
    subcategories: [
      {
        slug: 'packaging-hardware',
        name: 'Упаковка и фурнитура',
        nameEn: 'Packaging & Hardware',
        description: 'Производство упаковки, фурнитуры и комплектующих',
        icon: '📦',
        color: 'bg-pink-400'
      }
    ]
  },
  // Новые основные категории
  homeTextile: {
    slug: 'home-textile',
    name: 'Домашний текстиль',
    nameEn: 'Home Textile',
    description: 'Фабрики по производству домашнего текстиля',
    icon: '🛏️',
    color: 'bg-teal-500',
    stats: {
      totalFactories: 28,
      avgRating: 4.0,
      avgLeadTime: 30,
      avgMOQ: 400
    },
    subcategories: []
  }
};

interface CategoryPageProps {
  categorySlug: string;
}

export function CategoryPage({ categorySlug }: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage] = useState(6);
  const router = useRouter();

  // Получаем информацию о категории
  const category = CATEGORIES[categorySlug as keyof typeof CATEGORIES];
  
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h1>
          <Button onClick={() => router.push('/factories')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к фабрикам
          </Button>
        </div>
      </div>
    );
  }

  // Используем хук для работы с URL параметрами
  const { filters, currentPage, updateSearchParams } = useSearchParamsState();

  // Используем хук для получения данных из Supabase с фильтром по категории
  const { factories, loading, error, totalCount } = useFactories({
    searchTerm: filters.searchTerm,
    segment: filters.segment,
    city: filters.city,
    specialization: categorySlug, // Фильтруем по текущей категории
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  });

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const handleFactoryClick = (factoryId: string) => {
    router.push(`/factories/${factoryId}`);
  };

  const handleFactoryChat = (factoryId: string) => {
    console.log('Start chat with factory:', factoryId);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    // Сохраняем текущую категорию при изменении фильтров
    updateSearchParams({
      ...newFilters,
      specialization: categorySlug
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleCategoryChange = (newCategorySlug: string) => {
    router.push(`/categories/${newCategorySlug}`);
  };

  // Пагинация
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => handleNavigate('factories')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к фабрикам
          </Button>
          
          {/* Category Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-2xl mr-4`}>
                {category.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {category.name}
                </h1>
                <p className="text-lg text-gray-600">{category.nameEn}</p>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {category.description}
            </p>
          </div>

          {/* Category Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Всего фабрик</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{category.stats.totalFactories}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Средний рейтинг</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{category.stats.avgRating}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Срок (дни)</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{category.stats.avgLeadTime}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Package className="w-5 h-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Средний MOQ</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{category.stats.avgMOQ}</p>
              </CardContent>
            </Card>
          </div>

          {/* Subcategories */}
          <SubcategoriesList
            subcategories={category.subcategories}
            parentCategorySlug={categorySlug}
            className="mb-8"
          />

          {/* Category Navigation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Категории</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(CATEGORIES).map((cat) => (
                <Button
                  key={cat.slug}
                  variant={cat.slug === categorySlug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className="flex items-center gap-2"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Search and Filters */}
          <FactorySearch
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalResults={totalCount}
            loading={loading}
          />
          
          {/* View Mode Toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Factories Grid/List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="text-center py-16">
              <div className="text-red-400 mb-4">
                <TrendingUp className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-red-600">
                {error}
              </p>
            </div>
          )}

          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <FactoryCardSkeleton key={index} />
              ))}
            </div>
          ) : factories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <TrendingUp className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Фабрики не найдены
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить параметры поиска или фильтры
              </p>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {factories.map((factory) => (
                  viewMode === 'grid' ? (
                    <FactoryCard
                      key={factory.factory_id}
                      factory={factory}
                      onClick={handleFactoryClick}
                      onChat={handleFactoryChat}
                      isPaywallActive={false}
                    />
                  ) : (
                    <FactoryListItem
                      key={factory.factory_id}
                      factory={factory}
                      onClick={handleFactoryClick}
                      onChat={handleFactoryChat}
                      isPaywallActive={false}
                    />
                  )
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
