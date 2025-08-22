'use client'

import React from 'react';
import { ChevronRight, MoreHorizontal, SortAsc, SortDesc } from 'lucide-react';
import { TouchButton } from './touch-button';
import { Badge } from './badge';
import { useIsMobile } from './use-mobile';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function MobileTable({
  columns,
  data,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  className,
  emptyMessage = 'Нет данных',
  loading = false
}: MobileTableProps) {
  const isMobile = useIsMobile();

  const handleSort = (column: Column) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  const renderSortIcon = (column: Column) => {
    if (!column.sortable) return null;
    
    if (sortColumn === column.key) {
      return sortDirection === 'asc' ? (
        <SortAsc className="w-4 h-4" />
      ) : (
        <SortDesc className="w-4 h-4" />
      );
    }
    
    return <SortAsc className="w-4 h-4 text-gray-300" />;
  };

  // Desktop version - traditional table
  if (!isMobile) {
    return (
      <div className={`overflow-x-auto bg-white border border-gray-200 rounded-lg ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => handleSort(column)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

  // Mobile version - card layout
  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((row, index) => (
        <div
          key={index}
          className={`bg-white border border-gray-200 rounded-lg p-4 ${
            onRowClick ? 'cursor-pointer active:scale-[0.98]' : ''
          } transition-all duration-200`}
          onClick={() => onRowClick?.(row)}
        >
          <div className="space-y-3">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                  {column.label}
                </span>
                <div className="text-sm text-gray-900 min-w-0 flex-1 text-right">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              </div>
            ))}
          </div>
          
          {onRowClick && (
            <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      ))}
      
      {data.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

// Компактная версия таблицы для мобильных
export function MobileTableCompact({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = 'Нет данных'
}: MobileTableProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((row, index) => (
        <div
          key={index}
          className={`bg-white border border-gray-200 rounded-lg p-3 ${
            onRowClick ? 'cursor-pointer active:scale-[0.98]' : ''
          } transition-all duration-200`}
          onClick={() => onRowClick?.(row)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {/* Primary info - first column */}
              <div className="text-sm font-medium text-gray-900 truncate">
                {columns[0].render 
                  ? columns[0].render(row[columns[0].key], row)
                  : row[columns[0].key]
                }
              </div>
              
              {/* Secondary info - second column if exists */}
              {columns[1] && (
                <div className="text-xs text-gray-500 truncate">
                  {columns[1].render 
                    ? columns[1].render(row[columns[1].key], row)
                    : row[columns[1].key]
                  }
                </div>
              )}
            </div>
            
            {/* Action indicators */}
            <div className="flex items-center gap-2 ml-3">
              {/* Status badge from third column if exists */}
              {columns[2] && (
                <div className="text-xs">
                  {columns[2].render 
                    ? columns[2].render(row[columns[2].key], row)
                    : row[columns[2].key]
                  }
                </div>
              )}
              
              {onRowClick && (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      ))}
      
      {data.length === 0 && (
        <div className="p-6 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

// Специализированная таблица для списка фабрик
export function MobileFactoryTable({
  factories,
  onFactoryClick,
  className
}: {
  factories: any[];
  onFactoryClick?: (factory: any) => void;
  className?: string;
}) {
  const columns: Column[] = [
    {
      key: 'name',
      label: 'Название',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {row.legal_name_en || row.legal_name_cn}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {row.city}{row.province ? `, ${row.province}` : ''}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'segment',
      label: 'Сегмент',
      render: (value) => (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'moq',
      label: 'MOQ',
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value ? `${value} шт` : 'По запросу'}
        </span>
      )
    },
    {
      key: 'rating',
      label: 'Рейтинг',
      render: (value) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{value?.toFixed(1) || '-'}</span>
          <span className="text-xs text-gray-500">★</span>
        </div>
      )
    }
  ];

  return (
    <MobileTable
      columns={columns}
      data={factories}
      onRowClick={onFactoryClick}
      className={className}
      emptyMessage="Фабрики не найдены"
    />
  );
}
