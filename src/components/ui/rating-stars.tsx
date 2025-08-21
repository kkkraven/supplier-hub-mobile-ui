'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className = ''
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [localRating, setLocalRating] = React.useState(rating);

  React.useEffect(() => {
    setLocalRating(rating);
  }, [rating]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      setLocalRating(starRating);
      onRatingChange(starRating);
    }
  };

  const displayRating = hoverRating || localRating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalf = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'transition-colors duration-200',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : isHalf
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-2">
          {localRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}


