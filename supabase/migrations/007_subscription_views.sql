-- ============================================================================
-- SUBSCRIPTION SYSTEM VIEWS AND ADVANCED FEATURES
-- ============================================================================
-- Создание представлений и дополнительных функций для системы подписок
-- ============================================================================

-- ============================================================================
-- 1. ПРЕДСТАВЛЕНИЕ АКТИВНЫХ ПОДПИСОК С ПЛАНАМИ
-- ============================================================================

CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.id,
  s.user_id,
  s.plan_id,
  s.stripe_subscription_id,
  s.status,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.created_at,
  s.updated_at,
  
  -- Данные плана
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  sp.description as plan_description,
  sp.price_monthly,
  sp.price_annual,
  sp.factory_limit,
  sp.rfq_limit,
  sp.features,
  sp.limitations,
  sp.is_popular,
  
  -- Данные пользователя
  u.email as user_email,
  u.full_name as user_name,
  u.company_name,
  
  -- Вычисляемые поля
  (s.current_period_end IS NULL OR s.current_period_end > NOW()) as is_active,
  EXTRACT(days FROM (s.current_period_end - NOW())) as days_remaining,
  
  -- Статистика использования
  ul.factories_accessed,
  ul.rfq_count_current_month,
  ul.rfq_count_total,
  
  -- Процент использования лимитов
  CASE 
    WHEN sp.factory_limit > 0 THEN 
      ROUND((ul.factories_accessed::DECIMAL / sp.factory_limit * 100), 2)
    ELSE 0 
  END as factory_usage_percent,
  
  CASE 
    WHEN sp.rfq_limit IS NOT NULL AND sp.rfq_limit > 0 THEN 
      ROUND((ul.rfq_count_current_month::DECIMAL / sp.rfq_limit * 100), 2)
    ELSE NULL 
  END as rfq_usage_percent

FROM subscriptions s
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
LEFT JOIN users u ON u.id = s.user_id
LEFT JOIN user_limits ul ON ul.user_id = s.user_id
WHERE s.status = 'active';

-- ============================================================================
-- 2. ПРЕДСТАВЛЕНИЕ СТАТИСТИКИ ПОДПИСОК
-- ============================================================================

CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
  sp.name as plan_name,
  sp.display_name,
  sp.price_monthly,
  sp.factory_limit,
  sp.rfq_limit,
  
  -- Количество подписок
  COUNT(s.id) as total_subscriptions,
  COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN s.status = 'canceled' THEN 1 END) as canceled_subscriptions,
  COUNT(CASE WHEN s.status = 'past_due' THEN 1 END) as past_due_subscriptions,
  
  -- Средние показатели использования
  ROUND(AVG(ul.factories_accessed), 2) as avg_factories_used,
  ROUND(AVG(ul.rfq_count_current_month), 2) as avg_rfq_used,
  
  -- Процент пользователей, превышающих лимиты
  ROUND(
    COUNT(CASE WHEN ul.factories_accessed >= sp.factory_limit THEN 1 END)::DECIMAL 
    / NULLIF(COUNT(s.id), 0) * 100, 2
  ) as factory_limit_exceeded_percent,
  
  ROUND(
    COUNT(CASE WHEN sp.rfq_limit IS NOT NULL AND ul.rfq_count_current_month >= sp.rfq_limit THEN 1 END)::DECIMAL 
    / NULLIF(COUNT(s.id), 0) * 100, 2
  ) as rfq_limit_exceeded_percent,
  
  -- Доходы (в рублях)
  SUM(CASE WHEN s.status = 'active' THEN sp.price_monthly ELSE 0 END) / 100 as monthly_revenue_rub,
  SUM(CASE WHEN s.status = 'active' THEN sp.price_annual ELSE 0 END) / 100 as annual_revenue_potential_rub

FROM subscription_plans sp
LEFT JOIN subscriptions s ON s.plan_id = sp.id
LEFT JOIN user_limits ul ON ul.user_id = s.user_id
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.display_name, sp.price_monthly, sp.factory_limit, sp.rfq_limit
ORDER BY sp.sort_order;

-- ============================================================================
-- 3. ПРЕДСТАВЛЕНИЕ ПОЛЬЗОВАТЕЛЕЙ С ЛИМИТАМИ
-- ============================================================================

CREATE OR REPLACE VIEW users_with_limits AS
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.company_name,
  u.role,
  u.created_at as user_created_at,
  
  -- Подписка
  s.id as subscription_id,
  s.status as subscription_status,
  s.current_period_end,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  
  -- Лимиты
  COALESCE(sp.factory_limit, 0) as factory_limit,
  COALESCE(ul.factories_accessed, 0) as factories_used,
  GREATEST(0, COALESCE(sp.factory_limit, 0) - COALESCE(ul.factories_accessed, 0)) as factories_remaining,
  
  sp.rfq_limit,
  COALESCE(ul.rfq_count_current_month, 0) as rfq_used_this_month,
  CASE 
    WHEN sp.rfq_limit IS NULL THEN NULL
    ELSE GREATEST(0, sp.rfq_limit - COALESCE(ul.rfq_count_current_month, 0))
  END as rfq_remaining_this_month,
  
  COALESCE(ul.rfq_count_total, 0) as rfq_used_total,
  
  -- Статус доступа
  (s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > NOW())) as has_active_subscription,
  (COALESCE(ul.factories_accessed, 0) < COALESCE(sp.factory_limit, 0)) as can_access_more_factories,
  (sp.rfq_limit IS NULL OR COALESCE(ul.rfq_count_current_month, 0) < sp.rfq_limit) as can_create_more_rfq

FROM users u
LEFT JOIN user_limits ul ON ul.user_id = u.id
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id;

-- ============================================================================
-- 4. ФУНКЦИЯ ОБНОВЛЕНИЯ ЛИМИТОВ ФАБРИК
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_factory_access(p_user_id UUID, p_factory_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_limit INTEGER;
  current_used INTEGER;
  factory_list JSONB;
  can_access BOOLEAN := false;
BEGIN
  -- Получаем текущие лимиты пользователя
  SELECT 
    COALESCE(sp.factory_limit, 0),
    COALESCE(ul.factories_accessed, 0),
    COALESCE(ul.factories_accessed_list, '[]'::jsonb)
  INTO current_limit, current_used, factory_list
  FROM user_limits ul
  LEFT JOIN subscriptions s ON s.user_id = ul.user_id AND s.status = 'active'
  LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE ul.user_id = p_user_id;
  
  -- Проверяем, может ли пользователь получить доступ к еще одной фабрике
  IF current_used < current_limit AND NOT factory_list ? p_factory_id::text THEN
    -- Обновляем лимиты
    UPDATE user_limits 
    SET 
      factories_accessed = factories_accessed + 1,
      factories_accessed_list = factories_accessed_list || jsonb_build_array(p_factory_id::text),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    can_access := true;
  END IF;
  
  RETURN can_access;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. ФУНКЦИЯ ОБНОВЛЕНИЯ ЛИМИТОВ RFQ
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_rfq_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_limit INTEGER;
  current_used INTEGER;
  can_create BOOLEAN := false;
BEGIN
  -- Получаем текущие лимиты RFQ
  SELECT 
    sp.rfq_limit,
    COALESCE(ul.rfq_count_current_month, 0)
  INTO current_limit, current_used
  FROM user_limits ul
  LEFT JOIN subscriptions s ON s.user_id = ul.user_id AND s.status = 'active'
  LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE ul.user_id = p_user_id;
  
  -- Проверяем лимиты (NULL означает безлимит)
  IF current_limit IS NULL OR current_used < current_limit THEN
    -- Обновляем счетчики
    UPDATE user_limits 
    SET 
      rfq_count_current_month = rfq_count_current_month + 1,
      rfq_count_total = rfq_count_total + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    can_create := true;
  END IF;
  
  RETURN can_create;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. ФУНКЦИЯ ПРОВЕРКИ ДОСТУПА К ФАБРИКЕ
-- ============================================================================

CREATE OR REPLACE FUNCTION can_access_factory(p_user_id UUID, p_factory_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN := false;
  factory_list JSONB;
BEGIN
  -- Проверяем, есть ли у пользователя активная подписка и доступ к этой фабрике
  SELECT 
    (s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > NOW())) AND
    (ul.factories_accessed_list ? p_factory_id::text)
  INTO has_access
  FROM user_limits ul
  LEFT JOIN subscriptions s ON s.user_id = ul.user_id AND s.status = 'active'
  WHERE ul.user_id = p_user_id;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ФУНКЦИЯ ПОЛУЧЕНИЯ ДОСТУПНЫХ ПЛАНОВ ДЛЯ АПГРЕЙДА
-- ============================================================================

CREATE OR REPLACE FUNCTION get_upgrade_options(p_user_id UUID)
RETURNS TABLE(
  plan_id UUID,
  plan_name TEXT,
  display_name TEXT,
  price_monthly INTEGER,
  price_annual INTEGER,
  factory_limit INTEGER,
  rfq_limit INTEGER,
  features JSONB,
  is_upgrade BOOLEAN,
  price_difference_monthly INTEGER
) AS $$
DECLARE
  current_plan_price INTEGER;
  current_plan_id UUID;
BEGIN
  -- Получаем текущий план пользователя
  SELECT sp.price_monthly, sp.id
  INTO current_plan_price, current_plan_id
  FROM subscriptions s
  JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = p_user_id AND s.status = 'active';
  
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.display_name,
    sp.price_monthly,
    sp.price_annual,
    sp.factory_limit,
    sp.rfq_limit,
    sp.features,
    (sp.price_monthly > COALESCE(current_plan_price, 0)) as is_upgrade,
    (sp.price_monthly - COALESCE(current_plan_price, 0)) as price_difference_monthly
  FROM subscription_plans sp
  WHERE sp.is_active = true 
    AND sp.id != COALESCE(current_plan_id, '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY sp.sort_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. НАСТРОЙКА ПРАВ ДОСТУПА К ПРЕДСТАВЛЕНИЯМ
-- ============================================================================

-- Права на представления для аутентифицированных пользователей
GRANT SELECT ON active_subscriptions TO authenticated;
GRANT SELECT ON users_with_limits TO authenticated;

-- Ограничиваем доступ к статистике только для админов
CREATE POLICY "Only admins can view subscription stats" ON subscription_stats
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 9. СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ ПРЕДСТАВЛЕНИЙ
-- ============================================================================

-- Композитные индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_period 
  ON subscriptions(user_id, status, current_period_end);

CREATE INDEX IF NOT EXISTS idx_user_limits_factories_list 
  ON user_limits USING GIN(factories_accessed_list);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_action_date 
  ON subscription_history(user_id, action, created_at);

-- ============================================================================
-- ЗАВЕРШЕНИЕ
-- ============================================================================

-- Комментарии к представлениям
COMMENT ON VIEW active_subscriptions IS 'Активные подписки с деталями планов и использованием';
COMMENT ON VIEW subscription_stats IS 'Статистика по тарифным планам и доходам';
COMMENT ON VIEW users_with_limits IS 'Пользователи с информацией о лимитах и подписках';

-- Логирование завершения
DO $$
BEGIN
  RAISE NOTICE 'Subscription views and functions created successfully!';
  RAISE NOTICE 'Created views: active_subscriptions, subscription_stats, users_with_limits';
  RAISE NOTICE 'Created functions: increment_factory_access, increment_rfq_count, can_access_factory, get_upgrade_options';
END $$;
