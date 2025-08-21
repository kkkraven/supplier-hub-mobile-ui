# Настройка Supabase для Supplier Hub

## Шаг 1: Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в свой аккаунт или создайте новый
3. Нажмите "New Project"
4. Выберите организацию
5. Введите название проекта: `supplier-hub`
6. Выберите регион (рекомендуется ближайший к вашим пользователям)
7. Введите пароль для базы данных
8. Нажмите "Create new project"

## Шаг 2: Получение ключей API

1. В панели управления Supabase перейдите в Settings → API
2. Скопируйте:
   - **Project URL** (например: `https://your-project.supabase.co`)
   - **anon public** ключ
   - **service_role** ключ (для админских операций)

## Шаг 3: Настройка переменных окружения

Создайте файл `.env.local` в корне проекта `web/`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Шаг 4: Создание базы данных

### Вариант A: Через SQL Editor (рекомендуется)

1. В панели Supabase перейдите в SQL Editor
2. Создайте новый запрос
3. Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`
4. Выполните запрос

### Вариант B: Через Supabase CLI

1. Установите Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Войдите в Supabase:
   ```bash
   supabase login
   ```

3. Инициализируйте проект:
   ```bash
   supabase init
   ```

4. Свяжите с удаленным проектом:
   ```bash
   supabase link --project-ref your-project-ref
   ```

5. Примените миграции:
   ```bash
   supabase db push
   ```

## Шаг 5: Настройка аутентификации

1. В панели Supabase перейдите в Authentication → Settings
2. Настройте:
   - **Site URL**: `http://localhost:3000` (для разработки)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
3. Включите Email auth
4. Опционально: настройте OAuth провайдеры (Google, GitHub)

## Шаг 6: Настройка Storage (для загрузки изображений)

1. В панели Supabase перейдите в Storage
2. Создайте bucket `avatars` для аватаров пользователей
3. Создайте bucket `factory-images` для изображений фабрик
4. Настройте политики доступа для каждого bucket

### Политики для bucket `avatars`:
```sql
-- Пользователи могут загружать свои аватары
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Пользователи могут просматривать аватары
CREATE POLICY "Users can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Пользователи могут обновлять свои аватары
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Политики для bucket `factory-images`:
```sql
-- Админы могут загружать изображения фабрик
CREATE POLICY "Admins can upload factory images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'factory-images' AND 
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Все могут просматривать изображения фабрик
CREATE POLICY "Everyone can view factory images" ON storage.objects
  FOR SELECT USING (bucket_id = 'factory-images');
```

## Шаг 7: Тестирование

1. Запустите проект:
   ```bash
   npm run dev
   ```

2. Откройте `http://localhost:3000`
3. Попробуйте зарегистрироваться и войти в систему
4. Проверьте, что данные сохраняются в базе

## Шаг 8: Настройка для продакшена

1. Обновите переменные окружения для продакшена
2. Настройте домен в Supabase Authentication
3. Настройте SSL сертификаты
4. Настройте мониторинг и логирование

## Полезные команды

### Просмотр данных в базе:
```sql
-- Пользователи
SELECT * FROM users;

-- Фабрики
SELECT * FROM factories;

-- Категории
SELECT * FROM categories;

-- RFQ
SELECT * FROM rfqs;
```

### Очистка тестовых данных:
```sql
DELETE FROM messages;
DELETE FROM rfqs;
DELETE FROM factories;
DELETE FROM users WHERE role != 'admin';
```

## Troubleshooting

### Ошибка "Invalid API key"
- Проверьте правильность ключей в `.env.local`
- Убедитесь, что файл `.env.local` находится в папке `web/`

### Ошибка "Row Level Security policy violation"
- Проверьте политики RLS в базе данных
- Убедитесь, что пользователь аутентифицирован

### Ошибка "Email not confirmed"
- В режиме разработки отключите подтверждение email в настройках аутентификации
- Или проверьте настройки SMTP для отправки email

### Проблемы с загрузкой изображений
- Проверьте политики Storage
- Убедитесь, что bucket создан и настроен правильно
