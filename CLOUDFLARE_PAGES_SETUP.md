# 🚀 Деплой на Cloudflare Pages - Пошаговая инструкция

Полная инструкция по развертыванию проекта Supplier Hub на Cloudflare Pages.

## 📋 Предварительные требования

- ✅ Аккаунт на [Cloudflare](https://cloudflare.com)
- ✅ Репозиторий на GitHub с вашим проектом
- ✅ Рабочая локальная сборка проекта (`npm run build` выполняется без ошибок)

## 🔧 Шаг 1: Подготовка проекта

### 1.1 Проверьте конфигурацию

Убедитесь, что в корне проекта есть файл `wrangler.toml` с правильной конфигурацией:

```toml
name = "supplier-hub"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "supplier-hub"

[env.preview]
name = "supplier-hub-preview"

[build]
command = "npm run build"
pages_build_output_dir = ".next"
```

### 1.2 Проверьте Next.js конфигурацию

В файле `next.config.ts` должна быть правильная конфигурация:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
```

### 1.3 Проверьте локальную сборку

```bash
npm run build
```

Убедитесь, что сборка проходит без ошибок.

## 🌐 Шаг 2: Создание проекта в Cloudflare Pages

### 2.1 Войдите в Cloudflare Dashboard

1. Перейдите на [dash.cloudflare.com](https://dash.cloudflare.com)
2. Войдите в свой аккаунт
3. В левом меню выберите **"Pages"**

### 2.2 Создайте новый проект

1. Нажмите **"Create a project"**
2. Выберите **"Connect to Git"**
3. Подключите свой GitHub аккаунт (если еще не подключен)
4. Выберите репозиторий `supplier-hub-mobile-ui`

### 2.3 Настройте параметры сборки

В разделе **"Set up builds and deployments"**:

- **Project name**: `supplier-hub` (или любое другое имя)
- **Production branch**: `master` (или `main`)
- **Framework preset**: `Next.js`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (оставьте пустым)

### 2.4 Настройте переменные окружения

В разделе **"Environment variables"** добавьте:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
NEXT_PUBLIC_APP_URL=https://your-project.pages.dev
```

⚠️ **Важно**: Замените значения на ваши реальные ключи из Supabase.

## ⚙️ Шаг 3: Настройка переменных окружения

### 3.1 Получите ключи Supabase

1. Перейдите в [app.supabase.com](https://app.supabase.com)
2. Выберите свой проект
3. Перейдите в **Settings → API**
4. Скопируйте:
   - **Project URL** (для `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** ключ (для `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 3.2 Добавьте переменные в Cloudflare

1. В Cloudflare Pages перейдите в ваш проект
2. Откройте **Settings → Environment variables**
3. Добавьте переменные для **Production** и **Preview**:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_APP_URL = https://supplier-hub.pages.dev
```

## 🚀 Шаг 4: Деплой

### 4.1 Запустите первый деплой

1. Нажмите **"Save and Deploy"**
2. Cloudflare автоматически:
   - Клонирует репозиторий
   - Установит зависимости
   - Выполнит сборку
   - Развернет приложение

### 4.2 Отследите процесс сборки

1. Перейдите во вкладку **"Deployments"**
2. Нажмите на активный деплой
3. Следите за логами сборки

### 4.3 Ожидаемые этапы сборки

```
✅ Cloning repository
✅ Installing dependencies
✅ Running build command
✅ Optimizing build output
✅ Deploying to global network
```

## 🔍 Шаг 5: Проверка и тестирование

### 5.1 Проверьте основные страницы

После успешного деплоя проверьте:

- ✅ Главная страница: `https://your-project.pages.dev/`
- ✅ Каталог фабрик: `https://your-project.pages.dev/factories`
- ✅ Авторизация: `https://your-project.pages.dev/auth`
- ✅ Админ панель: `https://your-project.pages.dev/admin/login`

### 5.2 Проверьте подключение к Supabase

1. Откройте консоль разработчика (F12)
2. Перейдите на страницу с данными
3. Убедитесь, что нет ошибок подключения к Supabase

### 5.3 Протестируйте функциональность

- 🔐 Регистрация/авторизация
- 📋 Загрузка списка фабрик
- 🔍 Поиск и фильтрация
- 📱 Адаптивность на мобильных

## 🔧 Шаг 6: Настройка домена (опционально)

### 6.1 Добавьте пользовательский домен

1. В настройках проекта перейдите в **"Custom domains"**
2. Нажмите **"Set up a custom domain"**
3. Введите ваш домен (например, `supplier-hub.com`)
4. Следуйте инструкциям по настройке DNS

### 6.2 Настройте SSL

Cloudflare автоматически выпустит SSL сертификат для вашего домена.

## 🚨 Устранение проблем

### Проблема: Ошибка сборки "Cannot find cwd"

**Решение**: Убедитесь, что в `wrangler.toml` указан правильный `pages_build_output_dir = ".next"`

### Проблема: Ошибка "Missing generateStaticParams"

**Решение**: Все динамические маршруты должны иметь функцию `generateStaticParams()`:

```typescript
export async function generateStaticParams() {
  return [];
}
```

### Проблема: Ошибка подключения к Supabase

**Решение**: 
1. Проверьте правильность переменных окружения
2. Убедитесь, что URL Supabase доступен
3. Проверьте CORS настройки в Supabase

### Проблема: 404 ошибки на динамических маршрутах

**Решение**: Временно отключен статический экспорт, что должно решить эту проблему.

## 🔄 Автоматические обновления

### Настройка CI/CD

Cloudflare Pages автоматически пересобирает проект при:
- ✅ Push в основную ветку (`master`)
- ✅ Создании Pull Request (preview деплой)
- ✅ Изменении переменных окружения

### Webhook уведомления

Можно настроить webhook для уведомлений о статусе деплоя в Slack/Discord.

## 📊 Мониторинг

### Cloudflare Analytics

1. Перейдите в **Analytics → Web Analytics**
2. Добавьте JS beacon на сайт для отслеживания метрик

### Логи и метрики

- **Real User Monitoring** - производительность
- **Security Analytics** - безопасность  
- **Traffic Analytics** - трафик

## 🎉 Готово!

Ваш проект успешно развернут на Cloudflare Pages! 

### Полезные ссылки:

- 🌐 **Ваш сайт**: `https://your-project.pages.dev`
- 📊 **Dashboard**: `https://dash.cloudflare.com`
- 📚 **Документация**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи сборки в Cloudflare Dashboard
2. Убедитесь в правильности конфигурации
3. Создайте Issue в GitHub репозитории

**Удачного деплоя! 🚀**
