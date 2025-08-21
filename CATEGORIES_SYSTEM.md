# Система категорий фабрик

## Обзор

Реализована полнофункциональная система категорий фабрик с отдельными страницами, статистикой, навигацией и связанными фабриками.

## Структура файлов

### 1. Страница категории (`/src/app/categories/[slug]/page.tsx`)
- Динамическая страница Next.js для маршрута `/categories/[slug]`
- Передает slug категории в компонент CategoryPage

### 2. Страница подкатегории (`/src/app/categories/[categorySlug]/[subcategorySlug]/page.tsx`)
- Динамическая страница Next.js для маршрута `/categories/[categorySlug]/[subcategorySlug]`
- Передает slug категории и подкатегории в компонент SubcategoryPage

### 3. Основной компонент категории (`/src/components/pages/category-page.tsx`)
- Полнофункциональная страница категории
- Статистика по категории
- Отображение подкатегорий
- Навигация между категориями
- Интеграция с системой поиска и фильтрации

### 4. Компонент подкатегории (`/src/components/pages/subcategory-page.tsx`)
- Полнофункциональная страница подкатегории
- Статистика по подкатегории
- Навигация между подкатегориями
- Breadcrumb навигация
- Интеграция с системой поиска и фильтрации

### 3. Компоненты UI
- **RelatedFactories** (`/src/components/ui/related-factories.tsx`) - связанные фабрики
- **CategoryNavigation** (`/src/components/ui/category-navigation.tsx`) - навигация по категориям
- **SubcategoryCard** (`/src/components/ui/subcategory-card.tsx`) - карточка подкатегории
- **SubcategoriesList** (`/src/components/ui/subcategories-list.tsx`) - список подкатегорий

### 4. Хуки
- **useRelatedFactories** (`/src/hooks/useRelatedFactories.ts`) - получение связанных фабрик

## Функциональность

### 2.4.1 Создать страницы категорий /categories/[slug]
✅ **Реализовано:**
- Динамические маршруты для каждой категории
- Уникальные URL для каждой категории
- Обработка несуществующих категорий
- SEO-дружественные URL

### 2.4.2 Добавить статистику по категориям
✅ **Реализовано:**
- **Всего фабрик**: количество фабрик в категории
- **Средний рейтинг**: средний рейтинг фабрик
- **Средний срок**: средний срок производства
- **Средний MOQ**: средний минимальный заказ
- Визуальные карточки с иконками
- Цветовая кодировка категорий

### 2.4.3 Создать навигацию между категориями
✅ **Реализовано:**
- Навигационные кнопки между категориями
- Визуальные индикаторы текущей категории
- Быстрое переключение между категориями
- Компонент CategoryNavigation для главной страницы

### 2.4.4 Добавить связанные фабрики
✅ **Реализовано:**
- Автоматический поиск похожих фабрик
- Фильтрация по специализации, городу, сегменту
- Исключение текущей фабрики из результатов
- Сортировка по рейтингу
- Отображение на детальной странице фабрики

## Категории и подкатегории

### Структура категорий
```typescript
export const CATEGORIES = {
  knit: {
    slug: 'knit',
    name: 'Трикотаж',
    nameEn: 'Knit',
    description: 'Фабрики по производству трикотажных изделий',
    icon: '🧶',
    color: 'bg-blue-500',
    stats: { /* статистика */ },
    subcategories: [
      {
        slug: 'socks-hosiery',
        name: 'Носки и чулочно-носочные изделия',
        nameEn: 'Socks & Hosiery',
        description: 'Производство носков, гольфов, чулок и колготок',
        icon: '🧦',
        color: 'bg-blue-400'
      }
    ]
  },
  // ... остальные категории
};
```

### Основные категории
1. **Трикотаж (Knit)** - 🧶
   - **Носки и чулочно-носочные изделия (Socks & Hosiery)** - 🧦
2. **Ткань (Woven)** - 🧵
   - **Мужская и женская одежда (Men/Women Apparel)** - 👕
3. **Спортивная одежда (Sports)** - 🏃‍♂️
4. **Премиум одежда (Luxury)** - 👑
5. **Техническая одежда (Technical)** - 🔧
6. **Джинсовая одежда (Denim)** - 👖
7. **Аксессуары (Accessories)** - 👜
   - **Упаковка и фурнитура (Packaging & Hardware)** - 📦
8. **Домашний текстиль (Home Textile)** - 🛏️

## URL структура

### Примеры URL
```
/categories/knit                    # Страница трикотажа
/categories/knit/socks-hosiery      # Страница подкатегории носков
/categories/woven/men-women-apparel # Страница подкатегории мужской/женской одежды
/categories/luxury                  # Страница премиум одежды
/categories/sports                  # Страница спортивной одежды
/categories/home-textile            # Страница домашнего текстиля
```

### Параметры поиска в категориях и подкатегориях
```
/categories/knit?q=поиск&segment=high&city=佛山&sort=rating&order=desc&page=2
/categories/knit/socks-hosiery?q=носки&segment=mid&city=佛山&sort=rating&order=desc&page=1
```

## Компоненты

### CategoryPage
```typescript
interface CategoryPageProps {
  categorySlug: string;
}

export function CategoryPage({ categorySlug }: CategoryPageProps) {
  // Полная функциональность страницы категории
}
```

### RelatedFactories
```typescript
interface RelatedFactoriesProps {
  factories: Factory[];
  currentFactoryId: string;
  category: string;
  maxDisplay?: number;
  className?: string;
}
```

### CategoryNavigation
```typescript
interface CategoryNavigationProps {
  title?: string;
  showStats?: boolean;
  className?: string;
}
```

### SubcategoryCard
```typescript
interface SubcategoryCardProps {
  subcategory: Subcategory;
  parentCategorySlug: string;
  className?: string;
}
```

### SubcategoriesList
```typescript
interface SubcategoriesListProps {
  subcategories: Subcategory[];
  parentCategorySlug: string;
  title?: string;
  className?: string;
}
```

## Хуки

### useRelatedFactories
```typescript
const { factories, loading, error, refetch } = useRelatedFactories({
  currentFactoryId: 'factory-123',
  category: 'knit',
  city: '佛山',
  segment: 'high',
  limit: 6
});
```

## Использование

### Базовое использование страницы категории
```typescript
import { CategoryPage } from '../components/pages/category-page';

export default function CategoryPageRoute({ params }: { params: { slug: string } }) {
  return <CategoryPage categorySlug={params.slug} />;
}
```

### Добавление связанных фабрик на детальную страницу
```typescript
import { RelatedFactories } from '../components/ui/related-factories';
import { useRelatedFactories } from '../hooks/useRelatedFactories';

function FactoryDetailPage({ factoryId }: { factoryId: string }) {
  const { factories: relatedFactories } = useRelatedFactories({
    currentFactoryId: factoryId,
    category: 'knit',
    limit: 3
  });

  return (
    <div>
      {/* Основной контент фабрики */}
      
      {/* Связанные фабрики */}
      <RelatedFactories
        factories={relatedFactories}
        currentFactoryId={factoryId}
        category="knit"
        maxDisplay={3}
      />
    </div>
  );
}
```

### Добавление навигации по категориям на главную страницу
```typescript
import { CategoryNavigation } from '../components/ui/category-navigation';

function HomePage() {
  return (
    <div>
      {/* Другой контент */}
      
      <CategoryNavigation
        title="Категории фабрик"
        showStats={true}
      />
    </div>
  );
}
```

### Добавление подкатегорий на страницу категории
```typescript
import { SubcategoriesList } from '../components/ui/subcategories-list';

function CategoryPage({ categorySlug }: { categorySlug: string }) {
  const category = CATEGORIES[categorySlug];
  
  return (
    <div>
      {/* Основной контент категории */}
      
      <SubcategoriesList
        subcategories={category.subcategories}
        parentCategorySlug={categorySlug}
        title="Подкатегории"
      />
    </div>
  );
}
```

### Использование страницы подкатегории
```typescript
import { SubcategoryPage } from '../components/pages/subcategory-page';

export default function SubcategoryPageRoute({ params }: { params: { categorySlug: string; subcategorySlug: string } }) {
  return (
    <SubcategoryPage 
      categorySlug={params.categorySlug} 
      subcategorySlug={params.subcategorySlug} 
    />
  );
}
```

## Статистика категорий

### Структура статистики
```typescript
interface CategoryStats {
  totalFactories: number;  // Общее количество фабрик
  avgRating: number;       // Средний рейтинг
  avgLeadTime: number;     // Средний срок производства (дни)
  avgMOQ: number;          // Средний минимальный заказ
}
```

### Пример статистики для категории "Трикотаж"
```typescript
{
  totalFactories: 45,
  avgRating: 4.2,
  avgLeadTime: 25,
  avgMOQ: 500
}
```

## Особенности реализации

### Фильтрация по категориям
- Автоматическая фильтрация фабрик по специализации
- Сохранение других фильтров при смене категории
- URL параметры для всех фильтров

### Связанные фабрики
- Умный алгоритм поиска похожих фабрик
- Приоритет по рейтингу
- Учет города и сегмента
- Исключение текущей фабрики

### Навигация
- Быстрое переключение между категориями
- Визуальные индикаторы текущей категории
- Hover эффекты и анимации

### SEO и производительность
- SEO-дружественные URL
- Метаданные для каждой категории
- Оптимизированные запросы к базе данных
- Кэширование результатов

## Интеграция с существующей системой

### Поиск и фильтрация
- Полная интеграция с FactorySearch
- Поддержка всех фильтров в категориях
- URL параметры для всех настроек

### Детальная страница фабрики
- Автоматическое отображение связанных фабрик
- Навигация к категории фабрики
- Контекстная информация

### Главная страница
- Компонент навигации по категориям
- Статистика по всем категориям
- Быстрый доступ к популярным категориям

## Следующие шаги

1. **Динамическая статистика** - получение реальной статистики из базы данных
2. **Аналитика категорий** - отслеживание популярности категорий
3. **Персонализация** - рекомендации категорий на основе истории
4. **Расширенные фильтры** - дополнительные фильтры для каждой категории
5. **Сравнение категорий** - возможность сравнения статистики категорий
6. **Дополнительные подкатегории** - добавление новых подкатегорий в существующие категории
7. **SEO оптимизация** - улучшение метаданных для подкатегорий
8. **Аналитика подкатегорий** - отслеживание популярности подкатегорий
