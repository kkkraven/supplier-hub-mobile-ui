# ИНСТРУКЦИЯ ПО ВЫПОЛНЕНИЮ SQL-СКРИПТА

## Способ 1: Через веб-интерфейс Supabase (Рекомендуется)

### Шаги:

1. **Откройте панель управления Supabase**
   - Перейдите на https://supabase.com/dashboard
   - Войдите в свой аккаунт
   - Выберите ваш проект

2. **Откройте SQL Editor**
   - В левом меню найдите "SQL Editor"
   - Нажмите "New query"

3. **Выполните SQL-запросы по порядку:**

#### Шаг 1: Добавление поля website
```sql
ALTER TABLE factories 
ADD COLUMN IF NOT EXISTS website TEXT;
```

#### Шаг 2: Добавление комментария
```sql
COMMENT ON COLUMN factories.website IS 'Веб-сайт фабрики (опционально)';
```

#### Шаг 3: Обновление данных
```sql
UPDATE factories 
SET website = CASE 
    WHEN legal_name_en ILIKE '%Golden Thread%' THEN 'https://www.goldenthread.com'
    WHEN legal_name_en ILIKE '%Sunrise%' THEN 'https://www.sunrisetextile.com'
    WHEN legal_name_en ILIKE '%Imperial%' THEN 'https://www.imperialweaving.com'
    WHEN legal_name_en ILIKE '%Oriental%' THEN 'https://www.orientalsilk.com'
    WHEN legal_name_en ILIKE '%South China%' THEN 'https://www.southchina.com'
    ELSE NULL
END
WHERE website IS NULL;
```

#### Шаг 4: Проверка результата
```sql
SELECT 
    legal_name_en,
    wechat_id,
    phone,
    email,
    website,
    address_cn
FROM factories 
LIMIT 5;
```

## Способ 2: Через Supabase CLI

### Предварительные требования:
1. Установите Supabase CLI
2. Настройте переменные окружения

### Выполнение:
```bash
# Инициализация проекта
npx supabase init

# Выполнение SQL-скрипта
npx supabase db push --db-url postgresql://postgres:[password]@[host]:5432/postgres
```

## Способ 3: Через psql (если установлен)

### Выполнение:
```bash
psql -h [your-supabase-host] -U postgres -d postgres -f add_website_field.sql
```

## Проверка результата

После выполнения SQL-скрипта проверьте:

1. **Структура таблицы:**
   - Откройте "Table Editor" в Supabase
   - Найдите таблицу "factories"
   - Убедитесь, что появилось поле "website"

2. **Данные:**
   - Выполните запрос для проверки данных
   - Убедитесь, что веб-сайты добавлены для соответствующих фабрик

## Возможные проблемы и решения

### Проблема: "Permission denied"
**Решение:** Убедитесь, что используете правильные ключи доступа (service_role_key)

### Проблема: "Table does not exist"
**Решение:** Проверьте, что таблица "factories" существует в вашей базе данных

### Проблема: "Column already exists"
**Решение:** Это нормально, запрос использует "IF NOT EXISTS"

## Ожидаемый результат

После успешного выполнения:

✅ Поле `website` добавлено в таблицу `factories`
✅ Комментарий добавлен к полю
✅ Примеры веб-сайтов добавлены для существующих фабрик
✅ Поле является опциональным (NULL для фабрик без сайтов)

## Следующие шаги

1. **Проверьте отображение** на следующих страницах:
   - Главная страница: http://localhost:3000
   - Каталог фабрик: http://localhost:3000/catalog
   - Детальная страница фабрики: http://localhost:3000/factories/[id]

2. **Добавьте данные** о веб-сайтах для других фабрик через панель управления Supabase

---
**Статус:** Готово к выполнению
