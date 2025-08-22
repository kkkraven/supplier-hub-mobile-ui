'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { TouchButton } from './touch-button';
import { Badge } from './badge';
import { useIsMobile } from './use-mobile';
import { cn } from './utils';

// ============================================================================
// 1. MOBILE RATING COMPONENT
// ============================================================================

interface MobileRatingProps {
  value: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  onValueChange?: (value: number) => void;
  className?: string;
}

export function MobileRating({
  value,
  maxValue = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  onValueChange,
  className
}: MobileRatingProps) {
  const isMobile = useIsMobile();
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onValueChange) {
      onValueChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxValue }, (_, index) => {
          const rating = index + 1;
          const isFilled = rating <= displayValue;
          const isHovered = rating === hoverValue;

          return (
            <button
              key={rating}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'transition-all duration-200',
                !readonly && 'hover:scale-110 active:scale-95',
                isMobile && 'touch-target'
              )}
              style={{
                minWidth: size === 'lg' ? '48px' : size === 'md' ? '40px' : '32px',
                minHeight: size === 'lg' ? '48px' : size === 'md' ? '40px' : '32px'
              }}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300',
                  isHovered && !readonly && 'scale-110'
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 2. MOBILE SLIDER COMPONENT
// ============================================================================

interface MobileSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  showLabels?: boolean;
  onValueChange?: (value: number) => void;
  className?: string;
}

export function MobileSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  showLabels = false,
  onValueChange,
  className
}: MobileSliderProps) {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const newValue = Math.round((percentage / 100) * (max - min) / step) * step + min;
    const clampedValue = Math.max(min, Math.min(max, newValue));

    onValueChange?.(clampedValue);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const percentage = (touchX / rect.width) * 100;
    const newValue = Math.round((percentage / 100) * (max - min) / step) * step + min;
    const clampedValue = Math.max(min, Math.min(max, newValue));

    onValueChange?.(clampedValue);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Labels and Value */}
      <div className="flex items-center justify-between">
        {showLabels && (
          <span className="text-sm text-gray-600">{min}</span>
        )}
        {showValue && (
          <span className="text-sm font-medium text-gray-900">{value}</span>
        )}
        {showLabels && (
          <span className="text-sm text-gray-600">{max}</span>
        )}
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className={cn(
          'relative h-2 bg-gray-200 rounded-full cursor-pointer transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          isMobile && 'touch-target'
        )}
        style={{
          minHeight: isMobile ? '48px' : '8px'
        }}
        onClick={handleSliderClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md transition-all duration-200',
            isDragging && 'scale-110',
            isMobile && 'w-6 h-6'
          )}
          style={{
            left: `calc(${percentage}% - ${isMobile ? '12px' : '8px'})`,
            minWidth: isMobile ? '48px' : '16px',
            minHeight: isMobile ? '48px' : '16px'
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3. MOBILE TOGGLE COMPONENT
// ============================================================================

interface MobileToggleProps {
  checked: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function MobileToggle({
  checked,
  disabled = false,
  size = 'md',
  label,
  description,
  onCheckedChange,
  className
}: MobileToggleProps) {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const handleToggle = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:opacity-80',
          isMobile && 'touch-target',
          sizeClasses[size]
        )}
        style={{
          minWidth: size === 'lg' ? '64px' : size === 'md' ? '48px' : '32px',
          minHeight: size === 'lg' ? '32px' : size === 'md' ? '24px' : '16px'
        }}
      >
        <div
          className={cn(
            'bg-white rounded-full shadow-md transition-transform duration-200',
            checked && 'translate-x-full',
            thumbSizeClasses[size]
          )}
          style={{
            transform: checked ? 'translateX(100%)' : 'translateX(0)',
            marginLeft: size === 'lg' ? '2px' : size === 'md' ? '1px' : '1px',
            marginRight: size === 'lg' ? '2px' : size === 'md' ? '1px' : '1px'
          }}
        />
      </button>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. MOBILE PROGRESS BAR COMPONENT
// ============================================================================

interface MobileProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

export function MobileProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  animated = false,
  className
}: MobileProgressBarProps) {
  const isMobile = useIsMobile();
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size],
          isMobile && 'touch-target'
        )}
        style={{
          minHeight: isMobile ? '24px' : size === 'lg' ? '16px' : size === 'md' ? '12px' : '8px'
        }}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Value Display */}
      {showValue && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Прогресс</span>
          <span className="font-medium text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. MOBILE INTERACTION BUTTONS COMPONENT
// ============================================================================

interface MobileInteractionButtonProps {
  type: 'like' | 'dislike' | 'heart' | 'comment' | 'share' | 'bookmark' | 'more';
  count?: number;
  active?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function MobileInteractionButton({
  type,
  count = 0,
  active = false,
  disabled = false,
  size = 'md',
  onClick,
  className
}: MobileInteractionButtonProps) {
  const isMobile = useIsMobile();

  const icons = {
    like: ThumbsUp,
    dislike: ThumbsDown,
    heart: Heart,
    comment: MessageCircle,
    share: Share2,
    bookmark: Bookmark,
    more: MoreHorizontal
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const Icon = icons[type];

  const getActiveColor = () => {
    switch (type) {
      case 'like':
        return 'text-blue-500';
      case 'dislike':
        return 'text-red-500';
      case 'heart':
        return 'text-red-500';
      case 'comment':
        return 'text-green-500';
      case 'share':
        return 'text-purple-500';
      case 'bookmark':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TouchButton
        variant={active ? 'primary' : 'ghost'}
        size={size}
        icon={<Icon className={cn(iconSizeClasses[size], active && getActiveColor())} />}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'transition-all duration-200',
          active && 'bg-primary/10',
          sizeClasses[size]
        )}
        touchTarget="default"
      />

      {count !== undefined && count > 0 && (
        <span className={cn(
          'text-sm font-medium',
          active ? 'text-primary' : 'text-gray-600'
        )}>
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 6. MOBILE INTERACTION BAR COMPONENT
// ============================================================================

interface InteractionItem {
  type: 'like' | 'dislike' | 'heart' | 'comment' | 'share' | 'bookmark' | 'more';
  count?: number;
  active?: boolean;
}

interface MobileInteractionBarProps {
  items: InteractionItem[];
  onItemClick?: (type: string) => void;
  className?: string;
}

export function MobileInteractionBar({
  items,
  onItemClick,
  className
}: MobileInteractionBarProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-white border-t border-gray-200',
      isMobile && 'pb-6', // Extra padding for mobile safe area
      className
    )}>
      <div className="flex items-center gap-4">
        {items.map((item) => (
          <MobileInteractionButton
            key={item.type}
            type={item.type}
            count={item.count}
            active={item.active}
            onClick={() => onItemClick?.(item.type)}
            size="md"
          />
        ))}
      </div>
    </div>
  );
}
