'use client'

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TouchButton } from './touch-button';
import { useIsMobile } from './use-mobile';
import { cn } from './utils';

// ============================================================================
// 1. MOBILE PAGINATION COMPONENT
// ============================================================================

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className
}: MobilePaginationProps) {
  const isMobile = useIsMobile();

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Mobile version - simplified with larger touch targets
  if (isMobile) {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {/* Previous Button */}
        <TouchButton
          variant="outline"
          size="lg"
          icon={<ChevronLeft className="w-5 h-5" />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex-shrink-0"
          touchTarget="large"
        />

        {/* Page Info */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            {currentPage}
          </span>
          <span className="text-sm text-gray-500">из</span>
          <span className="text-sm font-medium text-gray-700">
            {totalPages}
          </span>
        </div>

        {/* Next Button */}
        <TouchButton
          variant="outline"
          size="lg"
          icon={<ChevronRight className="w-5 h-5" />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex-shrink-0"
          touchTarget="large"
        />
      </div>
    );
  }

  // Desktop version - full pagination
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {/* First Page Button */}
      {showFirstLast && currentPage > 1 && (
        <TouchButton
          variant="outline"
          size="md"
          icon={<ChevronsLeft className="w-4 h-4" />}
          onClick={() => handlePageChange(1)}
          className="flex-shrink-0"
          touchTarget="default"
        />
      )}

      {/* Previous Button */}
      <TouchButton
        variant="outline"
        size="md"
        icon={<ChevronLeft className="w-4 h-4" />}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex-shrink-0"
        touchTarget="default"
      />

      {/* Page Numbers */}
      {showPageNumbers && (
        <>
          {/* Show ellipsis at start if needed */}
          {visiblePages[0] > 1 && (
            <>
              <TouchButton
                variant="outline"
                size="md"
                onClick={() => handlePageChange(1)}
                className="flex-shrink-0"
                touchTarget="default"
              >
                1
              </TouchButton>
              {visiblePages[0] > 2 && (
                <div className="flex items-center justify-center w-10 h-10">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </>
          )}

          {/* Visible Page Numbers */}
          {visiblePages.map((page) => (
            <TouchButton
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="md"
              onClick={() => handlePageChange(page)}
              className="flex-shrink-0"
              touchTarget="default"
            >
              {page}
            </TouchButton>
          ))}

          {/* Show ellipsis at end if needed */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <div className="flex items-center justify-center w-10 h-10">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <TouchButton
                variant="outline"
                size="md"
                onClick={() => handlePageChange(totalPages)}
                className="flex-shrink-0"
                touchTarget="default"
              >
                {totalPages}
              </TouchButton>
            </>
          )}
        </>
      )}

      {/* Next Button */}
      <TouchButton
        variant="outline"
        size="md"
        icon={<ChevronRight className="w-4 h-4" />}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex-shrink-0"
        touchTarget="default"
      />

      {/* Last Page Button */}
      {showFirstLast && currentPage < totalPages && (
        <TouchButton
          variant="outline"
          size="md"
          icon={<ChevronsRight className="w-4 h-4" />}
          onClick={() => handlePageChange(totalPages)}
          className="flex-shrink-0"
          touchTarget="default"
        />
      )}
    </div>
  );
}

// ============================================================================
// 2. MOBILE INFINITE SCROLL COMPONENT
// ============================================================================

interface MobileInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingText?: string;
  endText?: string;
  className?: string;
}

export function MobileInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  loadingText = 'Загрузка...',
  endText = 'Больше нет данных',
  className
}: MobileInfiniteScrollProps) {
  const isMobile = useIsMobile();

  if (!hasMore && !isLoading) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-sm text-gray-500">{endText}</p>
      </div>
    );
  }

  return (
    <div className={cn('text-center py-6', className)}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-gray-600">{loadingText}</span>
        </div>
      ) : (
        <TouchButton
          variant="outline"
          size="lg"
          onClick={onLoadMore}
          className="w-full max-w-xs"
          touchTarget="large"
        >
          Загрузить еще
        </TouchButton>
      )}
    </div>
  );
}

// ============================================================================
// 3. MOBILE LOAD MORE BUTTON COMPONENT
// ============================================================================

interface MobileLoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingText?: string;
  buttonText?: string;
  className?: string;
}

export function MobileLoadMore({
  hasMore,
  isLoading,
  onLoadMore,
  loadingText = 'Загрузка...',
  buttonText = 'Показать еще',
  className
}: MobileLoadMoreProps) {
  const isMobile = useIsMobile();

  if (!hasMore) return null;

  return (
    <div className={cn('flex justify-center py-6', className)}>
      <TouchButton
        variant="outline"
        size={isMobile ? 'lg' : 'md'}
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-32"
        touchTarget={isMobile ? 'large' : 'default'}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            <span>{loadingText}</span>
          </div>
        ) : (
          buttonText
        )}
      </TouchButton>
    </div>
  );
}

// ============================================================================
// 4. MOBILE PAGINATION INFO COMPONENT
// ============================================================================

interface MobilePaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export function MobilePaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}: MobilePaginationInfoProps) {
  const isMobile = useIsMobile();

  const getDisplayText = () => {
    if (totalItems && itemsPerPage) {
      const start = (currentPage - 1) * itemsPerPage + 1;
      const end = Math.min(currentPage * itemsPerPage, totalItems);
      return `Показано ${start}-${end} из ${totalItems}`;
    }
    return `Страница ${currentPage} из ${totalPages}`;
  };

  return (
    <div className={cn(
      'text-center text-sm text-gray-600',
      isMobile && 'py-2',
      className
    )}>
      {getDisplayText()}
    </div>
  );
}

// ============================================================================
// 5. MOBILE PAGINATION CONTROLS COMPONENT
// ============================================================================

interface MobilePaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
}

export function MobilePaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = false,
  className
}: MobilePaginationControlsProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pagination Info */}
      <MobilePaginationInfo
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
      />

      {/* Page Size Selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Показать:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{
              minHeight: isMobile ? '44px' : '32px'
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination */}
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showFirstLast={!isMobile}
        showPageNumbers={!isMobile}
        maxVisiblePages={isMobile ? 3 : 5}
      />
    </div>
  );
}
