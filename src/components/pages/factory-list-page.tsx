'use client';

import React, { useState } from 'react';
import { ArrowLeft, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
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



interface FactoryListPageProps {
  onNavigate?: (page: string) => void;
}

export function FactoryListPage({ onNavigate }: FactoryListPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage] = useState(6);
  const router = useRouter();

  // Используем хук для работы с URL параметрами
  const { filters, currentPage, updateSearchParams } = useSearchParamsState();

  // Используем хук для получения данных из Supabase
  const { factories, loading, error, totalCount } = useFactories({
    searchTerm: filters.searchTerm,
    segment: filters.segment,
    city: filters.city,
    specialization: filters.specialization,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  });

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      router.push(`/${page}`);
    }
  };

  const handleFactoryClick = (factoryId: string) => {
    router.push(`/factories/${factoryId}`);
  };

  const handleFactoryChat = (factoryId: string) => {
    // Здесь будет логика для начала чата с фабрикой
    console.log('Start chat with factory:', factoryId);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    updateSearchParams(newFilters);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
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
            onClick={() => handleNavigate('')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
                     <div className="text-center mb-8">
             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Каталог фабрик
             </h1>
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
                <Search className="w-16 h-16 mx-auto" />
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
                <Search className="w-16 h-16 mx-auto" />
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
