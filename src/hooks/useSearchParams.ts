'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { SearchFilters } from '../components/ui/factory-search';

export function useSearchParamsState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Получаем текущие параметры из URL
  const currentParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return {
      searchTerm: params.get('q') || '',
      segment: params.get('segment') || 'all',
      city: params.get('city') || 'all',
      specialization: params.get('spec') || 'all',
      sortBy: (params.get('sort') as SearchFilters['sortBy']) || 'date',
      sortOrder: (params.get('order') as 'asc' | 'desc') || 'desc',
      page: parseInt(params.get('page') || '1', 10)
    };
  }, [searchParams]);

  // Обновляем URL параметры
  const updateSearchParams = useCallback((updates: Partial<SearchFilters & { page?: number }>) => {
    const params = new URLSearchParams(searchParams);
    
    // Обновляем параметры
    if (updates.searchTerm !== undefined) {
      if (updates.searchTerm) {
        params.set('q', updates.searchTerm);
      } else {
        params.delete('q');
      }
    }
    
    if (updates.segment !== undefined) {
      if (updates.segment !== 'all') {
        params.set('segment', updates.segment);
      } else {
        params.delete('segment');
      }
    }
    
    if (updates.city !== undefined) {
      if (updates.city !== 'all') {
        params.set('city', updates.city);
      } else {
        params.delete('city');
      }
    }
    
    if (updates.specialization !== undefined) {
      if (updates.specialization !== 'all') {
        params.set('spec', updates.specialization);
      } else {
        params.delete('spec');
      }
    }
    
    if (updates.sortBy !== undefined) {
      if (updates.sortBy !== 'date') {
        params.set('sort', updates.sortBy);
      } else {
        params.delete('sort');
      }
    }
    
    if (updates.sortOrder !== undefined) {
      if (updates.sortOrder !== 'desc') {
        params.set('order', updates.sortOrder);
      } else {
        params.delete('order');
      }
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set('page', updates.page.toString());
      } else {
        params.delete('page');
      }
    }

    // Сбрасываем страницу при изменении фильтров (кроме самой страницы)
    if (Object.keys(updates).some(key => key !== 'page')) {
      params.delete('page');
    }

    // Обновляем URL
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  }, [searchParams, router, pathname]);

  // Очищаем все фильтры
  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Получаем объект фильтров для компонента FactorySearch
  const filters: SearchFilters = useMemo(() => ({
    searchTerm: currentParams.searchTerm,
    segment: currentParams.segment,
    city: currentParams.city,
    specialization: currentParams.specialization,
    sortBy: currentParams.sortBy,
    sortOrder: currentParams.sortOrder
  }), [currentParams]);

  return {
    filters,
    currentPage: currentParams.page,
    updateSearchParams,
    clearFilters,
    hasActiveFilters: currentParams.searchTerm || 
                     currentParams.segment !== 'all' || 
                     currentParams.city !== 'all' || 
                     currentParams.specialization !== 'all' ||
                     currentParams.sortBy !== 'date' ||
                     currentParams.sortOrder !== 'desc'
  };
}
