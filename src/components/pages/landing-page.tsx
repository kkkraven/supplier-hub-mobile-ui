'use client';

import React, { useEffect, useState } from 'react';
import { Search, Shield, Zap, ArrowRight, CheckCircle, Users, Factory, Star, Award, Clock, Globe, TrendingUp, MessageCircle, Phone, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CostCalculator } from '../cost-calculator';
import { AnimatedSection, AnimatedList, AnimatedCounter, ParallaxElement, TypewriterText } from '../animated-section';
import { useRouter } from 'next/navigation';

interface LandingPageProps {
  onNavigate?: (page: string, category?: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Запускаем анимации после загрузки
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (page: string, category?: string) => {
    if (onNavigate) {
      onNavigate(page, category);
    } else {
      switch (page) {
        case 'landing':
          router.push('/');
          break;
        case 'catalog':
          router.push('/catalog');
          break;
        case 'pricing':
          router.push('/pricing');
          break;
        case 'onboarding':
          router.push('/onboarding');
          break;
        case 'category-detail':
          if (category) {
            router.push(`/category/${category}`);
          }
          break;
        default:
          router.push('/');
      }
    }
  };

  const stats = [
    { value: '30', label: 'фабрик' },
    { value: '5', label: 'пилот-брендов' },
    { value: '100%', label: 'onsite инспекция' }
  ];

  const categories = [
    {
      slug: 'knit',
      name: 'Knit / Трикотаж',
      description: 'Футболки, худи, свитшоты, спортивная одежда',
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 7,
      avgMOQ: '300-500 шт',
      leadTime: '12-18 дней'
    },
    {
      slug: 'woven',
      name: 'Woven / Ткань',
      description: 'Рубашки, блузки, платья, деловая одежда',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 6,
      avgMOQ: '200-400 шт',
      leadTime: '18-25 дней'
    },
    {
      slug: 'outerwear',
      name: 'Outerwear / Верхняя одежда',
      description: 'Куртки, пальто, пуховики, дождевики',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 0,
      avgMOQ: '100-300 шт',
      leadTime: '25-35 дней'
    },
    {
      slug: 'denim',
      name: 'Denim / Джинсовая одежда',
      description: 'Джинсы, джинсовые куртки, юбки',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 5,
      avgMOQ: '250-400 шт',
      leadTime: '20-30 дней'
    },
    {
      slug: 'activewear',
      name: 'Activewear / Спортивная одежда',
      description: 'Леггинсы, спортивные бра, шорты',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 4,
      avgMOQ: '200-500 шт',
      leadTime: '15-25 дней'
    },
    {
      slug: 'accessories',
      name: 'Accessories / Аксессуары',
      description: 'Сумки, кошельки, ремни, головные уборы',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 8,
      avgMOQ: '100-250 шт',
      leadTime: '10-20 дней'
    }
  ];

  const globalStats = [
    {
      number: '30',
      label: 'Проверенных фабрик',
      description: 'Только верифицированные производители'
    },
    {
      number: '1,247',
      label: 'Довольных клиентов',
      description: 'Brands по всему миру'
    },
    {
      number: '72ч',
      label: 'Среднее время',
      description: 'От RFQ до ответа фабрики'
    },
    {
      number: '94%',
      label: 'Успешность',
      description: 'Сделок завершается контрактом'
    }
  ];

  const testimonials = [
    {
      name: 'Anna Korhonen',
      company: 'Eco Fashion Brand',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&auto=format&q=80',
      text: 'За 2 месяца нашли идеальную фабрику для органических футболок. Качество проверки фабрик впечатляет.',
      rating: 5
    },
    {
      name: 'Dmitri Smirnov',
      company: 'SportTech Startup',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=80',
      text: 'Начали с малых заказов и за полгода запустили собственную линию спортивной одежды. Рекомендую!',
      rating: 5
    },
    {
      name: 'Marina Petrov',
      company: 'Fashion House LLC',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format&q=80',
      text: 'Профессиональный подход, быстрые ответы и качественные фабрики. Это именно то, что нужно нашему бизнесу.',
      rating: 5
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Проверенные фабрики',
      description: 'Каждая фабрика проходит многоуровневую проверку документов, мощностей и качества продукции'
    },
    {
      icon: Zap,
      title: 'Быстрые RFQ',
      description: 'Отправляйте запросы напрямую фабрикам и получайте ответы в течение 24-72 часов'
    },
    {
      icon: Award,
      title: 'Контроль качества',
      description: 'Независимая проверка образцов и контроль качества на всех этапах производства'
    },
    {
      icon: Globe,
      title: 'Прозрачные цены',
      description: 'Никаких скрытых комиссий. Честные цены от фабрик без посредников'
    }
  ];

  const process = [
    {
      step: 1,
      title: 'Поиск фабрики',
      description: 'Используйте фильтры по категории, MOQ, lead time и сертификациям',
      icon: Search
    },
    {
      step: 2,
      title: 'Отправка RFQ',
      description: 'Отправьте техническое задание выбранным фабрикам',
      icon: MessageCircle
    },
    {
      step: 3,
      title: 'Получение предложений',
      description: 'Сравните цены, сроки и условия от разных производителей',
      icon: TrendingUp
    },
    {
      step: 4,
      title: 'Заключение контракта',
      description: 'Подпишите договор и запустите производство с эскроу-гарантией',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Новый full-width 80vh блок */}
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image */}
        <ParallaxElement speed={0.5} className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&auto=format&q=80"
            alt="Chinese textile factory"
            className="w-full h-full object-cover animate-background-float"
          />
          {/* Overlay 30% */}
          <div className="absolute inset-0 bg-black/30"></div>
        </ParallaxElement>

        {/* Content Container */}
        <div className="relative h-full max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 hero-container">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 xl:gap-24 2xl:gap-32 items-center py-12 sm:py-16 lg:py-0">
            
            {/* Left Zone - Content */}
            <AnimatedSection animation="fade-right" delay={0.2} className="order-2 lg:order-1 space-y-6 sm:space-y-8 max-w-4xl">
              {/* H1 Title */}
              <AnimatedSection animation="slide-up" delay={0.4} className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight animate-text-glow">
                  <TypewriterText 
                    text="Factura Supplier Hub —" 
                    speed={80}
                    className="block"
                  />
                  <span className="text-white/90 animate-fade-up">проверенные швейные фабрики Китая</span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 font-medium animate-fade-up-delay-2">
                  Поиск → RFQ → контракт → эскроу за 72 ч
                </p>
              </AnimatedSection>

              {/* Bullet Stats */}
              <AnimatedList animation="bounce-in" staggerDelay={0.2} className="flex flex-wrap gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-white/90 animate-icon-bounce"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow"></div>
                    <span className="font-semibold">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </AnimatedList>

              {/* CTA Buttons */}
              <AnimatedSection animation="scale-up" delay={0.8} className="flex flex-col gap-3 sm:gap-4 md:flex-row">
                <Button
                  size="lg"
                  className="gradient-factura animate-button-hover hero-button px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold shadow-factura w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
                  onClick={() => handleNavigate('pricing')}
                >
                  <span className="hidden sm:inline">Разблокировать 3 фабрики за $300</span>
                  <span className="sm:hidden hero-button-text">Получить доступ • $300</span>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 animate-button-hover hero-button px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold backdrop-blur-sm w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
                  onClick={() => handleNavigate('catalog')}
                >
                  <span className="hidden sm:inline">Посмотреть каталог</span>
                  <span className="sm:hidden hero-button-text">Каталог</span>
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 ml-2 flex-shrink-0 animate-icon-pulse" />
                </Button>
              </AnimatedSection>
            </AnimatedSection>

            {/* Right Zone - Economy Card */}
            <AnimatedSection animation="fade-left" delay={0.6} className="order-1 lg:order-2 flex justify-center lg:justify-end items-center h-[40vh] lg:h-auto">
              <Card className="bg-white/95 backdrop-blur-md shadow-factura max-w-sm w-full border-0 animate-card-hover transform hover:scale-105 transition-all duration-500">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 text-center animate-fade-up">
                    Экономия vs агент
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatedSection animation="bounce-in" delay={1.0} className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2 animate-pulse-slow">4×</div>
                    <p className="text-gray-700 font-medium animate-fade-up-delay-1">
                      1-й заказ через Hub ≈ <strong>4× дешевле</strong>,<br />
                      чем агент 5%
                    </p>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="slide-up" delay={1.2} className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center animate-fade-up-delay-2">
                        <div className="text-gray-500">Агент</div>
                        <div className="font-semibold text-danger animate-wobble">5% комиссия</div>
                      </div>
                      <div className="text-center animate-fade-up-delay-3">
                        <div className="text-gray-500">Factura</div>
                        <div className="font-semibold text-success animate-float">Прямая цена</div>
                      </div>
                    </div>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="scale-up" delay={1.4}>
                    <Button 
                      className="w-full gradient-factura font-semibold animate-button-hover transform hover:scale-105 transition-all duration-300"
                      onClick={() => setShowCalculator(true)}
                    >
                      Рассчитать экономию
                    </Button>
                  </AnimatedSection>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection animation="fade-up" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedList animation="scale-up" staggerDelay={0.15} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {globalStats.map((stat, index) => (
              <div key={index} className="text-center animate-card-hover p-4 rounded-lg">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2 animate-text-glow">
                  <AnimatedCounter 
                    value={stat.number === '72ч' ? 72 : stat.number === '94%' ? 94 : parseInt(stat.number.replace(/[^\d]/g, '')) || 0}
                    duration={2000}
                  />
                  {stat.number.includes('%') && '%'}
                  {stat.number.includes('ч') && 'ч'}
                  {stat.number.includes('+') && '+'}
                  {stat.number.includes(',') && ',247'}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1 animate-fade-up-delay-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600 animate-fade-up-delay-2">
                  {stat.description}
                </div>
              </div>
            ))}
          </AnimatedList>
        </div>
      </AnimatedSection>

      {/* Categories Section */}
      <AnimatedSection animation="fade-up" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slide-down" delay={0.2} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 animate-text-glow">
              Категории швейного производства
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-up-delay-1">
              От простого трикотажа до сложной верхней одежды. Найдите фабрику под ваш тип продукции.
            </p>
          </AnimatedSection>

          <AnimatedList animation="rotate-in" staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card 
                key={index} 
                className="group overflow-hidden animate-card-hover cursor-pointer shadow-factura hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:rotate-1"
                onClick={() => handleNavigate('category-detail', category.slug)}
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 card-image"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-factura animate-bounce-in">
                    <span className="text-sm font-medium text-primary animate-pulse-slow">
                      {category.factoryCount} фабрик
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="animate-slide-right">
                        <span className="opacity-80">MOQ:</span>
                        <div className="font-medium">{category.avgMOQ}</div>
                      </div>
                      <div className="animate-slide-left">
                        <span className="opacity-80">Lead time:</span>
                        <div className="font-medium">{category.leadTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 animate-fade-up">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm animate-fade-up-delay-1">
                    {category.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 animate-button-hover transform hover:scale-105"
                  >
                    Посмотреть фабрики
                    <ArrowRight className="w-4 h-4 ml-2 animate-icon-bounce group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </AnimatedList>

          <AnimatedSection animation="bounce-in" delay={0.8} className="text-center mt-12 space-y-4">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-factura mr-4 animate-button-hover transform hover:scale-105 transition-all duration-300"
              onClick={() => handleNavigate('catalog')}
            >
              Посмотреть все категории
              <ArrowRight className="w-5 h-5 ml-2 animate-icon-bounce" />
            </Button>
            <Button 
              size="lg"
              className="gradient-factura px-8 py-3 shadow-factura animate-button-hover transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowCalculator(true)}
            >
              Рассчитать экономию
            </Button>
          </AnimatedSection>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection animation="fade-up" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slide-down" delay={0.2} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 animate-text-glow">
              Почему выбирают Factura
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-up-delay-1">
              Мы делаем поиск производителей простым, безопасным и эффективным
            </p>
          </AnimatedSection>

          <AnimatedList animation="scale-up" staggerDelay={0.2} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center animate-card-hover shadow-factura hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                      <Icon className="w-8 h-8 text-primary animate-icon-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 animate-fade-up-delay-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed animate-fade-up-delay-2">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </AnimatedList>
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection animation="fade-up" className="py-16 bg-gradient-to-br from-primary/5 to-accent-purple/5 animate-background-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slide-down" delay={0.2} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 animate-text-glow">
              Как это работает
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-up-delay-1">
              Простой процесс от поиска до заключения контракта
            </p>
          </AnimatedSection>

          <AnimatedList animation="bounce-in" staggerDelay={0.25} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center animate-card-hover">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-factura animate-float transform hover:scale-110 transition-all duration-300">
                      <Icon className="w-10 h-10 text-white animate-icon-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center text-white font-bold text-sm shadow-factura animate-bounce-in">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 animate-fade-up-delay-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed animate-fade-up-delay-2">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </AnimatedList>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection animation="fade-up" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slide-down" delay={0.2} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 animate-text-glow">
              Отзывы клиентов
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-up-delay-1">
              Узнайте, что говорят о нас бренды со всего мира
            </p>
          </AnimatedSection>

          <AnimatedList animation="rotate-in" staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="animate-card-hover shadow-factura hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1">
                <CardContent className="p-8">
                  <AnimatedSection animation="bounce-in" delay={0.5} className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning text-warning animate-icon-pulse" />
                    ))}
                  </AnimatedSection>
                  <p className="text-gray-700 mb-6 italic leading-relaxed animate-fade-up-delay-1">
                    "{testimonial.text}"
                  </p>
                  <AnimatedSection animation="slide-left" delay={0.8} className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover animate-float transform hover:scale-110 transition-all duration-300"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 animate-fade-up-delay-2">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 animate-fade-up-delay-3">{testimonial.company}</p>
                    </div>
                  </AnimatedSection>
                </CardContent>
              </Card>
            ))}
          </AnimatedList>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection animation="fade-up" className="py-20 gradient-factura-purple animate-background-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ParallaxElement speed={0.3} className="text-white">
            <AnimatedSection animation="slide-down" delay={0.2}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-text-glow">
                Готовы найти идеальную фабрику?
              </h2>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={0.4}>
              <p className="text-xl lg:text-2xl opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-up-delay-1">
                Присоединяйтесь к 1000+ брендов, которые уже нашли своих производственных партнеров через Factura
              </p>
            </AnimatedSection>
            <AnimatedSection animation="scale-up" delay={0.6} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-factura animate-button-hover transform hover:scale-105 transition-all duration-300"
                onClick={() => handleNavigate('onboarding')}
              >
                Начать бесплатно
                <ArrowRight className="w-5 h-5 ml-2 animate-icon-bounce" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg font-semibold backdrop-blur-sm animate-button-hover transform hover:scale-105 transition-all duration-300"
                onClick={() => setShowCalculator(true)}
              >
                Рассчитать экономию
              </Button>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={0.8}>
              <p className="text-sm opacity-75 mt-6 animate-pulse-slow">
                Бесплатная регистрация • Доступ к 20 фабрикам • Поддержка 24/7
              </p>
            </AnimatedSection>
          </ParallaxElement>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <AnimatedSection animation="fade-up" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedList animation="slide-up" staggerDelay={0.1} className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-up">
              <div className="text-2xl font-bold text-primary mb-4 animate-text-glow">Factura</div>
              <p className="text-gray-400 mb-6 animate-fade-up-delay-1">
                Платформа для поиска швейных фабрик в Китае
              </p>
              <div className="flex gap-4 animate-fade-up-delay-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white animate-nav-item transform hover:scale-110 transition-all duration-300">
                  <MessageCircle className="w-5 h-5 animate-icon-bounce" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white animate-nav-item transform hover:scale-110 transition-all duration-300">
                  <Phone className="w-5 h-5 animate-icon-bounce" />
                </Button>
              </div>
            </div>
            
            <div className="animate-fade-up">
              <h4 className="font-semibold mb-4 animate-fade-up-delay-1">Платформа</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => handleNavigate('catalog')} className="animate-nav-item hover:text-white transition-all duration-300">Каталог фабрик</button></li>
                <li><button onClick={() => handleNavigate('pricing')} className="animate-nav-item hover:text-white transition-all duration-300">Тарифы</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">API документация</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Интеграции</button></li>
              </ul>
            </div>
            
            <div className="animate-fade-up">
              <h4 className="font-semibold mb-4 animate-fade-up-delay-2">Поддержка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Центр помощи</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Связаться с нами</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Статус сервиса</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Обновления</button></li>
              </ul>
            </div>
            
            <div className="animate-fade-up">
              <h4 className="font-semibold mb-4 animate-fade-up-delay-3">Компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">О нас</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Блог</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Карьера</button></li>
                <li><button className="animate-nav-item hover:text-white transition-all duration-300">Пресса</button></li>
              </ul>
            </div>
          </AnimatedList>
          
          <AnimatedSection animation="fade-up" delay={0.8} className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm animate-fade-up-delay-1">
              © 2024 Factura Supplier Hub. Все права защищены.
            </p>
            <div className="flex gap-6 text-sm text-gray-400 mt-4 md:mt-0 animate-fade-up-delay-2">
              <button className="animate-nav-item hover:text-white transition-all duration-300">Политика конфиденциальности</button>
              <button className="animate-nav-item hover:text-white transition-all duration-300">Условия использования</button>
              <button className="animate-nav-item hover:text-white transition-all duration-300">Cookies</button>
            </div>
          </AnimatedSection>
        </div>
      </AnimatedSection>

      {/* Cost Calculator Modal */}
      <CostCalculator 
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}