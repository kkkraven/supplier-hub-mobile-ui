'use client'

import React, { useState } from 'react';
import { Filter, X, Search, MapPin, Factory, Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { TouchButton } from './touch-button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import { Separator } from './separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useIsMobile } from './use-mobile';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  type: 'select' | 'multiselect' | 'range' | 'search';
}

interface MobileFiltersProps {
  filters: FilterGroup[];
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onClearAll?: () => void;
  className?: string;
}

export function MobileFilters({
  filters,
  activeFilters,
  onFiltersChange,
  onClearAll,
  className
}: MobileFiltersProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const activeFiltersCount = Object.values(activeFilters).filter(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearAll?.();
    setIsOpen(false);
  };

  const renderFilterControl = (filter: FilterGroup) => {
    const value = localFilters[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleFilterChange(filter.key, val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Выберите ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((val) => {
                const option = filter.options.find(opt => opt.value === val);
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {option?.label}
                    <button
                      onClick={() => {
                        const newValues = selectedValues.filter(v => v !== val);
                        handleFilterChange(filter.key, newValues);
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {filter.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    const isSelected = selectedValues.includes(option.value);
                    const newValues = isSelected
                      ? selectedValues.filter(v => v !== option.value)
                      : [...selectedValues, option.value];
                    handleFilterChange(filter.key, newValues);
                  }}
                  className={`text-left p-2 rounded-lg border text-sm transition-colors ${
                    selectedValues.includes(option.value)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="text-xs opacity-75">
                        {option.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'search':
        return (
          <Input
            placeholder={`Поиск ${filter.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="От"
                value={value?.min || ''}
                onChange={(e) => handleFilterChange(filter.key, { 
                  ...value, 
                  min: e.target.value 
                })}
              />
              <Input
                placeholder="До"
                value={value?.max || ''}
                onChange={(e) => handleFilterChange(filter.key, { 
                  ...value, 
                  max: e.target.value 
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Desktop version - inline filters
  if (!isMobile) {
    return (
      <div className={`flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
        {filters.map((filter) => (
          <div key={filter.key} className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            {renderFilterControl(filter)}
          </div>
        ))}
        
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="whitespace-nowrap"
          >
            Очистить
          </Button>
          <Button
            onClick={() => onFiltersChange(localFilters)}
            className="whitespace-nowrap"
          >
            Применить
          </Button>
        </div>
      </div>
    );
  }

  // Mobile version - sheet with filters
  return (
    <>
      {/* Filter button */}
      <TouchButton
        variant="outline"
        icon={<Filter className="w-4 h-4" />}
        onClick={() => setIsOpen(true)}
        className="w-full justify-between"
        touchTarget="default"
      >
        Фильтры
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeFiltersCount}
          </Badge>
        )}
      </TouchButton>

      {/* Filter sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="px-6 py-4 border-b border-gray-200">
            <SheetTitle className="flex items-center justify-between">
              <span>Фильтры</span>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    Очистить
                  </TouchButton>
                )}
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  icon={<X className="w-4 h-4" />}
                />
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {filter.label}
                  </label>
                  {renderFilterControl(filter)}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex gap-3">
              <TouchButton
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                touchTarget="default"
              >
                Отмена
              </TouchButton>
              <TouchButton
                variant="primary"
                onClick={handleApplyFilters}
                className="flex-1"
                touchTarget="default"
              >
                Применить
              </TouchButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Компактная версия фильтров для мобильных
export function MobileFiltersCompact({
  filters,
  activeFilters,
  onFiltersChange,
  onClearAll,
  className
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.values(activeFilters).filter(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <>
      {/* Compact filter button */}
      <div className={`flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg ${className}`}>
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">Фильтры</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {activeFiltersCount}
          </Badge>
        )}
        <TouchButton
          variant="ghost"
          size="sm"
          icon={<ChevronDown className="w-4 h-4" />}
          onClick={() => setIsOpen(!isOpen)}
          touchTarget="default"
        />
      </div>

      {/* Expanded filters */}
      {isOpen && (
        <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                {/* Simplified filter controls for compact view */}
                <Select
                  value={activeFilters[filter.key] || ''}
                  onValueChange={(val) => onFiltersChange({ ...activeFilters, [filter.key]: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Выберите ${filter.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            
            <div className="flex gap-2 pt-2">
              <TouchButton
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="flex-1"
                touchTarget="default"
              >
                Очистить
              </TouchButton>
              <TouchButton
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                touchTarget="default"
              >
                Готово
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
