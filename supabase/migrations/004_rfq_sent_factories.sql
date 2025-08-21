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

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_rfq_id ON rfq_sent_factories(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_factory_id ON rfq_sent_factories(factory_id);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_status ON rfq_sent_factories(status);
CREATE INDEX IF NOT EXISTS idx_rfq_sent_factories_sent_at ON rfq_sent_factories(sent_at);

CREATE INDEX IF NOT EXISTS idx_rfq_email_templates_user_id ON rfq_email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_rfq_email_templates_is_default ON rfq_email_templates(is_default);

-- Включение RLS
ALTER TABLE rfq_sent_factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_email_templates ENABLE ROW LEVEL SECURITY;

-- Политики RLS для rfq_sent_factories
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

-- Политики RLS для rfq_email_templates
CREATE POLICY "Users can view their own email templates" ON rfq_email_templates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email templates" ON rfq_email_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own email templates" ON rfq_email_templates
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own email templates" ON rfq_email_templates
  FOR DELETE USING (user_id = auth.uid());

-- Функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_rfq_sent_factories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_rfq_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_rfq_sent_factories_updated_at
  BEFORE UPDATE ON rfq_sent_factories
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_sent_factories_updated_at();

CREATE TRIGGER update_rfq_email_templates_updated_at
  BEFORE UPDATE ON rfq_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_email_templates_updated_at();

-- Вставка дефолтного шаблона для всех пользователей
-- (будет создаваться при первом использовании)
