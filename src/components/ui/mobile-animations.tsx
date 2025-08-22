'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';
import { cn } from './utils';

// ============================================================================
// 1. MOBILE FADE IN ANIMATION COMPONENT
// ============================================================================

interface MobileFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export function MobileFadeIn({
  children,
  delay = 0,
  duration = 300,
  direction = 'up',
  className
}: MobileFadeInProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (direction === 'none') return 'translateY(0)';
    
    const transforms = {
      up: 'translateY(20px)',
      down: 'translateY(-20px)',
      left: 'translateX(20px)',
      right: 'translateX(-20px)'
    };
    
    return transforms[direction];
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 transform-none' : 'opacity-0',
        className
      )}
      style={{
        transform: isVisible ? 'none' : getTransform(),
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? '0ms' : `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 2. MOBILE STAGGER ANIMATION COMPONENT
// ============================================================================

interface MobileStaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function MobileStagger({
  children,
  staggerDelay = 100,
  className
}: MobileStaggerProps) {
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
            }, i * staggerDelay);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [children, staggerDelay]);

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
            transitionDelay: `${index * staggerDelay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 3. MOBILE SCALE ANIMATION COMPONENT
// ============================================================================

interface MobileScaleProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function MobileScale({
  children,
  scale = 0.95,
  duration = 200,
  className
}: MobileScaleProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-200 ease-out',
        isVisible ? 'scale-100' : `scale-[${scale}]`,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 4. MOBILE SLIDE ANIMATION COMPONENT
// ============================================================================

interface MobileSlideProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  className?: string;
}

export function MobileSlide({
  children,
  direction = 'left',
  distance = 50,
  duration = 300,
  className
}: MobileSlideProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    const transforms = {
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`
    };
    
    return transforms[direction];
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 transform-none' : 'opacity-0',
        className
      )}
      style={{
        transform: isVisible ? 'none' : getTransform(),
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 5. MOBILE BOUNCE ANIMATION COMPONENT
// ============================================================================

interface MobileBounceProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function MobileBounce({
  children,
  delay = 0,
  className
}: MobileBounceProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-75',
        className
      )}
      style={{
        transitionDelay: isVisible ? '0ms' : `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 6. MOBILE ROTATE ANIMATION COMPONENT
// ============================================================================

interface MobileRotateProps {
  children: React.ReactNode;
  angle?: number;
  duration?: number;
  className?: string;
}

export function MobileRotate({
  children,
  angle = 5,
  duration = 300,
  className
}: MobileRotateProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible ? 'rotate-0' : `rotate-${angle}`,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 7. MOBILE PARALLAX ANIMATION COMPONENT
// ============================================================================

interface MobileParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function MobileParallax({
  children,
  speed = 0.5,
  className
}: MobileParallaxProps) {
  const isMobile = useIsMobile();
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * speed;
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={elementRef}
      className={cn('transform-gpu', className)}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 8. MOBILE TYPING ANIMATION COMPONENT
// ============================================================================

interface MobileTypingProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export function MobileTyping({
  text,
  speed = 50,
  delay = 0,
  className
}: MobileTypingProps) {
  const isMobile = useIsMobile();
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentIndex(0);
      setDisplayText('');
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <span className={cn('inline-block', className)}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ============================================================================
// 9. MOBILE PROGRESSIVE DISCLOSURE COMPONENT
// ============================================================================

interface MobileProgressiveDisclosureProps {
  children: React.ReactNode;
  steps: number;
  className?: string;
}

export function MobileProgressiveDisclosure({
  children,
  steps,
  className
}: MobileProgressiveDisclosureProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const interval = setInterval(() => {
            setCurrentStep(prev => {
              if (prev < steps - 1) {
                return prev + 1;
              } else {
                clearInterval(interval);
                return prev;
              }
            });
          }, 200);

          return () => clearInterval(interval);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [steps]);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'transition-all duration-300 ease-out',
            index <= currentStep 
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
// 10. MOBILE HOVER EFFECTS COMPONENT
// ============================================================================

interface MobileHoverEffectsProps {
  children: React.ReactNode;
  effect?: 'lift' | 'glow' | 'scale' | 'rotate';
  className?: string;
}

export function MobileHoverEffects({
  children,
  effect = 'lift',
  className
}: MobileHoverEffectsProps) {
  const isMobile = useIsMobile();

  const effectClasses = {
    lift: 'hover:transform hover:-translate-y-1 hover:shadow-lg',
    glow: 'hover:shadow-lg hover:shadow-primary/25',
    scale: 'hover:transform hover:scale-105',
    rotate: 'hover:transform hover:rotate-1'
  };

  // На мобильных устройствах применяем эффекты при касании
  const mobileEffectClasses = {
    lift: 'active:transform active:-translate-y-1 active:shadow-lg',
    glow: 'active:shadow-lg active:shadow-primary/25',
    scale: 'active:transform active:scale-105',
    rotate: 'active:transform active:rotate-1'
  };

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isMobile ? mobileEffectClasses[effect] : effectClasses[effect],
        className
      )}
    >
      {children}
    </div>
  );
}
