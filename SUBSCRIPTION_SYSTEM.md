# 🔐 Система подписок Supplier Hub

## 📋 Обзор

Полнофункциональная система подписок с тарифными планами, лимитами использования и интеграцией с Stripe.

## 🗄️ Структура базы данных

### 1. **subscription_plans** - Тарифные планы
```sql
- id (UUID) - уникальный идентификатор
- name (TEXT) - системное имя ('starter', 'professional', 'enterprise')
- display_name (TEXT) - отображаемое имя
- description (TEXT) - описание плана
- price_monthly (INTEGER) - цена в месяц (в копейках)
- price_annual (INTEGER) - цена в год (в копейках)
- factory_limit (INTEGER) - лимит фабрик
- rfq_limit (INTEGER) - лимит RFQ (NULL = безлимит)
- features (JSONB) - список функций
- limitations (JSONB) - ограничения
- is_popular (BOOLEAN) - популярный план
- is_active (BOOLEAN) - план активен
```

### 2. **subscriptions** - Подписки пользователей
```sql
- id (UUID) - уникальный идентификатор
- user_id (UUID) - ссылка на пользователя
- plan_id (UUID) - ссылка на тарифный план
- stripe_subscription_id (TEXT) - ID подписки в Stripe
- status (TEXT) - статус подписки
- current_period_start/end - период действия
- cancel_at_period_end - отмена в конце периода
```

### 3. **user_limits** - Лимиты использования
```sql
- user_id (UUID) - ссылка на пользователя
- factories_accessed (INTEGER) - количество использованных фабрик
- factories_accessed_list (JSONB) - список ID фабрик
- rfq_count_current_month (INTEGER) - RFQ за месяц
- rfq_count_total (INTEGER) - общее количество RFQ
```

### 4. **subscription_history** - История изменений
```sql
- user_id (UUID) - пользователь
- action (TEXT) - действие (created, activated, canceled, etc.)
- old_status/new_status - старый/новый статус
- metadata (JSONB) - дополнительные данные
```

## 🎯 Тарифные планы

### Starter - 300₽/мес
- ✅ Доступ к 20 фабрикам
- ✅ До 5 RFQ запросов в месяц
- ✅ Базовая техподдержка
- ❌ Ограниченный доступ к премиум фабрикам

### Professional - 800₽/мес (Популярный)
- ✅ Доступ ко всем 70+ фабрикам
- ✅ Неограниченные RFQ запросы
- ✅ Приоритетная техподдержка
- ✅ Персональный менеджер

### Enterprise - 2000₽/мес
- ✅ Все функции Professional
- ✅ 24/7 техподдержка
- ✅ Интеграция с CRM/ERP
- ✅ Эскроу сервис

## 🔧 Основные функции

### 1. **Проверка активной подписки**
```sql
SELECT has_active_subscription('user-id');
```

### 2. **Получение лимитов пользователя**
```sql
SELECT * FROM get_user_limits_with_plan('user-id');
```

### 3. **Увеличение счетчика фабрик**
```sql
SELECT increment_factory_access('user-id', 'factory-id');
```

### 4. **Увеличение счетчика RFQ**
```sql
SELECT increment_rfq_count('user-id');
```

### 5. **Проверка доступа к фабрике**
```sql
SELECT can_access_factory('user-id', 'factory-id');
```

### 6. **Сброс месячных лимитов**
```sql
SELECT reset_monthly_limits();
```

## 📊 Представления (Views)

### 1. **active_subscriptions** - Активные подписки
Объединяет данные подписок, планов и пользователей с вычисляемыми полями.

### 2. **subscription_stats** - Статистика планов
Аналитика по тарифным планам, доходам и использованию.

### 3. **users_with_limits** - Пользователи с лимитами
Полная информация о пользователях, их подписках и лимитах.

## 🔒 Безопасность (RLS)

### Политики доступа:
- **subscription_plans**: публичное чтение активных планов
- **subscriptions**: пользователи видят только свои подписки
- **user_limits**: пользователи видят только свои лимиты
- **subscription_history**: пользователи видят только свою историю

## 🚀 Установка

### 1. Применить миграции
```bash
# В SQL Editor Supabase выполните:
\i 'supabase/migrations/006_subscription_system.sql'
\i 'supabase/migrations/007_subscription_views.sql'

# Или используйте объединенный скрипт:
\i 'scripts/apply_subscription_migrations.sql'
```

### 2. Проверить установку
```sql
-- Проверить таблицы
SELECT tablename FROM pg_tables 
WHERE tablename LIKE 'subscription%' OR tablename = 'user_limits';

-- Проверить тарифные планы
SELECT name, display_name, price_monthly/100 as price_rub 
FROM subscription_plans;

-- Проверить функции
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%subscription%' OR routine_name LIKE '%limit%';
```

## 📈 Использование

### Создание подписки пользователю
```sql
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
VALUES (
  'user-uuid',
  (SELECT id FROM subscription_plans WHERE name = 'professional'),
  'active',
  NOW(),
  NOW() + INTERVAL '1 month'
);
```

### Проверка лимитов в коде
```typescript
const { data } = await supabase
  .rpc('get_user_limits_with_plan', { p_user_id: user.id });

if (data.subscription_active && data.factories_remaining > 0) {
  // Пользователь может получить доступ к фабрике
}
```

### Увеличение счетчика использования
```typescript
const { data } = await supabase
  .rpc('increment_factory_access', { 
    p_user_id: user.id, 
    p_factory_id: factory.id 
  });

if (data) {
  // Доступ предоставлен, показать контакты фабрики
}
```

## 🔄 Автоматизация

### Ежемесячный сброс лимитов
Добавьте в cron задачу:
```sql
SELECT reset_monthly_limits();
```

### Триггеры
- Автоматическое создание лимитов для новых пользователей
- Логирование изменений подписок
- Обновление updated_at полей

## 🧪 Тестирование

### Создание тестовой подписки
```sql
-- Создать тестового пользователя
INSERT INTO users (email, full_name, role) 
VALUES ('test@example.com', 'Test User', 'user');

-- Активировать подписку Professional
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT 
  (SELECT id FROM users WHERE email = 'test@example.com'),
  (SELECT id FROM subscription_plans WHERE name = 'professional'),
  'active',
  NOW(),
  NOW() + INTERVAL '1 month';
```

### Тестирование лимитов
```sql
-- Проверить лимиты
SELECT * FROM users_with_limits WHERE email = 'test@example.com';

-- Использовать фабрику
SELECT increment_factory_access(
  (SELECT id FROM users WHERE email = 'test@example.com'),
  gen_random_uuid()
);

-- Создать RFQ
SELECT increment_rfq_count(
  (SELECT id FROM users WHERE email = 'test@example.com')
);
```

## 📝 Следующие шаги

1. **Интеграция с Stripe** - создание вебхуков для автоматического управления подписками
2. **TypeScript типы** - создание типов для фронтенда
3. **React хуки** - useSubscription, useUserLimits
4. **Страница /account** - управление подпиской
5. **PaywallGuard** - компонент защиты контента

## 🐛 Отладка

### Логи изменений подписок
```sql
SELECT * FROM subscription_history 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;
```

### Статистика использования
```sql
SELECT * FROM subscription_stats;
```

### Активные подписки
```sql
SELECT user_email, plan_display_name, days_remaining, factory_usage_percent 
FROM active_subscriptions 
WHERE is_active = true;
```

---

✅ **Система подписок готова к использованию!**
