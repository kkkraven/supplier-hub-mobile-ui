-- ============================================================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- ============================================================================
-- Создание полной системы подписок для Supplier Hub
-- Включает: тарифные планы, подписки пользователей, лимиты использования
-- ============================================================================

-- ============================================================================
-- 1. СОЗДАНИЕ ТАБЛИЦЫ ТАРИФНЫХ ПЛАНОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'starter', 'professional', 'enterprise'
  display_name TEXT NOT NULL, -- 'Starter', 'Professional', 'Enterprise'
  description TEXT,
  price_monthly INTEGER NOT NULL, -- цена в центах (руб)
  price_annual INTEGER NOT NULL, -- цена в центах (руб) 
  factory_limit INTEGER NOT NULL, -- количество доступных фабрик
  rfq_limit INTEGER, -- лимит RFQ в месяц (NULL = безлимит)
  features JSONB NOT NULL DEFAULT '[]', -- список функций плана
  limitations JSONB NOT NULL DEFAULT '[]', -- ограничения плана
  is_popular BOOLEAN DEFAULT false, -- популярный план
  is_active BOOLEAN DEFAULT true, -- план активен
  sort_order INTEGER DEFAULT 0, -- порядок отображения
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- ============================================================================
-- 2. СОЗДАНИЕ ТАБЛИЦЫ ПОДПИСОК ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  stripe_subscription_id TEXT UNIQUE, -- ID подписки в Stripe
  stripe_customer_id TEXT, -- ID клиента в Stripe
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (
    status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing', 'incomplete')
  ),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальная активная подписка на пользователя
  UNIQUE(user_id) WHERE status = 'active'
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================================================
-- 3. СОЗДАНИЕ ТАБЛИЦЫ ЛИМИТОВ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Лимиты по фабрикам
  factories_accessed INTEGER DEFAULT 0, -- сколько фабрик уже разблокировано
  factories_accessed_list JSONB DEFAULT '[]', -- список ID разблокированных фабрик
  
  -- Лимиты по RFQ
  rfq_count_current_month INTEGER DEFAULT 0, -- RFQ за текущий месяц
  rfq_count_total INTEGER DEFAULT 0, -- общее количество RFQ
  last_rfq_reset DATE DEFAULT CURRENT_DATE, -- последний сброс счетчика RFQ
  
  -- Дополнительные лимиты
  storage_used_mb INTEGER DEFAULT 0, -- использованное место (MB)
  api_calls_current_month INTEGER DEFAULT 0, -- API вызовы за месяц
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальные лимиты на пользователя
  UNIQUE(user_id)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_limits_subscription_id ON user_limits(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_limits_reset_date ON user_limits(last_rfq_reset);

-- ============================================================================
-- 4. СОЗДАНИЕ ТАБЛИЦЫ ИСТОРИИ ПОДПИСОК
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (
    action IN ('created', 'activated', 'canceled', 'upgraded', 'downgraded', 'renewed', 'expired')
  ),
  old_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}', -- дополнительные данные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для истории
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON subscription_history(action);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);

-- ============================================================================
-- 5. СОЗДАНИЕ ФУНКЦИЙ И ТРИГГЕРОВ
-- ============================================================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_limits_updated_at 
  BEFORE UPDATE ON user_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ФУНКЦИЯ СОЗДАНИЯ ЛИМИТОВ ДЛЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
-- ============================================================================

CREATE OR REPLACE FUNCTION create_user_limits_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического создания лимитов
CREATE TRIGGER create_user_limits_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_limits_on_user_creation();

-- ============================================================================
-- 7. ФУНКЦИЯ СБРОСА МЕСЯЧНЫХ ЛИМИТОВ
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
  UPDATE user_limits 
  SET 
    rfq_count_current_month = 0,
    api_calls_current_month = 0,
    last_rfq_reset = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_rfq_reset < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. ФУНКЦИЯ ЛОГИРОВАНИЯ ИЗМЕНЕНИЙ ПОДПИСКИ
-- ============================================================================

CREATE OR REPLACE FUNCTION log_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Логируем изменения статуса подписки
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO subscription_history (
      user_id,
      subscription_id,
      plan_id,
      action,
      old_status,
      new_status,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.plan_id,
      CASE 
        WHEN NEW.status = 'active' THEN 'activated'
        WHEN NEW.status = 'canceled' THEN 'canceled'
        WHEN NEW.status = 'past_due' THEN 'expired'
        ELSE 'updated'
      END,
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'stripe_subscription_id', NEW.stripe_subscription_id,
        'period_end', NEW.current_period_end
      )
    );
  END IF;
  
  -- Логируем создание новой подписки
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_history (
      user_id,
      subscription_id,
      plan_id,
      action,
      new_status,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.plan_id,
      'created',
      NEW.status,
      jsonb_build_object(
        'stripe_subscription_id', NEW.stripe_subscription_id,
        'period_end', NEW.current_period_end
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для логирования изменений подписки
CREATE TRIGGER log_subscription_changes_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_changes();

-- ============================================================================
-- 9. ФУНКЦИЯ ПРОВЕРКИ АКТИВНОЙ ПОДПИСКИ
-- ============================================================================

CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_active BOOLEAN := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE user_id = p_user_id 
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ) INTO subscription_active;
  
  RETURN subscription_active;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. ФУНКЦИЯ ПОЛУЧЕНИЯ ЛИМИТОВ ПОЛЬЗОВАТЕЛЯ
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_limits_with_plan(p_user_id UUID)
RETURNS TABLE(
  factories_limit INTEGER,
  factories_used INTEGER,
  factories_remaining INTEGER,
  rfq_limit INTEGER,
  rfq_used INTEGER,
  rfq_remaining INTEGER,
  plan_name TEXT,
  subscription_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(sp.factory_limit, 0) as factories_limit,
    COALESCE(ul.factories_accessed, 0) as factories_used,
    GREATEST(0, COALESCE(sp.factory_limit, 0) - COALESCE(ul.factories_accessed, 0)) as factories_remaining,
    sp.rfq_limit,
    COALESCE(ul.rfq_count_current_month, 0) as rfq_used,
    CASE 
      WHEN sp.rfq_limit IS NULL THEN NULL -- безлимит
      ELSE GREATEST(0, sp.rfq_limit - COALESCE(ul.rfq_count_current_month, 0))
    END as rfq_remaining,
    sp.display_name as plan_name,
    (s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > NOW())) as subscription_active
  FROM user_limits ul
  LEFT JOIN subscriptions s ON s.user_id = ul.user_id AND s.status = 'active'
  LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE ul.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Включение RLS для всех таблиц
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Политики для subscription_plans (публичное чтение)
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Политики для subscriptions (пользователи видят только свои подписки)
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- Политики для user_limits (пользователи видят только свои лимиты)
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own limits" ON user_limits
  FOR UPDATE USING (user_id = auth.uid());

-- Политики для subscription_history (пользователи видят только свою историю)
CREATE POLICY "Users can view own subscription history" ON subscription_history
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 12. ВСТАВКА БАЗОВЫХ ТАРИФНЫХ ПЛАНОВ
-- ============================================================================

INSERT INTO subscription_plans (
  name, 
  display_name, 
  description,
  price_monthly, 
  price_annual, 
  factory_limit, 
  rfq_limit, 
  features,
  limitations,
  is_popular,
  sort_order
) VALUES 
(
  'starter',
  'Starter',
  'Для стартапов и небольших брендов',
  30000, -- 300 руб
  300000, -- 3000 руб (скидка 17%)
  20,
  5,
  '["Доступ к 20 фабрикам", "До 5 RFQ запросов в месяц", "Базовая техподдержка", "Стандартные фильтры поиска", "Email уведомления", "Основная аналитика"]',
  '["Ограниченный доступ к премиум фабрикам", "Базовая проверка фабрик", "Стандартная скорость ответа"]',
  false,
  1
),
(
  'professional',
  'Professional', 
  'Для растущих компаний',
  80000, -- 800 руб
  800000, -- 8000 руб (скидка 17%)
  70,
  NULL, -- безлимит
  '["Доступ ко всем 70+ фабрикам", "Неограниченные RFQ запросы", "Приоритетная техподдержка", "Расширенные фильтры и поиск", "Push уведомления", "Детальная аналитика", "Персональный менеджер", "Проверка образцов", "Поддержка договоров"]',
  '[]',
  true,
  2
),
(
  'enterprise',
  'Enterprise',
  'Для крупных компаний', 
  200000, -- 2000 руб
  2000000, -- 20000 руб (скидка 17%)
  70,
  NULL, -- безлимит
  '["Все функции Professional", "Приоритетный доступ к новым фабрикам", "Кастомизированные RFQ шаблоны", "Белый лейбл решение", "24/7 техподдержка", "Интеграция с CRM/ERP", "Команда экспертов", "Визиты на производство", "Юридическая поддержка", "Эскроу сервис"]',
  '[]',
  false,
  3
) ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- ЗАВЕРШЕНИЕ МИГРАЦИИ
-- ============================================================================

-- Создание лимитов для существующих пользователей
INSERT INTO user_limits (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_limits)
ON CONFLICT (user_id) DO NOTHING;

-- Комментарий о завершении
COMMENT ON TABLE subscription_plans IS 'Тарифные планы подписок';
COMMENT ON TABLE subscriptions IS 'Подписки пользователей';
COMMENT ON TABLE user_limits IS 'Лимиты использования по пользователям';
COMMENT ON TABLE subscription_history IS 'История изменений подписок';

-- Логирование успешного завершения
DO $$
BEGIN
  RAISE NOTICE 'Subscription system migration completed successfully!';
  RAISE NOTICE 'Created tables: subscription_plans, subscriptions, user_limits, subscription_history';
  RAISE NOTICE 'Created functions: reset_monthly_limits, has_active_subscription, get_user_limits_with_plan';
  RAISE NOTICE 'Inserted % subscription plans', (SELECT COUNT(*) FROM subscription_plans);
END $$;
