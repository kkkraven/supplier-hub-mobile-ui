# Быстрая настройка Supabase для Supplier Hub

## 🚀 Шаг 1: Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в аккаунт или создайте новый
3. Нажмите "New Project"
4. Заполните форму:
   - **Name:** `supplier-hub`
   - **Database Password:** создайте надежный пароль
   - **Region:** выберите ближайший регион
5. Нажмите "Create new project"

## 🔑 Шаг 2: Получение ключей API

1. В панели управления перейдите в **Settings → API**
2. Скопируйте:
   - **Project URL** (например: `https://your-project-id.supabase.co`)
   - **anon public** ключ
   - **service_role** ключ

## 📝 Шаг 3: Создание .env.local

Создайте файл `web/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Шаг 4: Создание базы данных

В панели Supabase перейдите в **SQL Editor** и выполните миграции по порядку:

### Миграция 1: Основная схема
```sql
-- Скопируйте содержимое файла supabase/migrations/001_initial_schema.sql
```

### Миграция 2: Система отзывов
```sql
-- Скопируйте содержимое файла supabase/migrations/002_reviews_system.sql
```

### Миграция 3: Вложения RFQ
```sql
-- Скопируйте содержимое файла supabase/migrations/003_rfq_attachments.sql
```

### Миграция 4: Отправленные RFQ
```sql
-- Скопируйте содержимое файла supabase/migrations/004_rfq_sent_factories.sql
```

### Миграция 5: Предложения RFQ
```sql
-- Скопируйте содержимое файла supabase/migrations/005_rfq_quotes.sql
```

## 🔐 Шаг 5: Настройка аутентификации

1. Перейдите в **Authentication → Settings**
2. Настройте:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`
3. Включите **Email auth**
4. Для разработки отключите **Confirm email**

## 📦 Шаг 6: Настройка Storage

1. Перейдите в **Storage**
2. Создайте bucket `rfq-attachments` для вложений RFQ
3. Создайте bucket `avatars` для аватаров пользователей
4. Создайте bucket `factory-images` для изображений фабрик

## 🧪 Шаг 7: Тестирование

1. Запустите проект:
   ```bash
   cd web
   npm run dev
   ```

2. Откройте [http://localhost:3000/supabase-test](http://localhost:3000/supabase-test)

3. Нажмите "Проверить подключение"

4. Если все настроено правильно, вы увидите ✅ "Подключение к Supabase успешно!"

## 🔧 Troubleshooting

### Ошибка "Invalid API key"
- Проверьте правильность ключей в `.env.local`
- Убедитесь, что файл `.env.local` находится в папке `web/`

### Ошибка "Row Level Security policy violation"
- Проверьте, что миграции выполнены полностью
- Убедитесь, что пользователь аутентифицирован

### Ошибка "Email not confirmed"
- В режиме разработки отключите подтверждение email в настройках аутентификации

### Проблемы с загрузкой изображений
- Проверьте, что bucket создан в Storage
- Убедитесь, что политики Storage настроены правильно

## ✅ Готово!

После успешного тестирования вы можете:

1. Открыть [http://localhost:3000](http://localhost:3000) - главная страница
2. Перейти на [http://localhost:3000/auth](http://localhost:3000/auth) - регистрация/вход
3. Изучить каталог на [http://localhost:3000/catalog](http://localhost:3000/catalog)

## 📚 Следующие шаги

1. Создайте первого пользователя через регистрацию
2. Добавьте тестовые фабрики через админ панель
3. Протестируйте создание RFQ
4. Настройте email уведомления
