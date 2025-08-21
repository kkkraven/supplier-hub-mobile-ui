import React, { useEffect, useRef, useState } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-up' | 'scale-down' | 'rotate-in' | 'bounce-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow' | 'slower';
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}

export function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 'normal',
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  stagger = false,
  staggerDelay = 0.1
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay * 1000);
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold, triggerOnce, hasAnimated]);

  // Добавляем stagger анимацию для дочерних элементов
  useEffect(() => {
    if (isVisible && stagger && elementRef.current) {
      // Используем children напрямую вместо querySelectorAll
      const childElements = Array.from(elementRef.current.children);
      childElements.forEach((child, index) => {
        if (child instanceof HTMLElement) {
          child.style.animationDelay = `${index * staggerDelay}s`;
          child.classList.add(`animate-${animation}`);
        }
      });
    }
  }, [isVisible, stagger, staggerDelay, animation]);

  const animationClass = isVisible ? `animate-${animation}` : '';
  const durationClass = `duration-${duration}`;

  return (
    <div
      ref={elementRef}
      className={`${stagger ? '' : animationClass} ${durationClass} ${className}`}
    >
      {children}
    </div>
  );
}

// Компонент для stagger анимаций в списках
export function AnimatedList({
  children,
  animation = 'fade-up',
  staggerDelay = 0.1,
  threshold = 0.1,
  className = ''
}: {
  children: React.ReactNode;
  animation?: string;
  staggerDelay?: number;
  threshold?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => {
      if (listRef.current) {
        observer.unobserve(listRef.current);
      }
    };
  }, [threshold]);

  useEffect(() => {
    if (isVisible && listRef.current) {
      // Используем children напрямую вместо querySelectorAll
      const childElements = Array.from(listRef.current.children);
      childElements.forEach((child, index) => {
        if (child instanceof HTMLElement) {
          setTimeout(() => {
            child.classList.add(`animate-${animation}`);
          }, index * staggerDelay * 1000);
        }
      });
    }
  }, [isVisible, staggerDelay, animation]);

  return (
    <div ref={listRef} className={className}>
      {children}
    </div>
  );
}

// Компонент для анимации счетчиков
export function AnimatedCounter({
  value,
  duration = 2000,
  className = ''
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const increment = value / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isVisible, value, duration]);

  return (
    <span ref={countRef} className={`animate-text-glow ${className}`}>
      {count}
    </span>
  );
}

// Компонент для параллакс эффектов
export function ParallaxElement({
  children,
  speed = 0.5,
  className = ''
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const [offsetY, setOffsetY] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * speed;
        setOffsetY(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={elementRef}
      className={`parallax-element ${className}`}
      style={{
        transform: `translateY(${offsetY}px)`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}

// Компонент для анимации печатания
export function TypewriterText({
  text,
  speed = 100,
  className = '',
  onComplete
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1
      }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [isVisible, currentIndex, text, speed, onComplete]);

  return (
    <span
      ref={textRef}
      className={`animate-text-typewriter ${className}`}
      style={{
        borderRight: currentIndex === text.length ? 'none' : '2px solid var(--primary)'
      }}
    >
      {displayText}
    </span>
  );
}