import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

// Компонент для отображения состояния загрузки в виде скелетона
export function LoadingSkeleton({ 
  className = '',
  lines = 3 
}: { 
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  );
}

// Компонент для отображения состояния загрузки карточек фабрик
export function FactoryCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-8 mx-auto" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-12 mx-auto" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
        </div>
      </div>
    </div>
  );
}
