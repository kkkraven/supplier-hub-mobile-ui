# 🚀 ФИНАЛЬНАЯ ИНСТРУКЦИЯ ПО ВЫПОЛНЕНИЮ SQL-СКРИПТА

## ✅ Подготовка завершена

Файл `.env.local` исправлен и содержит:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - нужно добавить

## 🔑 Шаг 1: Получите Service Role Key

1. **Откройте панель Supabase:**
   - https://supabase.com/dashboard
   - Войдите в свой аккаунт
   - Выберите проект: `lhdjfkxrislqiivafsew`

2. **Получите Service Role Key:**
   - В левом меню найдите "Settings"
   - Выберите "API"
   - Найдите секцию "Project API keys"
   - Скопируйте "service_role" key (начинается с `eyJ...`)

3. **Обновите файл .env.local:**
   - Откройте файл `web/.env.local`
   - Замените `your_service_role_key_here` на ваш реальный ключ

## 🗄️ Шаг 2: Выполните SQL-скрипт

### Вариант A: Через веб-интерфейс (Рекомендуется)

1. **Откройте SQL Editor в Supabase:**
   - В панели Supabase найдите "SQL Editor"
   - Нажмите "New query"

2. **Выполните запросы по порядку:**

```sql
-- 1. Добавление поля website
ALTER TABLE factories 
ADD COLUMN IF NOT EXISTS website TEXT;

-- 2. Добавление комментария
COMMENT ON COLUMN factories.website IS 'Веб-сайт фабрики (опционально)';

-- 3. Обновление данных
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

-- 4. Проверка результата
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

### Вариант B: Через Node.js скрипт

После добавления service_role_key в .env.local:

```bash
cd "c:\prog\Supplier Hub Mobile-First UI Kit\web"
node execute_sql.js
```

## 🔍 Шаг 3: Проверка результата

1. **В панели Supabase:**
   - Откройте "Table Editor"
   - Найдите таблицу "factories"
   - Убедитесь, что появилось поле "website"

2. **В приложении:**
   - Запустите приложение: `npm run dev`
   - Откройте: http://localhost:3000
   - Проверьте карточки фабрик - должны появиться веб-сайты

## 📋 Ожидаемый результат

После успешного выполнения:

✅ **База данных:**
- Поле `website` добавлено в таблицу `factories`
- Комментарий добавлен к полю
- Примеры веб-сайтов добавлены для существующих фабрик

✅ **Интерфейс:**
- WeChat ID отображается в карточках фабрик
- Телефон добавлен для контактов
- Email показывается для фабрик, где есть
- Website отображается для фабрик с сайтами
- Адрес показывается полностью

## 🆘 Если возникли проблемы

### Проблема: "Permission denied"
**Решение:** Убедитесь, что используете service_role_key, а не anon_key

### Проблема: "Table does not exist"
**Решение:** Проверьте, что таблица "factories" существует в вашей базе данных

### Проблема: "Column already exists"
**Решение:** Это нормально, запрос использует "IF NOT EXISTS"

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте логи в консоли браузера
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к Supabase

---
**Статус:** Готово к выполнению! 🎉
