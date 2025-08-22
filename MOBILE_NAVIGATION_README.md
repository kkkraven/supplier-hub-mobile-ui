# Мобильная навигация - Документация

## Обзор

Реализована полная мобильная навигация для проекта Factura Supplier Hub с поддержкой touch-интерфейса и оптимизацией для мобильных устройств.

## Компоненты

### 1. Navbar (`src/components/navbar.tsx`)
Основной компонент навигации с адаптивным поведением:
- **Desktop**: Полная навигация с кнопками и пользовательским меню
- **Mobile**: Упрощенная навигация с hamburger меню

**Особенности:**
- Автоматическое переключение между desktop и mobile режимами
- Touch-оптимизированные кнопки (минимум 44px)
- Адаптивный логотип (скрытие "Supplier Hub" на мобильных)

### 2. MobileMenu (`src/components/ui/mobile-menu.tsx`)
Боковое меню для мобильных устройств:
- **Расположение**: Левая сторона экрана
- **Ширина**: 280px на мобильных, 320px на планшетах
- **Функции**: Навигация, аутентификация, админ-панель

**Особенности:**
- Sticky header с кнопкой закрытия
- Группировка элементов навигации
- Визуальные индикаторы активного состояния
- Автоматическое закрытие при навигации

### 3. BottomNavigation (`src/components/ui/bottom-navigation.tsx`)
Нижняя навигация для мобильных устройств:
- **Расположение**: Фиксированная внизу экрана
- **Элементы**: Главная, Каталог, Фабрики, Цены, RFQ/Войти
- **Адаптивность**: Скрывается на desktop устройствах

**Особенности:**
- Увеличенные touch targets (60px)
- Визуальные индикаторы активного состояния
- Плавные анимации переходов
- Динамическое содержимое в зависимости от авторизации

### 4. TouchButton (`src/components/ui/touch-button.tsx`)
Специализированные кнопки для touch-интерфейса:
- **Размеры**: default (44px) и large (60px)
- **Варианты**: default, primary, secondary, ghost, outline
- **Особенности**: Touch feedback, focus states, accessibility

### 5. MobileLayout (`src/components/ui/mobile-layout.tsx`)
Компоненты для адаптивного layout:
- **MobileLayout**: Основной контейнер с отступами для bottom navigation
- **MobileContainer**: Контейнер с адаптивными отступами
- **MobileSection**: Секции с адаптивными отступами

## CSS Стили

### Основные классы (`src/app/globals.css`)

```css
/* Touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

.touch-target-large {
  min-height: 60px;
  min-width: 60px;
}

/* Mobile optimizations */
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

### Анимации
- Плавные переходы для всех элементов
- Оптимизированные анимации для мобильных устройств
- Stagger эффекты для списков

## Использование

### Базовое использование
```tsx
import { Navbar } from '../components/navbar';

function App() {
  return (
    <div>
      <Navbar 
        currentPage="landing"
        showAdminButton={false}
      />
      {/* Контент */}
    </div>
  );
}
```

### С MobileLayout
```tsx
import { MobileLayout, MobileContainer } from '../components/ui/mobile-layout';

function Page() {
  return (
    <MobileLayout>
      <MobileContainer>
        {/* Контент страницы */}
      </MobileContainer>
    </MobileLayout>
  );
}
```

### Touch-оптимизированные кнопки
```tsx
import { TouchButton, MobileNavButton } from '../components/ui/touch-button';

// Обычная кнопка
<TouchButton 
  variant="primary" 
  size="md" 
  touchTarget="default"
  onClick={handleClick}
>
  Нажми меня
</TouchButton>

// Кнопка для мобильной навигации
<MobileNavButton
  icon={<HomeIcon />}
  label="Главная"
  isActive={true}
  onClick={handleNavigate}
/>
```

## Принципы дизайна

### 1. Touch-First подход
- Минимальный размер touch target: 44px
- Увеличенные кнопки для bottom navigation: 60px
- Улучшенная обратная связь при касании

### 2. Адаптивность
- Автоматическое переключение между desktop и mobile
- Скрытие/показ элементов в зависимости от размера экрана
- Оптимизированные отступы для разных устройств

### 3. Accessibility
- ARIA labels для всех интерактивных элементов
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility

### 4. Performance
- Оптимизированные анимации для мобильных устройств
- Lazy loading компонентов
- Минимальные re-renders

## Тестирование

### Мобильные устройства
1. Проверить touch targets (минимум 44px)
2. Тестировать bottom navigation
3. Проверить hamburger menu
4. Тестировать анимации и переходы

### Desktop устройства
1. Убедиться, что bottom navigation скрыта
2. Проверить полную навигацию в header
3. Тестировать hover эффекты

### Accessibility
1. Проверить keyboard navigation
2. Тестировать с screen reader
3. Проверить focus indicators
4. Тестировать ARIA labels

## Будущие улучшения

1. **Gesture support**: Добавить swipe жесты для навигации
2. **Haptic feedback**: Добавить вибрацию для touch событий
3. **Offline support**: Кэширование навигации для offline режима
4. **Analytics**: Отслеживание использования мобильной навигации
5. **Customization**: Возможность настройки bottom navigation пользователем

## Совместимость

- **Браузеры**: Chrome, Safari, Firefox, Edge (мобильные и desktop)
- **Устройства**: iOS, Android, Windows, macOS
- **Размеры экрана**: 320px - 1920px+
- **Touch support**: Полная поддержка touch событий
