# Настройка переменных окружения для Cloudflare Pages

## Необходимые переменные окружения

Для работы приложения на Cloudflare Pages нужно настроить следующие переменные окружения:

### 1. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app-name.pages.dev
```

## Как настроить переменные в Cloudflare Dashboard

### Шаг 1: Откройте Cloudflare Dashboard
1. Перейдите на [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Войдите в свой аккаунт

### Шаг 2: Найдите ваш проект Pages
1. В боковом меню выберите "Pages"
2. Найдите ваш проект "supplier-hub"
3. Нажмите на название проекта

### Шаг 3: Настройте переменные окружения
1. Перейдите на вкладку "Settings"
2. В левом меню выберите "Environment variables"
3. Нажмите "Add variable" для каждой переменной

### Шаг 4: Добавьте переменные
Добавьте следующие переменные:

#### Для Production:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co`
- **Environment**: Production

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `your_anon_key_here`
- **Environment**: Production

- **Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://your-app-name.pages.dev`
- **Environment**: Production

#### Для Preview (опционально):
Добавьте те же переменные для Preview среды, но с тестовыми значениями.

## Получение значений Supabase

### 1. Откройте Supabase Dashboard
1. Перейдите на [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект

### 2. Получите URL и ключи
1. Перейдите в Settings → API
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Проверка настроек

После настройки переменных:
1. Сделайте новый коммит в репозиторий
2. Cloudflare автоматически пересоберет и задеплоит приложение
3. Проверьте, что приложение работает корректно

## Устранение проблем

### Проблема: "Supabase client not initialized"
- Убедитесь, что переменные `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` настроены правильно

### Проблема: "CORS error"
- Проверьте настройки CORS в Supabase Dashboard
- Убедитесь, что домен Cloudflare Pages добавлен в список разрешенных доменов

### Проблема: "Authentication failed"
- Проверьте правильность `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Убедитесь, что RLS политики настроены правильно
