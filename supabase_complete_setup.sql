-- ============================================================================
-- SUPPLIER HUB - ПОЛНАЯ НАСТРОЙКА SUPABASE
-- ============================================================================
-- Этот скрипт создает всю структуру базы данных для Supplier Hub
-- Выполните его полностью в SQL Editor вашего проекта Supabase
--
-- Включает:
-- ✅ Все таблицы с правильными связями
-- ✅ Индексы для оптимизации
-- ✅ Row Level Security (RLS) политики
-- ✅ Триггеры для автоматического обновления
-- ✅ Тестовые данные для проверки
-- ✅ Storage buckets и политики
-- ============================================================================

-- ============================================================================
-- 1. СОЗДАНИЕ ОСНОВНЫХ ТАБЛИЦ
-- ============================================================================

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'factory')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  factory_count INTEGER DEFAULT 0,
  avg_moq TEXT,
  avg_lead_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы фабрик
CREATE TABLE IF NOT EXISTS factories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_name_cn TEXT NOT NULL,
  legal_name_en TEXT,
  city TEXT NOT NULL,
  province TEXT,
  segment TEXT DEFAULT 'mid' CHECK (segment IN ('low', 'mid', 'mid+', 'high')),
  address_cn TEXT NOT NULL,
  lat_lng JSONB,
  wechat_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  moq_units INTEGER,
  lead_time_days INTEGER,
  capacity_month INTEGER,
  certifications JSONB,
  interaction_level INTEGER DEFAULT 0 CHECK (interaction_level IN (0, 1, 2, 3)),
  last_interaction_date TIMESTAMP WITH TIME ZONE,
  avatar_url TEXT,
  last_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Создание таблицы RFQ (запросы предложений)
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  category_id UUID REFERENCES categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'quoted', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID REFERENCES rfqs(id) NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[],
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. СОЗДАНИЕ ДОПОЛНИТЕЛЬНЫХ ТАБЛИЦ (RFQ СИСТЕМА)
-- ============================================================================

-- Создание таблицы для вложений RFQ
CREATE TABLE IF NOT EXISTS rfq_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы для отслеживания отправки RFQ фабрикам
CREATE TABLE IF NOT EXISTS rfq_sent_factories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'error')),
  email TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы для шаблонов писем
CREATE TABLE IF NOT EXISTS rfq_email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы для предложений от фабрик
CREATE TABLE IF NOT EXISTS rfq_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  lead_time_days INTEGER NOT NULL,
  moq_units INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  terms_conditions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальный индекс для предотвращения дублирования предложений
  UNIQUE(rfq_id, factory_id)
);

-- ============================================================================
-- 3. СОЗДАНИЕ ТАБЛИЦЫ ОТЗЫВОВ
-- ============================================================================

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

-- ============================================================================
-- 4. СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ
-- ============================================================================

-- Индексы для основных таблиц
CREATE INDEX IF NOT EXISTS idx_factories_city ON factories(city);
CREATE INDEX IF NOT EXISTS idx_factories_segment ON factories(segment);
CREATE INDEX IF NOT EXISTS idx_factories_created_at ON factories(created_at);
CREATE INDEX IF NOT EXISTS idx_rfqs_user_id ON rfqs(user_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_messages_rfq_id ON messages(rfq_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Индексы для RFQ системы
CREATE INDEX IF NOT EXISTS idx_rfq_attachments_rfq_id ON rfq_attachments(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_attachments_created_at ON rfq_attachments(created_at);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_rfq_id ON rfq_sent_factories(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_factory_id ON rfq_sent_factories(factory_id);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_status ON rfq_sent_factories(status);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_sent_at ON rfq_sent_factories(sent_at);
CREATE INDEX IF NOT EXISTS idx_rfq_email_templates_user_id ON rfq_email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_rfq_email_templates_is_default ON rfq_email_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_rfq_id ON rfq_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_factory_id ON rfq_quotes(factory_id);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_status ON rfq_quotes(status);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_price ON rfq_quotes(price);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_created_at ON rfq_quotes(created_at);

-- Индексы для отзывов
CREATE INDEX IF NOT EXISTS idx_reviews_factory_id ON reviews(factory_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- ============================================================================
-- 5. СОЗДАНИЕ ФУНКЦИЙ И ТРИГГЕРОВ
-- ============================================================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at (с проверкой существования)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_factories_updated_at ON factories;
CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfqs_updated_at ON rfqs;
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfq_attachments_updated_at ON rfq_attachments;
CREATE TRIGGER update_rfq_attachments_updated_at
  BEFORE UPDATE ON rfq_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfq_sent_factories_updated_at ON rfq_sent_factories;
CREATE TRIGGER update_rfq_sent_factories_updated_at
  BEFORE UPDATE ON rfq_sent_factories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfq_email_templates_updated_at ON rfq_email_templates;
CREATE TRIGGER update_rfq_email_templates_updated_at
  BEFORE UPDATE ON rfq_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfq_quotes_updated_at ON rfq_quotes;
CREATE TRIGGER update_rfq_quotes_updated_at
  BEFORE UPDATE ON rfq_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для обновления статуса RFQ при получении предложений
CREATE OR REPLACE FUNCTION update_rfq_status_on_quote()
RETURNS TRIGGER AS $$
BEGIN
  -- Если это первое предложение для RFQ, обновляем статус на 'quoted'
  IF NOT EXISTS (
    SELECT 1 FROM rfq_quotes 
    WHERE rfq_id = NEW.rfq_id 
    AND id != NEW.id
  ) THEN
    UPDATE rfqs 
    SET status = 'quoted', updated_at = NOW()
    WHERE id = NEW.rfq_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления статуса RFQ
DROP TRIGGER IF EXISTS update_rfq_status_on_quote_trigger ON rfq_quotes;
CREATE TRIGGER update_rfq_status_on_quote_trigger
  AFTER INSERT ON rfq_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_status_on_quote();

-- Функция для инкремента счетчиков отзывов
CREATE OR REPLACE FUNCTION increment(field_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(field_name::INTEGER, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. СОЗДАНИЕ ПРЕДСТАВЛЕНИЙ
-- ============================================================================

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
WHERE status = 'approved'
GROUP BY factory_id;

-- ============================================================================
-- 7. НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Включение Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_sent_factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

-- Удаляем существующие политики перед созданием новых
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "New users can insert their profile" ON users;

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "New users can insert their profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 9. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ КАТЕГОРИЙ
-- ============================================================================

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 10. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ ФАБРИК
-- ============================================================================

CREATE POLICY "Factories are viewable by everyone" ON factories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert factories" ON factories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update factories" ON factories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 11. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ RFQ
-- ============================================================================

CREATE POLICY "Users can view their own RFQs" ON rfqs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RFQs" ON rfqs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RFQs" ON rfqs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all RFQs" ON rfqs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 12. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ СООБЩЕНИЙ
-- ============================================================================

CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- ============================================================================
-- 13. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ RFQ ATTACHMENTS
-- ============================================================================

CREATE POLICY "Users can view their own RFQ attachments" ON rfq_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfqs 
      WHERE rfqs.id = rfq_attachments.rfq_id 
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for their own RFQs" ON rfq_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rfqs 
      WHERE rfqs.id = rfq_attachments.rfq_id 
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own RFQ attachments" ON rfq_attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rfqs 
      WHERE rfqs.id = rfq_attachments.rfq_id 
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own RFQ attachments" ON rfq_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rfqs 
      WHERE rfqs.id = rfq_attachments.rfq_id 
      AND rfqs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 14. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ RFQ SENT FACTORIES
-- ============================================================================

CREATE POLICY "Users can view their own RFQ sent factories" ON rfq_sent_factories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_sent_factories.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sent factories for their own RFQs" ON rfq_sent_factories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_sent_factories.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own RFQ sent factories" ON rfq_sent_factories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_sent_factories.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own RFQ sent factories" ON rfq_sent_factories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_sent_factories.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 15. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ EMAIL TEMPLATES
-- ============================================================================

CREATE POLICY "Users can view their own email templates" ON rfq_email_templates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email templates" ON rfq_email_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own email templates" ON rfq_email_templates
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own email templates" ON rfq_email_templates
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 16. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ RFQ QUOTES
-- ============================================================================

CREATE POLICY "Users can view quotes for their own RFQs" ON rfq_quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_quotes.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert quotes for sent RFQs" ON rfq_quotes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rfq_sent_factories
      WHERE rfq_sent_factories.rfq_id = rfq_quotes.rfq_id
      AND rfq_sent_factories.factory_id = rfq_quotes.factory_id
      AND rfq_sent_factories.status IN ('sent', 'delivered', 'read')
    )
  );

CREATE POLICY "Users can update quote status for their own RFQs" ON rfq_quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_quotes.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 17. ПОЛИТИКИ БЕЗОПАСНОСТИ ДЛЯ ОТЗЫВОВ
-- ============================================================================

CREATE POLICY "Users can view approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate reviews" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 18. СОЗДАНИЕ STORAGE BUCKETS И ПОЛИТИК
-- ============================================================================

-- Создание bucket для вложений RFQ
INSERT INTO storage.buckets (id, name, public)
VALUES ('rfq-attachments', 'rfq-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для аватаров пользователей
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для изображений фабрик
INSERT INTO storage.buckets (id, name, public)
VALUES ('factory-images', 'factory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для bucket rfq-attachments
CREATE POLICY "Users can upload RFQ attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'rfq-attachments' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own RFQ attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'rfq-attachments' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own RFQ attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'rfq-attachments' AND 
    auth.role() = 'authenticated'
  );

-- Политики для bucket avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

-- Политики для bucket factory-images
CREATE POLICY "Anyone can view factory images" ON storage.objects
  FOR SELECT USING (bucket_id = 'factory-images');

CREATE POLICY "Admins can upload factory images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'factory-images' AND 
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 19. ВСТАВКА ТЕСТОВЫХ ДАННЫХ
-- ============================================================================

-- Вставка начальных данных для категорий
INSERT INTO categories (slug, name, description, image_url, factory_count, avg_moq, avg_lead_time) VALUES
('knit', 'Knit / Трикотаж', 'Футболки, худи, свитшоты, спортивная одежда', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop&auto=format&q=80', 25, '300-500 шт', '12-18 дней'),
('woven', 'Woven / Ткань', 'Рубашки, блузки, платья, деловая одежда', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&auto=format&q=80', 30, '200-400 шт', '18-25 дней'),
('outerwear', 'Outerwear / Верхняя одежда', 'Куртки, пальто, пуховики, дождевики', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop&auto=format&q=80', 15, '100-300 шт', '25-35 дней'),
('denim', 'Denim / Джинсовая одежда', 'Джинсы, джинсовые куртки, юбки', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format&q=80', 18, '250-400 шт', '20-30 дней'),
('activewear', 'Activewear / Спортивная одежда', 'Леггинсы, спортивные бра, шорты', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80', 22, '200-500 шт', '15-25 дней'),
('accessories', 'Accessories / Аксессуары', 'Сумки, кошельки, ремни, головные уборы', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80', 12, '100-250 шт', '10-20 дней')
ON CONFLICT (slug) DO NOTHING;

-- Вставка тестовых фабрик
INSERT INTO factories (legal_name_cn, legal_name_en, city, province, segment, address_cn, wechat_id, phone, email, moq_units, lead_time_days, capacity_month, certifications, created_by) VALUES
('金线针织有限公司', 'Golden Thread Knitting Co.', '佛山', '广东', 'high', '广东省佛山市南海区纺织工业园', 'golden_thread_knit', '+86 757 1234 5678', 'info@goldenthread.com', 300, 15, 50000, '{"bsci": true, "iso9001": true, "gots": true}', NULL),
('旭日纺织厂', 'Sunrise Textile Mills', '东莞', '广东', 'mid+', '广东省东莞市虎门镇纺织路123号', 'sunrise_textile', '+86 769 8765 4321', 'contact@sunrisetextile.com', 200, 18, 30000, '{"bsci": true, "iso9001": true}', NULL),
('帝国织造公司', 'Imperial Weaving Co.', '苏州', '江苏', 'high', '江苏省苏州市吴江区盛泽镇', 'imperial_weaving', '+86 512 5555 6666', 'sales@imperialweaving.com', 250, 20, 40000, '{"bsci": true, "iso9001": true, "oeko_tex": true}', NULL),
('东方丝绸厂', 'Oriental Silk Mills', '杭州', '浙江', 'mid+', '浙江省杭州市西湖区丝绸工业园', 'oriental_silk', '+86 571 2222 3333', 'sales@orientalsilk.com', 150, 22, 25000, '{"bsci": true, "gots": true}', NULL),
('华南制衣', 'South China Garments', '广州', '广东', 'mid', '广东省广州市海珠区工业大道', 'south_china_garments', '+86 20 8888 9999', 'info@southchina.com', 500, 20, 80000, '{"iso9001": true}', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 20. ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================================================

-- Проверяем, что все таблицы созданы
DO $$
BEGIN
  RAISE NOTICE '✅ Проверка завершена. Созданы следующие таблицы:';
  RAISE NOTICE '- users: % строк', (SELECT COUNT(*) FROM users);
  RAISE NOTICE '- categories: % строк', (SELECT COUNT(*) FROM categories);
  RAISE NOTICE '- factories: % строк', (SELECT COUNT(*) FROM factories);
  RAISE NOTICE '- rfqs: % строк', (SELECT COUNT(*) FROM rfqs);
  RAISE NOTICE '- messages: % строк', (SELECT COUNT(*) FROM messages);
  RAISE NOTICE '- rfq_attachments: % строк', (SELECT COUNT(*) FROM rfq_attachments);
  RAISE NOTICE '- rfq_sent_factories: % строк', (SELECT COUNT(*) FROM rfq_sent_factories);
  RAISE NOTICE '- rfq_email_templates: % строк', (SELECT COUNT(*) FROM rfq_email_templates);
  RAISE NOTICE '- rfq_quotes: % строк', (SELECT COUNT(*) FROM rfq_quotes);
  RAISE NOTICE '- reviews: % строк', (SELECT COUNT(*) FROM reviews);
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Настройка Supabase завершена успешно!';
  RAISE NOTICE '📋 Следующие шаги:';
  RAISE NOTICE '1. Перейдите на http://localhost:3000/supabase-test';
  RAISE NOTICE '2. Нажмите "Проверить подключение"';
  RAISE NOTICE '3. Зарегистрируйтесь как новый пользователь';
  RAISE NOTICE '4. Изучите каталог и создайте первый RFQ';
END $$;
