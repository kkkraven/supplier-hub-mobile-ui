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

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_rfq_attachments_rfq_id ON rfq_attachments(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_attachments_created_at ON rfq_attachments(created_at);

-- Включение RLS
ALTER TABLE rfq_attachments ENABLE ROW LEVEL SECURITY;

-- Политики RLS для rfq_attachments
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

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_rfq_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_rfq_attachments_updated_at
  BEFORE UPDATE ON rfq_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_attachments_updated_at();
