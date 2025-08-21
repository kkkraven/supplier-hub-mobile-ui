# Система рейтингов и отзывов

## Обзор

Реализована полнофункциональная система рейтингов и отзывов для фабрик с возможностью модерации, голосования и аналитики.

## Структура файлов

### 1. Компоненты UI
- **RatingStars** (`/src/components/ui/rating-stars.tsx`) - компонент звездного рейтинга
- **ReviewForm** (`/src/components/ui/review-form.tsx`) - форма написания отзыва
- **ReviewsList** (`/src/components/ui/reviews-list.tsx`) - список отзывов с фильтрацией
- **ReviewModeration** (`/src/components/ui/review-moderation.tsx`) - панель модерации

### 2. Хуки
- **useReviews** (`/src/hooks/useReviews.ts`) - получение отзывов и статистики
- **useSubmitReview** (`/src/hooks/useReviews.ts`) - отправка отзывов
- **useReviewModeration** (`/src/hooks/useReviews.ts`) - модерация отзывов
- **useHelpfulVote** (`/src/hooks/useReviews.ts`) - голосование за полезность

### 3. Страницы
- **ReviewsModerationPage** (`/src/app/admin/reviews/page.tsx`) - страница модерации

### 4. База данных
- **002_reviews_system.sql** (`/supabase/migrations/002_reviews_system.sql`) - миграция БД

## Функциональность

### 2.5.1 Создать систему рейтингов (1-5 звезд)
✅ **Реализовано:**
- Интерактивный компонент звездного рейтинга
- Поддержка hover эффектов
- Различные размеры (sm, md, lg)
- Отображение числового значения
- Валидация рейтинга (1-5 звезд)

### 2.5.2 Добавить форму отзыва
✅ **Реализовано:**
- Полная форма с валидацией
- Поля: рейтинг, заголовок, содержание, достоинства, недостатки
- Тип опыта (положительный, нейтральный, отрицательный)
- Счетчики символов
- Модальное окно для написания отзыва

### 2.5.3 Показать отзывы на странице фабрики
✅ **Реализовано:**
- Список отзывов с пагинацией
- Статистика рейтингов (средний рейтинг, распределение)
- Фильтрация по типу опыта
- Сортировка (новые, старые, рейтинг, полезность)
- Голосование за полезность отзывов
- Отображение аватаров и дат

### 2.5.4 Добавить модерацию отзывов
✅ **Реализовано:**
- Панель модерации для администраторов
- Одобрение/отклонение отзывов
- Пометка подозрительных отзывов
- Причины отклонения и пометки
- Примечания модератора
- Статусы отзывов (pending, approved, rejected)

## Компоненты

### RatingStars
```typescript
interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}
```

### ReviewForm
```typescript
interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  experience: 'positive' | 'neutral' | 'negative';
}
```

### ReviewsList
```typescript
interface Review {
  id: string;
  factoryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  experience: 'positive' | 'neutral' | 'negative';
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt?: string;
}
```

## Хуки

### useReviews
```typescript
const { 
  reviews, 
  totalReviews, 
  averageRating, 
  ratingDistribution, 
  loading, 
  error, 
  refetch 
} = useReviews({
  factoryId: 'factory-123',
  status: 'approved',
  limit: 10,
  sortBy: 'newest'
});
```

### useSubmitReview
```typescript
const { submitReview, loading, error } = useSubmitReview();

const handleSubmit = async (reviewData: ReviewFormData) => {
  const result = await submitReview(factoryId, reviewData);
  if (result.success) {
    // Отзыв отправлен
  }
};
```

### useReviewModeration
```typescript
const { approveReview, rejectReview, flagReview, loading } = useReviewModeration();

const handleApprove = async (reviewId: string) => {
  await approveReview(reviewId, 'Примечание модератора');
};

const handleReject = async (reviewId: string, reason: string) => {
  await rejectReview(reviewId, reason, 'Примечание');
};
```

## База данных

### Структура таблицы reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  factory_id UUID REFERENCES factories(factory_id),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  experience TEXT CHECK (experience IN ('positive', 'neutral', 'negative')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  rejection_reason TEXT,
  moderator_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Индексы
- `idx_reviews_factory_id` - для быстрого поиска по фабрике
- `idx_reviews_status` - для фильтрации по статусу
- `idx_reviews_created_at` - для сортировки по дате
- `idx_reviews_rating` - для сортировки по рейтингу
- `idx_reviews_user_id` - для поиска по пользователю

### Представления
- `reviews_stats` - статистика отзывов по фабрикам

## Использование

### Добавление рейтинга на страницу фабрики
```typescript
import { RatingStars } from '../components/ui/rating-stars';

function FactoryCard({ factory }) {
  return (
    <div>
      <RatingStars 
        rating={factory.rating} 
        showValue={true} 
        size="md" 
      />
    </div>
  );
}
```

### Интеграция отзывов на детальную страницу
```typescript
import { ReviewsList } from '../components/ui/reviews-list';
import { useReviews } from '../hooks/useReviews';

function FactoryDetailPage({ factoryId }) {
  const { reviews, totalReviews, averageRating, ratingDistribution } = useReviews({
    factoryId,
    status: 'approved'
  });

  return (
    <ReviewsList
      reviews={reviews}
      totalReviews={totalReviews}
      averageRating={averageRating}
      ratingDistribution={ratingDistribution}
      onHelpfulClick={handleHelpfulClick}
    />
  );
}
```

### Добавление формы отзыва
```typescript
import { ReviewForm } from '../components/ui/review-form';
import { useSubmitReview } from '../hooks/useReviews';

function ReviewModal({ factoryId, factoryName, onClose }) {
  const { submitReview, loading } = useSubmitReview();

  const handleSubmit = async (reviewData) => {
    const result = await submitReview(factoryId, reviewData);
    if (result.success) {
      onClose();
    }
  };

  return (
    <ReviewForm
      factoryId={factoryId}
      factoryName={factoryName}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    />
  );
}
```

### Настройка модерации
```typescript
import { ReviewModeration } from '../components/ui/review-moderation';
import { useReviews, useReviewModeration } from '../hooks/useReviews';

function ModerationPage() {
  const { reviews, refetch } = useReviews({ status: 'pending' });
  const { approveReview, rejectReview, flagReview } = useReviewModeration();

  return (
    <ReviewModeration
      reviews={reviews}
      onApprove={approveReview}
      onReject={rejectReview}
      onFlag={flagReview}
    />
  );
}
```

## Статистика и аналитика

### Распределение рейтингов
- Визуализация распределения звезд (1-5)
- Процентное соотношение каждого рейтинга
- Общее количество отзывов

### Средний рейтинг
- Автоматический расчет среднего рейтинга
- Обновление при добавлении новых отзывов
- Отображение на карточках фабрик

### Полезность отзывов
- Система голосования "полезно/не полезно"
- Сортировка по полезности
- Индикаторы качества отзывов

## Модерация

### Статусы отзывов
- **pending** - ожидает модерации
- **approved** - одобрен и опубликован
- **rejected** - отклонен

### Действия модератора
- **Одобрить** - публикация отзыва
- **Отклонить** - отклонение с указанием причины
- **Пометить** - пометка подозрительного отзыва

### Причины отклонения
- Спам или реклама
- Оскорбления или нецензурная лексика
- Ложная информация
- Дублирование отзыва
- Не соответствует теме

## Безопасность

### Валидация данных
- Проверка рейтинга (1-5 звезд)
- Минимальная длина заголовка и содержания
- Валидация типа опыта
- Проверка статуса отзыва

### RLS политики (готовы к использованию)
- Чтение только одобренных отзывов
- Создание отзывов авторизованными пользователями
- Обновление только автором или модератором
- Модерация только администраторами

## Производительность

### Оптимизация запросов
- Индексы для быстрых поисков
- Пагинация результатов
- Кэширование статистики
- Ленивая загрузка отзывов

### Масштабируемость
- Поддержка большого количества отзывов
- Эффективная фильтрация и сортировка
- Оптимизированные запросы к БД

## Следующие шаги

1. **Интеграция с аутентификацией** - подключение к системе пользователей
2. **Уведомления** - уведомления о новых отзывах и модерации
3. **Аналитика** - детальная аналитика отзывов
4. **Автомодерация** - автоматическая проверка отзывов
5. **Ответы фабрик** - возможность ответа на отзывы
6. **Фотографии в отзывах** - добавление изображений к отзывам
7. **Экспорт данных** - экспорт отзывов для анализа
8. **API для мобильных приложений** - REST API для отзывов


