import React from 'react';
import { SubcategoryCard } from './subcategory-card';
import { Subcategory } from '../../types/factory';

interface SubcategoriesListProps {
  subcategories: Subcategory[];
  parentCategorySlug: string;
  title?: string;
  className?: string;
}

export function SubcategoriesList({ 
  subcategories, 
  parentCategorySlug, 
  title = 'Подкатегории',
  className = '' 
}: SubcategoriesListProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Выберите подкатегорию для более точного поиска
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory.slug}
            subcategory={subcategory}
            parentCategorySlug={parentCategorySlug}
          />
        ))}
      </div>
    </div>
  );
}
