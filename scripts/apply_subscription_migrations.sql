-- ============================================================================
-- БЫСТРОЕ ПРИМЕНЕНИЕ МИГРАЦИЙ СИСТЕМЫ ПОДПИСОК
-- ============================================================================
-- Этот файл объединяет все миграции для системы подписок
-- Выполните его в SQL Editor вашего проекта Supabase
-- ============================================================================

\echo 'Начинаем применение миграций системы подписок...'

-- Применяем основную миграцию системы подписок
\i '../supabase/migrations/006_subscription_system.sql'

\echo 'Основная миграция системы подписок применена.'

-- Применяем миграцию представлений и дополнительных функций
\i '../supabase/migrations/007_subscription_views.sql'

\echo 'Миграция представлений и функций применена.'

-- Проверяем результат
\echo 'Проверяем созданные таблицы:'

SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('subscription_plans', 'subscriptions', 'user_limits', 'subscription_history')
ORDER BY tablename;

\echo 'Проверяем созданные представления:'

SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views 
WHERE viewname IN ('active_subscriptions', 'subscription_stats', 'users_with_limits')
ORDER BY viewname;

\echo 'Проверяем тарифные планы:'

SELECT 
  name,
  display_name,
  price_monthly / 100 as price_monthly_rub,
  factory_limit,
  rfq_limit,
  is_popular,
  is_active
FROM subscription_plans 
ORDER BY sort_order;

\echo 'Проверяем функции:'

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN (
  'has_active_subscription',
  'get_user_limits_with_plan', 
  'reset_monthly_limits',
  'increment_factory_access',
  'increment_rfq_count',
  'can_access_factory',
  'get_upgrade_options'
)
ORDER BY routine_name;

\echo 'Миграции системы подписок успешно применены!'
\echo 'Теперь вы можете:'
\echo '1. Создавать подписки для пользователей'
\echo '2. Проверять лимиты доступа'
\echo '3. Управлять тарифными планами'
\echo '4. Отслеживать использование ресурсов'
