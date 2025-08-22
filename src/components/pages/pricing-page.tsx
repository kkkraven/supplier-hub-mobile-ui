'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Star, Shield, Zap, Users, Globe, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

interface PricingPageProps {
  onNavigate?: (page: string) => void;
}

export function PricingPage({ onNavigate }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
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
        default:
          router.push('/');
      }
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      description: 'Для стартапов и небольших брендов',
      monthlyPrice: 300,
      annualPrice: 3000,
      popular: false,
      features: [
        'Доступ к 20 фабрикам',
        'До 5 RFQ запросов в месяц',
        'Базовая техподдержка',
        'Стандартные фильтры поиска',
        'Email уведомления',
        'Основная аналитика'
      ],
      limitations: [
        'Ограниченный доступ к премиум фабрикам',
        'Базовая проверка фабрик',
        'Стандартная скорость ответа'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Users,
      description: 'Для растущих компаний',
      monthlyPrice: 800,
      annualPrice: 8000,
      popular: true,
      features: [
        'Доступ ко всем 70+ фабрикам',
        'Неограниченные RFQ запросы',
        'Приоритетная техподдержка',
        'Расширенные фильтры и поиск',
        'Push уведомления',
        'Детальная аналитика',
        'Персональный менеджер',
        'Проверка образцов',
        'Поддержка договоров'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Globe,
      description: 'Для крупных компаний',
      monthlyPrice: 2000,
      annualPrice: 20000,
      popular: false,
      features: [
        'Все функции Professional',
        'Приоритетный доступ к новым фабрикам',
        'Кастомизированные RFQ шаблоны',
        'Белый лейбл решение',
        '24/7 техподдержка',
        'Интеграция с CRM/ERP',
        'Команда экспертов',
        'Визиты на производство',
        'Юридическая поддержка',
        'Эскроу сервис'
      ],
      limitations: []
    }
  ];

  const features = [
    {
      category: 'Доступ к фабрикам',
      items: [
        { name: 'Количество фабрик', starter: '20', professional: '70+', enterprise: '70+ приоритет' },
        { name: 'Новые фабрики', starter: 'Через 30 дней', professional: 'Через 7 дней', enterprise: 'Мгновенно' },
        { name: 'Премиум фабрики', starter: '❌', professional: '✅', enterprise: '✅' },
        { name: 'Верификация фабрик', starter: 'Базовая', professional: 'Расширенная', enterprise: 'Полная + визиты' }
      ]
    },
    {
      category: 'RFQ система',
      items: [
        { name: 'RFQ запросы в месяц', starter: '5', professional: 'Безлимит', enterprise: 'Безлимит' },
        { name: 'Шаблоны RFQ', starter: 'Базовые', professional: 'Расширенные', enterprise: 'Кастомные' },
        { name: 'Скорость ответа', starter: '48-72ч', professional: '24-48ч', enterprise: '12-24ч' },
        { name: 'Проверка образцов', starter: '❌', professional: '✅', enterprise: '✅ + визиты' }
      ]
    },
    {
      category: 'Поддержка',
      items: [
        { name: 'Техподдержка', starter: 'Email', professional: 'Email + Чат', enterprise: '24/7 все каналы' },
        { name: 'Персональный менеджер', starter: '❌', professional: '✅', enterprise: '✅ + команда' },
        { name: 'Время ответа', starter: '24-48ч', professional: '4-8ч', enterprise: '1-2ч' },
        { name: 'Языки поддержки', starter: 'RU', professional: 'RU + EN', enterprise: 'RU + EN + CN' }
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Anna K.',
      company: 'Eco Fashion Brand',
      plan: 'Professional',
      text: 'За 2 месяца нашли идеальную фабрику для органических футболок. Качество проверки фабрик впечатляет.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&auto=format&q=80'
    },
    {
      name: 'Dmitri S.',
      company: 'SportTech Startup',
      plan: 'Starter',
      text: 'Начали со Starter плана и за полгода запустили производство спортивной одежды. Отличное соотношение цена-качество.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=80'
    },
    {
      name: 'Marina P.',
      company: 'Fashion House',
      plan: 'Enterprise',
      text: 'Enterprise план полностью покрывает потребности крупного бренда. Персональная команда - это то что нужно.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format&q=80'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would integrate with payment system
    handleNavigate('onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => handleNavigate('landing')}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Назад на главную
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Тарифы и цены
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Выберите план, который подходит вашему бизнесу. Все планы включают полную проверку фабрик и поддержку.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${selectedPlan !== 'pro' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                Месячная оплата
              </span>
              <Badge className="bg-success text-white ml-2">
                Скидка 17%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = selectedPlan === 'pro' ? plan.annualPrice : plan.monthlyPrice;
              const period = selectedPlan === 'pro' ? 'год' : 'месяц';
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-medium">
                      🔥 Самый популярный
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${plan.popular ? 'pt-8' : 'pt-6'}`}>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-6">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ${price.toLocaleString()}
                      </div>
                      <div className="text-gray-500">за {period}</div>
                      {selectedPlan === 'pro' && (
                        <div className="text-sm text-success mt-1">
                          Экономия ${((plan.monthlyPrice * 12) - plan.annualPrice).toLocaleString()}/год
                        </div>
                      )}
                    </div>
                    
                    <Button
                      className={`w-full mb-6 ${
                        plan.popular 
                          ? 'gradient-factura' 
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {plan.popular ? 'Начать бесплатно' : 'Выбрать план'}
                    </Button>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Включено в план:</h4>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.length > 0 && (
                        <>
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Ограничения:</h4>
                            {plan.limitations.map((limitation, index) => (
                              <div key={index} className="flex items-start gap-3 mb-2">
                                <span className="w-5 h-5 text-warning mt-0.5 flex-shrink-0">⚠️</span>
                                <span className="text-sm text-gray-600">{limitation}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Подробное сравнение планов
            </h2>
            <p className="text-lg text-gray-600">
              Сравните возможности каждого тарифа
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-900">Функция</th>
                  <th className="text-center p-4 font-medium text-gray-900">Starter</th>
                  <th className="text-center p-4 font-medium text-gray-900 bg-primary/5">
                    Professional
                    <Badge className="bg-primary text-white ml-2 text-xs">Популярный</Badge>
                  </th>
                  <th className="text-center p-4 font-medium text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="p-4 font-semibold text-gray-900 border-b border-gray-200">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-4 text-gray-700">{item.name}</td>
                        <td className="p-4 text-center text-gray-600">{item.starter}</td>
                        <td className="p-4 text-center text-gray-600 bg-primary/5 font-medium">{item.professional}</td>
                        <td className="p-4 text-center text-gray-600">{item.enterprise}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Отзывы клиентов
            </h2>
            <p className="text-lg text-gray-600">
              Что говорят пользователи о наших тарифах
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {testimonial.plan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Часто задаваемые вопросы
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Можно ли изменить план в любое время?
                </h4>
                <p className="text-gray-600 text-sm">
                  Да, вы можете повысить или понизить тариф в любое время. При повышении плана доплачиваете разницу, при понижении получаете кредит на следующий период.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Есть ли бесплатный пробный период?
                </h4>
                <p className="text-gray-600 text-sm">
                  Да, все планы включают 14-дневный бесплатный пробный период. Никаких обязательств и скрытых платежей.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Что включает проверка фабрик?
                </h4>
                <p className="text-gray-600 text-sm">
                  Мы проверяем документы, сертификаты, производственные мощности, качество образцов и отзывы других клиентов.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Поддерживаете ли международные платежи?
                </h4>
                <p className="text-gray-600 text-sm">
                  Да, мы принимаем все основные валюты и способы оплаты: карты, банковские переводы, PayPal.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Что если фабрика не подойдет?
                </h4>
                <p className="text-gray-600 text-sm">
                  У нас есть гарантия качества. Если фабрика не соответствует заявленным характеристикам, мы найдем замену или вернем деньги.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Как быстро получу доступ после оплаты?
                </h4>
                <p className="text-gray-600 text-sm">
                  Доступ открывается мгновенно после успешной оплаты. Вы сразу сможете просматривать фабрики и отправлять RFQ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы начать?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к 1000+ брендов, которые уже нашли своих производственных партнеров
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-3"
                onClick={() => handleSelectPlan('professional')}
              >
                Начать бесплатно
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-3"
              >
                <Shield className="w-4 h-4 mr-2" />
                Связаться с нами
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}