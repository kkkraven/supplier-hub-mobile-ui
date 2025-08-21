# Поиск и фильтрация фабрик

## Обзор

Реализована полнофункциональная система поиска и фильтрации фабрик с поддержкой URL параметров, сортировки и дебаунсинга поиска.

## Структура файлов

### 1. Компонент поиска (`/src/components/ui/factory-search.tsx`)
- Основной компонент для поиска и фильтрации
- Поддержка дебаунсинга поиска
- Popover с фильтрами
- Отображение активных фильтров
- Сортировка с переключением порядка

### 2. Хук URL параметров (`/src/hooks/useSearchParams.ts`)
- Управление URL параметрами
- Синхронизация состояния с URL
- Очистка фильтров
- Валидация параметров

### 3. Обновленный хук данных (`/src/hooks/useFactories.ts`)
- Поддержка сортировки
- Расширенные параметры фильтрации
- Оптимизированные запросы к Supabase

## Функциональность

### 2.3.1 Создать компонент поиска
✅ **Реализовано:**
- Поисковая строка с дебаунсингом (300ms)
- Кнопка очистки поиска
- Индикатор загрузки
- Поддержка клавиатурной навигации

### 2.3.2 Добавить фильтры по городу, сегменту, категории
✅ **Реализовано:**
- **Сегмент**: low, mid, mid+, high
- **Город**: 9 основных городов Китая
- **Специализация**: 8 категорий специализации
- Popover интерфейс для фильтров
- Счетчик активных фильтров
- Отображение активных фильтров с возможностью удаления

### 2.3.3 Добавить сортировку (по рейтингу, дате, названию)
✅ **Реализовано:**
- **По названию**: алфавитная сортировка
- **По рейтингу**: числовая сортировка
- **По дате**: дата добавления в базу
- **По взаимодействию**: уровень взаимодействия
- Переключение порядка (по возрастанию/убыванию)
- Визуальные индикаторы сортировки

### 2.3.4 Создать URL параметры для фильтров
✅ **Реализовано:**
- Синхронизация всех фильтров с URL
- Поддержка прямых ссылок с фильтрами
- Автоматическое сброс страницы при изменении фильтров
- Чистые URL (удаление параметров по умолчанию)

## URL параметры

### Структура URL
```
/factories?q=поиск&segment=high&city=佛山&spec=knit&sort=rating&order=desc&page=2
```

### Параметры
- `q` - поисковый запрос
- `segment` - сегмент фабрики (low, mid, mid+, high)
- `city` - город
- `spec` - специализация
- `sort` - поле сортировки (name, rating, date, interaction)
- `order` - порядок сортировки (asc, desc)
- `page` - номер страницы

### Примеры URL
```
/factories                                    # Все фабрики
/factories?q=knit                            # Поиск "knit"
/factories?segment=high&city=佛山            # Премиум фабрики в Фошань
/factories?spec=knit&sort=rating&order=desc  # Трикотаж, по рейтингу
```

## Компоненты

### FactorySearch
```typescript
interface FactorySearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  totalResults?: number;
  loading?: boolean;
  className?: string;
}

interface SearchFilters {
  searchTerm: string;
  segment: string;
  city: string;
  specialization: string;
  sortBy: 'name' | 'rating' | 'date' | 'interaction';
  sortOrder: 'asc' | 'desc';
}
```

### useSearchParamsState
```typescript
const {
  filters,           // Текущие фильтры
  currentPage,       // Текущая страница
  updateSearchParams, // Функция обновления параметров
  clearFilters,      // Функция очистки фильтров
  hasActiveFilters   // Есть ли активные фильтры
} = useSearchParamsState();
```

## Использование

### Базовое использование
```typescript
import { FactorySearch } from '../components/ui/factory-search';
import { useSearchParamsState } from '../hooks/useSearchParams';

function MyComponent() {
  const { filters, updateSearchParams } = useSearchParamsState();
  
  const handleFiltersChange = (newFilters: SearchFilters) => {
    updateSearchParams(newFilters);
  };
  
  return (
    <FactorySearch
      filters={filters}
      onFiltersChange={handleFiltersChange}
      totalResults={100}
      loading={false}
    />
  );
}
```

### Интеграция с useFactories
```typescript
const { filters } = useSearchParamsState();

const { factories, loading, error, totalCount } = useFactories({
  searchTerm: filters.searchTerm,
  segment: filters.segment,
  city: filters.city,
  specialization: filters.specialization,
  sortBy: filters.sortBy,
  sortOrder: filters.sortOrder,
  limit: 10,
  offset: 0
});
```

## Особенности реализации

### Дебаунсинг поиска
- Задержка 300ms перед отправкой запроса
- Предотвращение лишних запросов при быстром вводе
- Оптимизация производительности

### URL синхронизация
- Все фильтры сохраняются в URL
- Возможность поделиться ссылкой с фильтрами
- Поддержка браузерной навигации (назад/вперед)
- Автоматическое восстановление состояния при перезагрузке

### Оптимизация запросов
- Кэширование результатов
- Минимизация запросов к Supabase
- Эффективная сортировка на уровне базы данных

### UX улучшения
- Визуальные индикаторы активных фильтров
- Возможность удаления отдельных фильтров
- Кнопка "Очистить все"
- Счетчик результатов
- Состояния загрузки

## Фильтры и опции

### Сегменты
- `low` - Базовый
- `mid` - Средний
- `mid+` - Средний+
- `high` - Премиум

### Города
- 佛山 / Foshan
- 东莞 / Dongguan
- 苏州 / Suzhou
- 深圳 / Shenzhen
- 青岛 / Qingdao
- 广州 / Guangzhou
- 上海 / Shanghai
- 北京 / Beijing

### Специализации
- Трикотаж / Knit
- Ткань / Woven
- Спортивная одежда
- Премиум одежда
- Техническая одежда
- Джинсовая одежда
- Аксессуары

### Сортировка
- `name` - По названию
- `rating` - По рейтингу
- `date` - По дате добавления
- `interaction` - По уровню взаимодействия

## Следующие шаги

1. **Расширенные фильтры** - добавление фильтров по цене, MOQ, сертификациям
2. **Сохранение фильтров** - сохранение пользовательских предпочтений
3. **Быстрые фильтры** - предустановленные комбинации фильтров
4. **Аналитика** - отслеживание популярных фильтров
5. **Автодополнение** - подсказки при поиске
6. **Геолокация** - фильтрация по расстоянию
