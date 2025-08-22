'use client'

import React from 'react';
import { useIsMobile } from './use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBottomPadding?: boolean;
}

export function MobileLayout({ 
  children, 
  className = '', 
  showBottomPadding = true 
}: MobileLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`min-h-screen bg-gray-50 ${className}`}
      style={{
        paddingBottom: isMobile && showBottomPadding ? '4rem' : '0'
      }}
    >
      {children}
    </div>
  );
}

// Компонент для контейнера с адаптивными отступами
export function MobileContainer({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      style={{
        paddingBottom: isMobile ? '1rem' : '2rem'
      }}
    >
      {children}
    </div>
  );
}

// Компонент для секций с адаптивными отступами
export function MobileSection({ 
  children, 
  className = '',
  padding = 'default'
}: {
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'default' | 'large';
}) {
  const isMobile = useIsMobile();
  
  const paddingClasses = {
    small: isMobile ? 'py-4' : 'py-6',
    default: isMobile ? 'py-6' : 'py-8',
    large: isMobile ? 'py-8' : 'py-12'
  };

  return (
    <section className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  );
}
