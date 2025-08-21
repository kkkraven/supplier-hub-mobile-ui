'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface SearchFilters {
  searchTerm: string;
  segment: string;
  city: string;
  specialization: string;
  sortBy: 'name' | 'rating' | 'date' | 'interaction';
  sortOrder: 'asc' | 'desc';
}

interface FactorySearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  totalResults?: number;
  loading?: boolean;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'По названию' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'date', label: 'По дате добавления' },
  { value: 'interaction', label: 'По уровню взаимодействия' }
];

const CITIES = [
  { value: 'all', label: 'Все города' },
  { value: '佛山', label: '佛山 / Foshan' },
  { value: '东莞', label: '东莞 / Dongguan' },
  { value: '苏州', label: '苏州 / Suzhou' },
  { value: '深圳', label: '深圳 / Shenzhen' },
  { value: '青岛', label: '青岛 / Qingdao' },
  { value: '广州', label: '广州 / Guangzhou' },
  { value: '上海', label: '上海 / Shanghai' },
  { value: '北京', label: '北京 / Beijing' }
];

const SPECIALIZATIONS = [
  { value: 'all', label: 'Все специализации' },
  { value: 'knit', label: 'Трикотаж / Knit' },
  { value: 'woven', label: 'Ткань / Woven' },
  { value: 'sports', label: 'Спортивная одежда' },
  { value: 'luxury', label: 'Премиум одежда' },
  { value: 'technical', label: 'Техническая одежда' },
  { value: 'denim', label: 'Джинсовая одежда' },
  { value: 'accessories', label: 'Аксессуары' }
];

export function FactorySearch({ 
  filters, 
  onFiltersChange, 
  totalResults, 
  loading = false,
  className = '' 
}: FactorySearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== filters.searchTerm) {
        onFiltersChange({
          ...filters,
          searchTerm: localSearchTerm
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as SearchFilters['sortBy']
    });
  };

  const handleSortOrderToggle = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      segment: 'all',
      city: 'all',
      specialization: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setLocalSearchTerm('');
  };

  const hasActiveFilters = filters.segment !== 'all' || 
                          filters.city !== 'all' || 
                          filters.specialization !== 'all' ||
                          filters.searchTerm !== '';

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.segment !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.specialization !== 'all') count++;
    if (filters.searchTerm) count++;
    return count;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Поиск по названию, городу, специализации..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-12"
          disabled={loading}
        />
        {localSearchTerm && (
          <button
            onClick={() => setLocalSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Фильтры
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Фильтры</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    Очистить
                  </Button>
                )}
              </div>
              
              {/* Segment Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Сегмент</label>
                <Select value={filters.segment} onValueChange={(value) => handleFilterChange('segment', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все сегменты</SelectItem>
                    <SelectItem value="low">Базовый</SelectItem>
                    <SelectItem value="mid">Средний</SelectItem>
                    <SelectItem value="mid+">Средний+</SelectItem>
                    <SelectItem value="high">Премиум</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Город</label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(city => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Специализация</label>
                <Select value={filters.specialization} onValueChange={(value) => handleFilterChange('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map(spec => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSortOrderToggle}
            className="px-2"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Results Count */}
        {totalResults !== undefined && (
          <div className="text-sm text-gray-600 ml-auto">
            {loading ? 'Загрузка...' : `${totalResults} фабрик найдено`}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Поиск: {filters.searchTerm}
              <button
                onClick={() => setLocalSearchTerm('')}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.segment !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Сегмент: {filters.segment === 'low' ? 'Базовый' : 
                        filters.segment === 'mid' ? 'Средний' :
                        filters.segment === 'mid+' ? 'Средний+' : 'Премиум'}
              <button
                onClick={() => handleFilterChange('segment', 'all')}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.city !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Город: {CITIES.find(c => c.value === filters.city)?.label || filters.city}
              <button
                onClick={() => handleFilterChange('city', 'all')}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.specialization !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Специализация: {SPECIALIZATIONS.find(s => s.value === filters.specialization)?.label || filters.specialization}
              <button
                onClick={() => handleFilterChange('specialization', 'all')}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Очистить все
          </Button>
        </div>
      )}
    </div>
  );
}
