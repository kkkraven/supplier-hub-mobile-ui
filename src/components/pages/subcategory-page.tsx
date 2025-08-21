"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Star, 
  TrendingUp, 
  Package, 
  Grid, 
  List 
} from 'lucide-react';
import { FactorySearch } from '../ui/factory-search';
import { FactoryCard } from '../factory-card';
import { FactoryCardSkeleton } from '../ui/loading-spinner';
import { Pagination } from '../ui/pagination';
import { useFactories } from '../../hooks/useFactories';
import { useSearchParamsState } from '../../hooks/useSearchParams';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from './category-page';
import { SearchFilters } from '../../types/factory';

interface SubcategoryPageProps {
  categorySlug: string;
  subcategorySlug: string;
}

export function SubcategoryPage({ categorySlug, subcategorySlug }: SubcategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage] = useState(6);
  const router = useRouter();

  // Получаем информацию о категории и подкатегории
  const category = CATEGORIES[categorySlug as keyof typeof CATEGORIES];
  const subcategory = category?.subcategories.find(sub => sub.slug === subcategorySlug);
  
  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Подкатегория не найдена</h1>
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

  // Используем хук для получения данных из Supabase с фильтром по подкатегории
  const { factories, loading, error, totalCount } = useFactories({
    searchTerm: filters.searchTerm,
    segment: filters.segment,
    city: filters.city,
    specialization: `${categorySlug}-${subcategorySlug}`, // Фильтруем по подкатегории
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
    // Сохраняем текущую подкатегорию при изменении фильтров
    updateSearchParams({
      ...newFilters,
      specialization: `${categorySlug}-${subcategorySlug}`
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleCategoryChange = (newCategorySlug: string) => {
    router.push(`/categories/${newCategorySlug}`);
  };

  const handleSubcategoryChange = (newSubcategorySlug: string) => {
    router.push(`/categories/${categorySlug}/${newSubcategorySlug}`);
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
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
            <Button
              variant="link"
              className="p-0 h-auto text-gray-600 hover:text-gray-900"
              onClick={() => handleCategoryChange(categorySlug)}
            >
              {category.name}
            </Button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{subcategory.name}</span>
          </div>
          
          {/* Subcategory Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full ${subcategory.color} flex items-center justify-center text-2xl mr-4`}>
                {subcategory.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {subcategory.name}
                </h1>
                <p className="text-lg text-gray-600">{subcategory.nameEn}</p>
                <Badge variant="outline" className="mt-2">
                  Подкатегория {category.name}
                </Badge>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subcategory.description}
            </p>
          </div>

          {/* Subcategory Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Всего фабрик</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Средний рейтинг</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">4.2</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Срок (дни)</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">25</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Package className="w-5 h-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Средний MOQ</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">500</p>
              </CardContent>
            </Card>
          </div>

          {/* Subcategory Navigation */}
          {category.subcategories.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Подкатегории {category.name}</h3>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((sub) => (
                  <Button
                    key={sub.slug}
                    variant={sub.slug === subcategorySlug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSubcategoryChange(sub.slug)}
                    className="flex items-center gap-2"
                  >
                    <span>{sub.icon}</span>
                    {sub.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Category Navigation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Все категории</h3>
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
                <Package className="w-16 h-16 mx-auto" />
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
                  <FactoryCard
                    key={factory.factory_id}
                    factory={factory}
                    viewMode={viewMode}
                    onFactoryClick={handleFactoryClick}
                    onFactoryChat={handleFactoryChat}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
