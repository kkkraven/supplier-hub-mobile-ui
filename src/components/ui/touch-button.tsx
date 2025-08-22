'use client'

import React from 'react';
import { useIsMobile } from './use-mobile';
import { cn } from './utils';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  touchTarget?: 'default' | 'large';
}

export function TouchButton({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className,
  touchTarget = 'default',
  ...props
}: TouchButtonProps) {
  const isMobile = useIsMobile();

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-95',
    className
  );

  const variantClasses = {
    default: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'text-gray-700 hover:bg-gray-100',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl'
  };

  const touchTargetClasses = {
    default: 'touch-target',
    large: 'touch-target-large'
  };

  const mobileClasses = isMobile ? 'mobile-touch-feedback mobile-optimized-animation' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        touchTargetClasses[touchTarget],
        mobileClasses
      )}
      style={{
        minHeight: touchTarget === 'large' ? '60px' : '44px',
        minWidth: touchTarget === 'large' ? '60px' : '44px'
      }}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-shrink-0">{children}</span>
    </button>
  );
}

// Специализированные кнопки для мобильной навигации
export function MobileNavButton({
  icon,
  label,
  isActive = false,
  onClick,
  className
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <TouchButton
      variant={isActive ? 'primary' : 'ghost'}
      size="md"
      icon={icon}
      onClick={onClick}
      className={cn(
        'flex-col gap-1 w-full',
        isActive && 'bg-primary text-white',
        className
      )}
      touchTarget="large"
    >
      {label}
    </TouchButton>
  );
}

// Кнопка для мобильного меню
export function MobileMenuButton({
  icon,
  label,
  isActive = false,
  onClick,
  className
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <TouchButton
      variant={isActive ? 'primary' : 'ghost'}
      size="md"
      icon={icon}
      onClick={onClick}
      className={cn(
        'w-full justify-start text-left',
        isActive && 'bg-primary text-white',
        className
      )}
      touchTarget="default"
    >
      {label}
    </TouchButton>
  );
}
