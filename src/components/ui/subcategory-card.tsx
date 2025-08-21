import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Subcategory } from '../../types/factory';
import { useRouter } from 'next/navigation';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  parentCategorySlug: string;
  className?: string;
}

export function SubcategoryCard({ 
  subcategory, 
  parentCategorySlug, 
  className = '' 
}: SubcategoryCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // Переходим на страницу подкатегории
    router.push(`/categories/${parentCategorySlug}/${subcategory.slug}`);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{subcategory.icon}</span>
            <CardTitle className="text-lg font-semibold">
              {subcategory.name}
            </CardTitle>
          </div>
          <Badge variant="secondary" className={subcategory.color}>
            {subcategory.nameEn}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          {subcategory.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Подкатегория
          </span>
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        </div>
      </CardContent>
    </Card>
  );
}
