-- Создание таблицы пользователей
CREATE TABLE users (
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
CREATE TABLE categories (
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
CREATE TABLE factories (
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
CREATE TABLE rfqs (
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
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID REFERENCES rfqs(id) NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[],
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_factories_city ON factories(city);
CREATE INDEX idx_factories_segment ON factories(segment);
CREATE INDEX idx_factories_created_at ON factories(created_at);
CREATE INDEX idx_rfqs_user_id ON rfqs(user_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_messages_rfq_id ON messages(rfq_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка начальных данных для категорий
INSERT INTO categories (slug, name, description, image_url, factory_count, avg_moq, avg_lead_time) VALUES
('knit', 'Knit / Трикотаж', 'Футболки, худи, свитшоты, спортивная одежда', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop&auto=format&q=80', 25, '300-500 шт', '12-18 дней'),
('woven', 'Woven / Ткань', 'Рубашки, блузки, платья, деловая одежда', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&auto=format&q=80', 30, '200-400 шт', '18-25 дней'),
('outerwear', 'Outerwear / Верхняя одежда', 'Куртки, пальто, пуховики, дождевики', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop&auto=format&q=80', 15, '100-300 шт', '25-35 дней'),
('denim', 'Denim / Джинсовая одежда', 'Джинсы, джинсовые куртки, юбки', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&auto=format&q=80', 18, '250-400 шт', '20-30 дней'),
('activewear', 'Activewear / Спортивная одежда', 'Леггинсы, спортивные бра, шорты', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format&q=80', 22, '200-500 шт', '15-25 дней'),
('accessories', 'Accessories / Аксессуары', 'Сумки, кошельки, ремни, головные уборы', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format&q=80', 12, '100-250 шт', '10-20 дней');

-- Вставка тестовых фабрик
INSERT INTO factories (legal_name_cn, legal_name_en, city, province, segment, address_cn, wechat_id, phone, email, moq_units, lead_time_days, capacity_month, certifications, created_by) VALUES
('金线针织有限公司', 'Golden Thread Knitting Co.', '佛山', '广东', 'high', '广东省佛山市南海区纺织工业园', 'golden_thread_knit', '+86 757 1234 5678', 'info@goldenthread.com', 300, 15, 50000, '{"bsci": true, "iso9001": true, "gots": true}', NULL),
('旭日纺织厂', 'Sunrise Textile Mills', '东莞', '广东', 'mid+', '广东省东莞市虎门镇纺织路123号', 'sunrise_textile', '+86 769 8765 4321', 'contact@sunrisetextile.com', 200, 18, 30000, '{"bsci": true, "iso9001": true}', NULL),
('帝国织造公司', 'Imperial Weaving Co.', '苏州', '江苏', 'high', '江苏省苏州市吴江区盛泽镇', 'imperial_weaving', '+86 512 5555 6666', 'sales@imperialweaving.com', 250, 20, 40000, '{"bsci": true, "iso9001": true, "oeko_tex": true}', NULL);

-- Включение Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для пользователей
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

-- Политики безопасности для категорий (публичный доступ)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Политики безопасности для фабрик
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

-- Политики безопасности для RFQ
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

-- Политики безопасности для сообщений
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);
