'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsMobile } from './use-mobile';
import { cn } from './utils';

// ============================================================================
// 1. MOBILE PAGE TRANSITION COMPONENT
// ============================================================================

interface MobilePageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function MobilePageTransition({
  children,
  className
}: MobilePageTransitionProps) {
  const isMobile = useIsMobile();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // Начинаем анимацию выхода
      setIsExiting(true);
      
      // Через короткую задержку начинаем анимацию входа
      setTimeout(() => {
        setIsExiting(false);
        setIsEntering(true);
      }, 150);
      
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    // Завершаем анимацию входа
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isEntering]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isEntering && 'opacity-100 translate-y-0',
        isExiting && 'opacity-0 translate-y-4',
        !isEntering && !isExiting && 'opacity-100 translate-y-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 2. MOBILE MODAL TRANSITION COMPONENT
// ============================================================================

interface MobileModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export function MobileModalTransition({
  children,
  isOpen,
  onClose,
  className
}: MobileModalTransitionProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          isAnimating ? 'opacity-50' : 'opacity-0'
        )}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 transition-all duration-300 ease-out',
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 3. MOBILE DRAWER TRANSITION COMPONENT
// ============================================================================

interface MobileDrawerTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  onClose?: () => void;
  className?: string;
}

export function MobileDrawerTransition({
  children,
  isOpen,
  side = 'left',
  onClose,
  className
}: MobileDrawerTransitionProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const getTransform = () => {
    const transforms = {
      left: 'translate-x-0',
      right: 'translate-x-0',
      top: 'translate-y-0',
      bottom: 'translate-y-0'
    };
    return transforms[side];
  };

  const getInitialTransform = () => {
    const transforms = {
      left: '-translate-x-full',
      right: 'translate-x-full',
      top: '-translate-y-full',
      bottom: 'translate-y-full'
    };
    return transforms[side];
  };

  const getPositionClasses = () => {
    const positions = {
      left: 'left-0 top-0 h-full',
      right: 'right-0 top-0 h-full',
      top: 'top-0 left-0 w-full',
      bottom: 'bottom-0 left-0 w-full'
    };
    return positions[side];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          isAnimating ? 'opacity-50' : 'opacity-0'
        )}
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div
        className={cn(
          'absolute transition-all duration-300 ease-out',
          getPositionClasses(),
          isAnimating ? getTransform() : getInitialTransform(),
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 4. MOBILE LIST TRANSITION COMPONENT
// ============================================================================

interface MobileListTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileListTransition({
  children,
  className
}: MobileListTransitionProps) {
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const childrenCount = React.Children.count(children);
          const newVisibleItems: number[] = [];
          
          for (let i = 0; i < childrenCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, i]);
            }, i * 100);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'transition-all duration-300 ease-out',
            visibleItems.includes(index) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
          style={{
            transitionDelay: `${index * 100}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 5. MOBILE STATE TRANSITION COMPONENT
// ============================================================================

interface MobileStateTransitionProps {
  children: React.ReactNode;
  state: string;
  states: Record<string, React.ReactNode>;
  className?: string;
}

export function MobileStateTransition({
  children,
  state,
  states,
  className
}: MobileStateTransitionProps) {
  const isMobile = useIsMobile();
  const [currentState, setCurrentState] = useState(state);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentState !== state) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentState(state);
        setIsTransitioning(false);
      }, 150);
    }
  }, [state, currentState]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        className
      )}
    >
      {states[currentState] || children}
    </div>
  );
}

// ============================================================================
// 6. MOBILE LOADING TRANSITION COMPONENT
// ============================================================================

interface MobileLoadingTransitionProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function MobileLoadingTransition({
  children,
  isLoading,
  loadingComponent,
  className
}: MobileLoadingTransitionProps) {
  const isMobile = useIsMobile();
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      setTimeout(() => setShowContent(true), 200);
    }
  }, [isLoading]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={className}>
      {isLoading ? (
        <div className="transition-all duration-300 ease-in-out opacity-100">
          {loadingComponent || defaultLoadingComponent}
        </div>
      ) : (
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7. MOBILE ERROR TRANSITION COMPONENT
// ============================================================================

interface MobileErrorTransitionProps {
  children: React.ReactNode;
  hasError: boolean;
  errorComponent?: React.ReactNode;
  className?: string;
}

export function MobileErrorTransition({
  children,
  hasError,
  errorComponent,
  className
}: MobileErrorTransitionProps) {
  const isMobile = useIsMobile();
  const [showError, setShowError] = useState(hasError);

  useEffect(() => {
    if (hasError) {
      setShowError(true);
    } else {
      setTimeout(() => setShowError(false), 200);
    }
  }, [hasError]);

  const defaultErrorComponent = (
    <div className="flex items-center justify-center p-8 text-red-600">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm">Произошла ошибка</p>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {showError ? (
        <div className="transition-all duration-300 ease-in-out opacity-100">
          {errorComponent || defaultErrorComponent}
        </div>
      ) : (
        <div className="transition-all duration-300 ease-in-out opacity-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. MOBILE SUCCESS TRANSITION COMPONENT
// ============================================================================

interface MobileSuccessTransitionProps {
  children: React.ReactNode;
  isSuccess: boolean;
  successComponent?: React.ReactNode;
  onSuccessComplete?: () => void;
  className?: string;
}

export function MobileSuccessTransition({
  children,
  isSuccess,
  successComponent,
  onSuccessComplete,
  className
}: MobileSuccessTransitionProps) {
  const isMobile = useIsMobile();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccessComplete?.();
      }, 2000);
    }
  }, [isSuccess, onSuccessComplete]);

  const defaultSuccessComponent = (
    <div className="flex items-center justify-center p-8 text-green-600">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-sm">Успешно!</p>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {showSuccess ? (
        <div className="transition-all duration-300 ease-in-out opacity-100">
          {successComponent || defaultSuccessComponent}
        </div>
      ) : (
        <div className="transition-all duration-300 ease-in-out opacity-100">
          {children}
        </div>
      )}
    </div>
  );
}
