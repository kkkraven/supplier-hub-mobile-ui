# Базовая структура фабрик

## Обзор

Реализована полная базовая структура для работы с фабриками в приложении Supplier Hub. Система включает типы данных, компоненты отображения, страницы и интеграцию с Supabase.

## Структура файлов

### 1. Типы данных (`/src/types/factory.ts`)

```typescript
export type FactorySegment = 'low' | 'mid' | 'mid+' | 'high';
export type InteractionLevel = 0 | 1 | 2 | 3;

export interface Factory {
  factory_id: string;
  legal_name_cn: string;
  legal_name_en?: string;
  city: string;
  province?: string;
  segment: FactorySegment;
  address_cn: string;
  lat_lng?: { lat: number; lng: number; };
  wechat_id: string;
  phone: string;
  email?: string;
  moq_units?: number;
  lead_time_days?: number;
  capacity_month?: number;
  certifications?: {
    bsci?: boolean;
    iso9001?: boolean;
    iso14001?: boolean;
    oeko_tex?: boolean;
    gots?: boolean;
  };
  interaction_level: InteractionLevel;
  last_interaction_date?: string;
  avatar_url?: string;
  last_verified?: string;
  created_at: string;
  
  // Вычисляемые поля для UI
  rating?: number;
  reviewCount?: number;
  specialization?: string[];
  verified?: boolean;
}
```

### 2. Компоненты

#### FactoryCard (`/src/components/factory-card.tsx`)
- Карточка фабрики в сеточном виде
- Отображение основной информации
- Интерактивные элементы (кнопки действий)
- Поддержка paywall режима

#### FactoryListItem (`/src/components/factory-list-item.tsx`)
- Элемент списка фабрик в горизонтальном виде
- Компактное отображение информации
- Оптимизирован для просмотра большого количества фабрик

#### LoadingSpinner (`/src/components/ui/loading-spinner.tsx`)
- Компоненты для отображения состояний загрузки
- LoadingSpinner - спиннер загрузки
- LoadingSkeleton - скелетон для контента
- FactoryCardSkeleton - скелетон для карточек фабрик

### 3. Страницы

#### FactoryListPage (`/src/components/pages/factory-list-page.tsx`)
- Основная страница списка фабрик
- Поиск и фильтрация
- Переключение между режимами отображения (сетка/список)
- Пагинация
- Интеграция с Supabase

#### Страница маршрута (`/src/app/factories/page.tsx`)
- Next.js страница для маршрута `/factories`

### 4. Хуки

#### useFactories (`/src/hooks/useFactories.ts`)
```typescript
interface UseFactoriesOptions {
  searchTerm?: string;
  segment?: string;
  city?: string;
  specialization?: string;
  limit?: number;
  offset?: number;
}

interface UseFactoriesReturn {
  factories: Factory[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}
```

#### useFactory (`/src/hooks/useFactories.ts`)
- Хук для получения одной фабрики по ID

## Функциональность

### Поиск и фильтрация
- Поиск по названию, городу, специализации
- Фильтрация по сегменту (low, mid, mid+, high)
- Фильтрация по городу
- Фильтрация по специализации

### Пагинация
- Настраиваемое количество элементов на странице
- Навигация по страницам
- Отображение общего количества фабрик

### Режимы отображения
- **Сетка**: Карточки в сетке (по умолчанию)
- **Список**: Горизонтальные элементы списка

### Состояния загрузки
- Скелетоны во время загрузки
- Обработка ошибок
- Пустое состояние при отсутствии результатов

## Интеграция с Supabase

### Таблица factories
```sql
CREATE TABLE factories (
  factory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name_cn TEXT NOT NULL,
  legal_name_en TEXT,
  city TEXT NOT NULL,
  province TEXT,
  segment TEXT NOT NULL CHECK (segment IN ('low', 'mid', 'mid+', 'high')),
  address_cn TEXT NOT NULL,
  lat_lng JSONB,
  wechat_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  moq_units INTEGER,
  lead_time_days INTEGER,
  capacity_month INTEGER,
  certifications JSONB,
  interaction_level INTEGER NOT NULL DEFAULT 0 CHECK (interaction_level IN (0, 1, 2, 3)),
  last_interaction_date DATE,
  avatar_url TEXT,
  last_verified DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  specialization TEXT[],
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false
);
```

### Запросы
- Получение списка фабрик с фильтрацией и пагинацией
- Получение одной фабрики по ID
- Подсчет общего количества фабрик

## Навигация

Добавлена кнопка "Фабрики" в навигационную панель, которая ведет на страницу `/factories`.

## Стилизация

Все компоненты используют:
- Tailwind CSS для стилизации
- Lucide React для иконок
- Адаптивный дизайн
- Анимации и переходы
- Соответствие дизайн-системе приложения

## Использование

### Базовое использование
```typescript
import { FactoryListPage } from '../components/pages/factory-list-page';

export default function Factories() {
  return (
    <main>
      <FactoryListPage />
    </main>
  );
}
```

### Использование хука
```typescript
import { useFactories } from '../hooks/useFactories';

function MyComponent() {
  const { factories, loading, error, totalCount } = useFactories({
    searchTerm: 'knit',
    segment: 'high',
    limit: 10,
    offset: 0
  });

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {factories.map(factory => (
        <FactoryCard key={factory.factory_id} factory={factory} />
      ))}
    </div>
  );
}
```

## Следующие шаги

1. **Детальная страница фабрики** - создание страницы с подробной информацией о фабрике
2. **Форма добавления/редактирования** - административный интерфейс для управления фабриками
3. **Интеграция с картами** - отображение фабрик на карте
4. **Чат с фабриками** - система обмена сообщениями
5. **Рейтинги и отзывы** - система оценки фабрик
6. **Уведомления** - система уведомлений о новых фабриках или изменениях
