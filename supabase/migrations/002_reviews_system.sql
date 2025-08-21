-- Создание таблицы отзывов
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  experience TEXT NOT NULL CHECK (experience IN ('positive', 'neutral', 'negative')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  rejection_reason TEXT,
  moderator_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_reviews_factory_id ON reviews(factory_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Создание функции для инкремента счетчиков
CREATE OR REPLACE FUNCTION increment(field_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(field_name::INTEGER, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Создание представления для статистики отзывов
CREATE OR REPLACE VIEW reviews_stats AS
SELECT 
  factory_id,
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_reviews,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reviews,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_reviews
FROM reviews
GROUP BY factory_id;

-- Добавление RLS политик (если используется)
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Политика для чтения отзывов (только одобренные)
-- CREATE POLICY "Users can view approved reviews" ON reviews
--   FOR SELECT USING (status = 'approved');

-- Политика для создания отзывов
-- CREATE POLICY "Users can create reviews" ON reviews
--   FOR INSERT WITH CHECK (true);

-- Политика для обновления отзывов (только автор или модератор)
-- CREATE POLICY "Users can update their own reviews" ON reviews
--   FOR UPDATE USING (auth.uid() = user_id);

-- Политика для модерации (только администраторы)
-- CREATE POLICY "Admins can moderate reviews" ON reviews
--   FOR UPDATE USING (auth.role() = 'admin');

-- Вставка тестовых данных
INSERT INTO reviews (
  factory_id,
  user_id,
  user_name,
  rating,
  title,
  content,
  pros,
  cons,
  experience,
  status,
  helpful,
  not_helpful
) VALUES 
(
  (SELECT id FROM factories LIMIT 1),
  (SELECT id FROM users WHERE role = 'user' LIMIT 1),
  'Алексей Петров',
  5,
  'Отличное качество продукции',
  'Работаем с этой фабрикой уже 2 года. Качество продукции всегда на высоте, сроки соблюдаются. Рекомендую всем, кто ищет надежного партнера.',
  'Высокое качество, соблюдение сроков, профессиональный подход',
  'Немного дороже конкурентов',
  'positive',
  'approved',
  12,
  1
),
(
  (SELECT id FROM factories LIMIT 1),
  (SELECT id FROM users WHERE role = 'user' LIMIT 1),
  'Мария Сидорова',
  4,
  'Хороший опыт сотрудничества',
  'Заказали первую партию одежды. Качество хорошее, но были небольшие задержки в сроках. В целом довольны результатом.',
  'Качественная продукция, вежливое общение',
  'Небольшие задержки в сроках',
  'positive',
  'approved',
  8,
  2
),
(
  (SELECT id FROM factories LIMIT 1),
  (SELECT id FROM users WHERE role = 'user' LIMIT 1),
  'Дмитрий Козлов',
  3,
  'Средний опыт',
  'Качество продукции удовлетворительное, но есть проблемы с коммуникацией. Сроки соблюдаются с задержками.',
  'Приемлемая цена',
  'Проблемы с коммуникацией, задержки',
  'neutral',
  'approved',
  5,
  3
),
(
  (SELECT id FROM factories LIMIT 1),
  (SELECT id FROM users WHERE role = 'user' LIMIT 1),
  'Анна Волкова',
  2,
  'Не рекомендую',
  'Очень разочарованы качеством продукции. Много брака, сроки не соблюдаются. Не советую работать с этой фабрикой.',
  'Низкая цена',
  'Низкое качество, много брака, нарушение сроков',
  'negative',
  'approved',
  2,
  15
),
(
  (SELECT id FROM factories LIMIT 1),
  (SELECT id FROM users WHERE role = 'user' LIMIT 1),
  'Сергей Иванов',
  5,
  'Лучшая фабрика из всех',
  'Просто потрясающий опыт работы! Качество продукции превзошло все ожидания. Сроки соблюдены точно в срок.',
  'Высокое качество, точные сроки, отличная коммуникация',
  'Нет',
  'positive',
  'pending',
  0,
  0
);

