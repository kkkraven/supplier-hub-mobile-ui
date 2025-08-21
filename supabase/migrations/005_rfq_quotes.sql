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

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_rfq_id ON rfq_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_factory_id ON rfq_quotes(factory_id);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_status ON rfq_quotes(status);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_price ON rfq_quotes(price);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_created_at ON rfq_quotes(created_at);

-- Включение RLS
ALTER TABLE rfq_quotes ENABLE ROW LEVEL SECURITY;

-- Политики RLS для rfq_quotes
CREATE POLICY "Users can view quotes for their own RFQs" ON rfq_quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_quotes.rfq_id
      AND rfqs.user_id = auth.uid()
    )
  );

CREATE POLICY "Factories can insert quotes for RFQs sent to them" ON rfq_quotes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rfq_sent_factories
      WHERE rfq_sent_factories.rfq_id = rfq_quotes.rfq_id
      AND rfq_sent_factories.factory_id = rfq_quotes.factory_id
      AND rfq_sent_factories.status IN ('sent', 'delivered', 'read')
    )
  );

CREATE POLICY "Factories can update their own quotes" ON rfq_quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM factories
      WHERE factories.id = rfq_quotes.factory_id
      AND factories.email = auth.jwt() ->> 'email'
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

CREATE POLICY "Factories can delete their own quotes" ON rfq_quotes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM factories
      WHERE factories.id = rfq_quotes.factory_id
      AND factories.email = auth.jwt() ->> 'email'
    )
  );

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_rfq_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_rfq_quotes_updated_at
  BEFORE UPDATE ON rfq_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_quotes_updated_at();

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
CREATE TRIGGER update_rfq_status_on_quote_trigger
  AFTER INSERT ON rfq_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_status_on_quote();


