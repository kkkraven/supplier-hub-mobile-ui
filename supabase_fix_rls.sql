-- Исправление политик RLS для избежания рекурсии

-- Удаляем проблемную политику
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Создаем исправленную политику для админов
-- Используем auth.jwt() для проверки роли без обращения к таблице users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR 
    auth.uid() = id
  );

-- Альтернативный вариант - убираем политику для админов совсем
-- и полагаемся только на то, что пользователи видят свои профили
-- DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Также проверим другие политики на рекурсию
-- Пересоздаем политику для RFQ, если там тоже есть проблемы
DROP POLICY IF EXISTS "Users can view their own RFQs" ON rfqs;
CREATE POLICY "Users can view their own RFQs" ON rfqs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Factory users can view RFQs sent to them" ON rfqs;
CREATE POLICY "Factory users can view RFQs sent to them" ON rfqs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfq_sent_factories 
      WHERE rfq_sent_factories.rfq_id = rfqs.id 
      AND rfq_sent_factories.factory_id IN (
        SELECT id FROM factories WHERE user_id = auth.uid()
      )
    )
  );
