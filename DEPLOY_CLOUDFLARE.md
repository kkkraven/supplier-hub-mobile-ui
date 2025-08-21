# Деплой на Cloudflare Pages

## Подготовка к деплою

### 1. Установка Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Авторизация в Cloudflare
```bash
wrangler login
```

### 3. Настройка переменных окружения
В Cloudflare Dashboard нужно добавить следующие переменные окружения:
- `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - анонимный ключ Supabase
- `NEXT_PUBLIC_APP_URL` - URL вашего приложения

### 4. Создание проекта в Cloudflare Pages
1. Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Выберите "Pages" в боковом меню
3. Нажмите "Create a project"
4. Выберите "Connect to Git"
5. Подключите ваш GitHub репозиторий
6. Настройте следующие параметры:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `web`

### 5. Настройка переменных окружения в Cloudflare
В настройках проекта добавьте:
```
NEXT_PUBLIC_SUPABASE_URL=ваш_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://ваш-домен.pages.dev
```

## Автоматический деплой

После настройки каждый push в main ветку будет автоматически деплоить приложение.

## Ручной деплой

```bash
# Переходим в папку web
cd web

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build

# Деплоим на Cloudflare Pages
npm run deploy
```

## Проблемы и решения

### Проблема с Supabase
Если возникают проблемы с Supabase, убедитесь что:
1. Переменные окружения правильно настроены
2. Supabase проект активен
3. RLS политики настроены правильно

### Проблемы с изображениями
Изображения настроены как unoptimized для статического экспорта.

### Проблемы с роутингом
Используется trailingSlash для совместимости со статическим хостингом.
