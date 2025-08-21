'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '../pages/category-page';

interface CategoryNavigationProps {
  title?: string;
  showStats?: boolean;
  className?: string;
}

export function CategoryNavigation({ 
  title = 'Категории фабрик',
  showStats = true,
  className = '' 
}: CategoryNavigationProps) {
  const router = useRouter();

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/categories/${categorySlug}`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button
          variant="outline"
          onClick={() => router.push('/factories')}
          className="flex items-center gap-2"
        >
          Все фабрики
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.values(CATEGORIES).map((category) => (
          <Card 
            key={category.slug}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => handleCategoryClick(category.slug)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-xl`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">{category.nameEn}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {category.description}
              </p>

              {showStats && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Фабрик:</span>
                    <span className="font-medium">{category.stats.totalFactories}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Рейтинг:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{category.stats.avgRating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Срок:</span>
                    <span className="font-medium">{category.stats.avgLeadTime} дн</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                >
                  Перейти
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
