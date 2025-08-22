'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, ArrowRight, MapPin, Star, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { MobileInput } from '../ui/mobile-forms';
import { MobileSelect } from '../ui/mobile-forms';
import { MobileFilters } from '../ui/mobile-filters';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useRouter } from 'next/navigation';

interface CatalogPageProps {
  onNavigate?: (page: string, category?: string) => void;
}

export function CatalogPage({ onNavigate }: CatalogPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const router = useRouter();

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

  const categories = [
    {
      slug: 'knit',
      name: 'Knit / Трикотаж',
      description: 'Специализированные фабрики по производству трикотажных изделий',
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 7,
      avgMOQ: '300-500 шт',
      avgLeadTime: '12-18 дней'
    },
    {
      slug: 'woven',
      name: 'Woven / Ткань',
      description: 'Профессиональные производители тканой одежды',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 6,
      avgMOQ: '200-400 шт',
      avgLeadTime: '18-25 дней'
    },
    {
      slug: 'outerwear',
      name: 'Outerwear / Верхняя одежда',
      description: 'Технологичное производство верхней одежды',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 0,
      avgMOQ: '100-300 шт',
      avgLeadTime: '25-35 дней'
    },
    {
      slug: 'denim',
      name: 'Denim / Джинсовая одежда',
      description: 'Специализированные производители джинсовой одежды',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 5,
      avgMOQ: '250-400 шт',
      avgLeadTime: '20-30 дней'
    },
    {
      slug: 'activewear',
      name: 'Activewear / Спортивная одежда',
      description: 'Высокотехнологичное производство спортивной одежды',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 4,
      avgMOQ: '200-500 шт',
      avgLeadTime: '15-25 дней'
    },
    {
      slug: 'accessories',
      name: 'Accessories / Аксессуары',
      description: 'Производство премиум аксессуаров',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80',
      factoryCount: 8,
      avgMOQ: '100-250 шт',
      avgLeadTime: '10-20 дней'
    }
  ];

  const topFactories = [
    {
      id: '1',
      name: 'Golden Thread Knitting Co.',
      city: '佛山 / Foshan',
      category: 'Knit',
      rating: 4.8,
      deals: 47,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop&auto=format&q=80',
      specialties: ['Premium Knit', 'Organic Cotton', 'Quick Turnaround']
    },
    {
      id: '2',
      name: 'Sunrise Textile Mills',
      city: '东莞 / Dongguan',
      category: 'Knit',
      rating: 4.9,
      deals: 63,
      image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=200&fit=crop&auto=format&q=80',
      specialties: ['Sports Knit', 'Technical Fabrics', 'Large Orders']
    },
    {
      id: '3',
      name: 'Imperial Weaving Co.',
      city: '苏州 / Suzhou',
      category: 'Woven',
      rating: 4.9,
      deals: 89,
      image: 'https://images.unsplash.com/photo-1558618187-fcd80c1cd201?w=300&h=200&fit=crop&auto=format&q=80',
      specialties: ['Luxury Woven', 'Premium Quality', 'Custom Designs']
    },
    {
      id: '4',
      name: 'TechWear Innovation',
      city: '深圳 / Shenzhen',
      category: 'Activewear',
      rating: 4.7,
      deals: 34,
      image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=300&h=200&fit=crop&auto=format&q=80',
      specialties: ['Technical Wear', 'Performance Fabrics', 'Innovation']
    }
  ];

  const cities = [
    { value: 'all', label: 'Все города' },
    { value: 'foshan', label: '佛山 / Foshan' },
    { value: 'dongguan', label: '东莞 / Dongguan' },
    { value: 'guangzhou', label: '广州 / Guangzhou' },
    { value: 'suzhou', label: '苏州 / Suzhou' },
    { value: 'shenzhen', label: '深圳 / Shenzhen' },
    { value: 'qingdao', label: '青岛 / Qingdao' }
  ];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTopFactories = topFactories.filter(factory => {
    const matchesSearch = factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factory.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || factory.category.toLowerCase() === selectedCategory;
    const matchesCity = selectedCity === 'all' || 
                       (selectedCity === 'foshan' && factory.city.includes('佛山')) ||
                       (selectedCity === 'dongguan' && factory.city.includes('东莞')) ||
                       (selectedCity === 'guangzhou' && factory.city.includes('广州')) ||
                       (selectedCity === 'suzhou' && factory.city.includes('苏州')) ||
                       (selectedCity === 'shenzhen' && factory.city.includes('深圳')) ||
                       (selectedCity === 'qingdao' && factory.city.includes('青岛'));
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => handleNavigate('landing')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад на главную
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Каталог швейных фабрик
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              122 проверенные фабрики по всему Китаю. Найдите идеального партнера для производства вашей продукции.
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4 mb-8">
                <MobileInput
                  placeholder="Поиск по названию, категории, городу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                  variant="search"
                  onSearch={(value) => setSearchTerm(value)}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MobileSelect
                    placeholder="Все категории"
                    options={[
                      { value: 'all', label: 'Все категории' },
                      { value: 'knit', label: 'Knit / Трикотаж' },
                      { value: 'woven', label: 'Woven / Ткань' },
                      { value: 'outerwear', label: 'Outerwear' },
                      { value: 'denim', label: 'Denim' },
                      { value: 'activewear', label: 'Activewear' },
                      { value: 'accessories', label: 'Accessories' }
                    ]}
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  />
                  
                  <MobileSelect
                    placeholder="Все города"
                    options={cities.map(city => ({ value: city.value, label: city.label }))}
                    value={selectedCity}
                    onValueChange={setSelectedCity}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Категории производства
            </h2>
            <Badge variant="secondary" className="text-sm">
              {filteredCategories.length} из {categories.length} категорий
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => (
              <Card 
                key={category.slug}
                className="group overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => handleNavigate('category-detail', category.slug)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                    <span className="text-sm font-medium text-primary">
                      {category.factoryCount} фабрик
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {category.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">MOQ:</span>
                      <p className="font-medium">{category.avgMOQ}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Lead time:</span>
                      <p className="font-medium">{category.avgLeadTime}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                  >
                    Посмотреть фабрики
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Factories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Топ рейтинговые фабрики
              </h2>
              <p className="text-gray-600">
                Наиболее востребованные производители с высокими рейтингами
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredTopFactories.length} фабрик
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTopFactories.map((factory) => (
              <Card key={factory.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-32">
                  <ImageWithFallback
                    src={factory.image}
                    alt={factory.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-success text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {factory.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{factory.city}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {factory.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{factory.rating}</span>
                      <span className="text-gray-500">({factory.deals})</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    {factory.specialties.slice(0, 2).map((specialty, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {specialty}
                      </div>
                    ))}
                  </div>
                  
                  <Button size="sm" className="w-full bg-primary hover:bg-primary-light">
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Не нашли подходящую фабрику?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Наши эксперты помогут подобрать идеального производственного партнера под ваши требования
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-3"
                onClick={() => handleNavigate('pricing')}
              >
                Посмотреть тарифы
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                onClick={() => handleNavigate('onboarding')}
              >
                Начать бесплатно
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}