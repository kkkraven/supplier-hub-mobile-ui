# Адаптивные компоненты - Документация

## Обзор

Реализован полный набор адаптивных компонентов для мобильных устройств, обеспечивающих отличный пользовательский опыт на всех размерах экранов.

## Компоненты

### 1. MobileFactoryCard (`src/components/ui/mobile-factory-card.tsx`)

Адаптивная версия карточки фабрики с оптимизированным layout для мобильных устройств.

#### Основная версия
```tsx
<MobileFactoryCard
  factory={factory}
  onClick={handleFactoryClick}
  onChat={handleFactoryChat}
  isPaywallActive={true}
/>
```

#### Компактная версия
```tsx
<MobileFactoryCardCompact
  factory={factory}
  onClick={handleFactoryClick}
  onChat={handleFactoryChat}
  isPaywallActive={true}
/>
```

**Особенности:**
- Горизонтальный layout с изображением слева
- Компактное отображение ключевой информации
- Touch-оптимизированные кнопки действий
- Адаптивные размеры для разных экранов
- Поддержка paywall режима

### 2. MobileFilters (`src/components/ui/mobile-filters.tsx`)

Адаптивная система фильтров с поддержкой различных типов фильтрации.

#### Основная версия
```tsx
<MobileFilters
  filters={filters}
  activeFilters={activeFilters}
  onFiltersChange={handleFiltersChange}
  onClearAll={handleClearAll}
/>
```

#### Компактная версия
```tsx
<MobileFiltersCompact
  filters={filters}
  activeFilters={activeFilters}
  onFiltersChange={handleFiltersChange}
  onClearAll={handleClearAll}
/>
```

**Типы фильтров:**
- `select` - Одиночный выбор
- `multiselect` - Множественный выбор
- `range` - Диапазон значений
- `search` - Поиск по тексту

**Особенности:**
- Sheet-модальное окно на мобильных
- Inline фильтры на desktop
- Поддержка счетчиков элементов
- Touch-оптимизированные элементы управления

### 3. MobileTable (`src/components/ui/mobile-table.tsx`)

Адаптивные таблицы с карточным представлением на мобильных устройствах.

#### Основная версия
```tsx
<MobileTable
  columns={columns}
  data={data}
  onRowClick={handleRowClick}
  onSort={handleSort}
  sortColumn={sortColumn}
  sortDirection={sortDirection}
/>
```

#### Компактная версия
```tsx
<MobileTableCompact
  columns={columns}
  data={data}
  onRowClick={handleRowClick}
/>
```

#### Специализированная таблица фабрик
```tsx
<MobileFactoryTable
  factories={factories}
  onFactoryClick={handleFactoryClick}
/>
```

**Особенности:**
- Автоматическое переключение между таблицей и карточками
- Поддержка сортировки
- Кастомные рендереры для колонок
- Touch-оптимизированные строки

### 4. MobilePagination (`src/components/ui/mobile-pagination.tsx`)

Адаптивная пагинация с различными режимами отображения.

#### Основная версия
```tsx
<MobilePagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  showPageInfo={true}
/>
```

#### Компактная версия
```tsx
<MobilePagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  compact={true}
/>
```

#### Бесконечная прокрутка
```tsx
<MobileInfiniteScroll
  hasMore={hasMore}
  isLoading={isLoading}
  onLoadMore={handleLoadMore}
/>
```

**Особенности:**
- Адаптивные размеры кнопок
- Умная навигация по страницам
- Поддержка бесконечной прокрутки
- Состояния загрузки и пустых данных

### 5. MobileLayout (`src/components/ui/mobile-layout.tsx`)

Компоненты для адаптивного layout с автоматическими отступами.

```tsx
<MobileLayout showBottomPadding={true}>
  <MobileContainer>
    <MobileSection padding="default">
      {/* Контент */}
    </MobileSection>
  </MobileContainer>
</MobileLayout>
```

**Компоненты:**
- `MobileLayout` - Основной контейнер с отступами для bottom navigation
- `MobileContainer` - Контейнер с адаптивными отступами
- `MobileSection` - Секции с адаптивными отступами

### 6. TouchButton (`src/components/ui/touch-button.tsx`)

Touch-оптимизированные кнопки с улучшенной обратной связью.

```tsx
<TouchButton
  variant="primary"
  size="md"
  icon={<Icon />}
  touchTarget="default"
  onClick={handleClick}
>
  Кнопка
</TouchButton>
```

**Варианты:**
- `default`, `primary`, `secondary`, `ghost`, `outline`
- `sm`, `md`, `lg` размеры
- `default` (44px) и `large` (60px) touch targets

## Использование

### Пример страницы со списком фабрик

```tsx
import { MobileFactoryListPage } from '../components/pages/mobile-factory-list-page';

export default function FactoriesPage() {
  return <MobileFactoryListPage />;
}
```

### Интеграция с существующими компонентами

```tsx
import { FactoryCard } from '../components/factory-card';

// FactoryCard автоматически использует мобильную версию на мобильных устройствах
<FactoryCard
  factory={factory}
  onClick={handleClick}
  onChat={handleChat}
/>
```

## Принципы дизайна

### 1. Touch-First подход
- Все интерактивные элементы имеют минимальный размер 44px
- Улучшенная обратная связь при касании
- Оптимизированные анимации для touch устройств

### 2. Адаптивность
- Автоматическое переключение между desktop и mobile версиями
- Responsive дизайн для всех размеров экрана
- Оптимизированные отступы и spacing

### 3. Производительность
- Ленивая загрузка компонентов
- Оптимизированные анимации
- Минимальные re-renders

### 4. Accessibility
- ARIA labels для всех интерактивных элементов
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility

## CSS классы

### Touch targets
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

.touch-target-large {
  min-height: 60px;
  min-width: 60px;
}
```

### Mobile optimizations
```css
.mobile-no-hover:hover {
  transform: none !important;
  scale: none !important;
}

.mobile-touch-feedback:active {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(0.98);
}

.mobile-optimized-animation {
  will-change: transform;
  backface-visibility: hidden;
}
```

## Тестирование

### Мобильные устройства
1. Проверить touch targets (минимум 44px)
2. Тестировать фильтры и поиск
3. Проверить пагинацию и бесконечную прокрутку
4. Тестировать карточки фабрик
5. Проверить адаптивные таблицы

### Desktop устройства
1. Убедиться, что компоненты отображаются корректно
2. Проверить hover эффекты
3. Тестировать полноразмерные таблицы
4. Проверить inline фильтры

### Accessibility
1. Проверить keyboard navigation
2. Тестировать с screen reader
3. Проверить focus indicators
4. Тестировать ARIA labels

## Интеграция

### Автоматическое переключение
Большинство компонентов автоматически переключаются между desktop и mobile версиями:

```tsx
// FactoryCard автоматически использует MobileFactoryCard на мобильных
<FactoryCard factory={factory} />

// MobileFilters автоматически использует sheet на мобильных
<MobileFilters filters={filters} />
```

### Кастомные breakpoints
Используйте `useIsMobile` hook для кастомной логики:

```tsx
import { useIsMobile } from '../components/ui/use-mobile';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileVersion /> : <DesktopVersion />;
}
```

## Будущие улучшения

1. **Gesture support**: Добавить swipe жесты для навигации
2. **Haptic feedback**: Добавить вибрацию для touch событий
3. **Offline support**: Кэширование данных для offline режима
4. **Analytics**: Отслеживание использования компонентов
5. **Customization**: Настройка компонентов пользователем
6. **Performance**: Дальнейшая оптимизация производительности

## Совместимость

- **Браузеры**: Chrome, Safari, Firefox, Edge (мобильные и desktop)
- **Устройства**: iOS, Android, Windows, macOS
- **Размеры экрана**: 320px - 1920px+
- **Touch support**: Полная поддержка touch событий
- **Accessibility**: WCAG 2.1 AA compliance
