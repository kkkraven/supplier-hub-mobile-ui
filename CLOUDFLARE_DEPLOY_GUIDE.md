# 🚀 Руководство по деплою на Cloudflare Pages

## ✅ Подготовка завершена!

Проект успешно настроен для деплоя на Cloudflare Pages. Все необходимые файлы созданы:

- ✅ `wrangler.toml` - конфигурация Cloudflare
- ✅ `next.config.ts` - настроен для статического экспорта
- ✅ `.nvmrc` - версия Node.js
- ✅ Проект собирается без ошибок

## 📋 Пошаговый деплой

### 1. Подготовка аккаунта Cloudflare

1. Зарегистрируйтесь на [cloudflare.com](https://cloudflare.com)
2. Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
3. В боковом меню выберите "Pages"

### 2. Создание проекта

1. Нажмите "Create a project"
2. Выберите "Connect to Git"
3. Подключите ваш GitHub репозиторий
4. Настройте параметры:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `web`

### 3. Настройка переменных окружения

В настройках проекта (Settings → Environment variables) добавьте:

#### Для Production:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-app-name.pages.dev
```

#### Для Preview (опционально):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-app-name-preview.pages.dev
```

### 4. Получение данных Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → API
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Автоматический деплой

После настройки:
1. Сделайте push в main ветку
2. Cloudflare автоматически соберет и задеплоит приложение
3. Получите URL вида: `https://your-app-name.pages.dev`

## 🔧 Ручной деплой (опционально)

Если хотите деплоить вручную:

```bash
# Установите Wrangler CLI
npm install -g wrangler

# Авторизуйтесь
wrangler login

# Перейдите в папку проекта
cd web

# Соберите проект
npm run build

# Деплой
npm run deploy
```

## 🌐 Настройка домена (опционально)

1. В настройках проекта выберите "Custom domains"
2. Добавьте ваш домен
3. Настройте DNS записи согласно инструкциям Cloudflare

## 🔍 Проверка деплоя

После деплоя проверьте:

1. ✅ Главная страница загружается
2. ✅ Авторизация работает
3. ✅ Каталог фабрик отображается
4. ✅ Поиск и фильтры работают
5. ✅ Страницы фабрик открываются

## 🐛 Устранение проблем

### Проблема: "Supabase client not initialized"
- Проверьте переменные окружения
- Убедитесь, что Supabase проект активен

### Проблема: "CORS error"
- Добавьте домен Cloudflare в настройки CORS Supabase
- Проверьте RLS политики

### Проблема: "Build failed"
- Проверьте логи сборки в Cloudflare Dashboard
- Убедитесь, что все зависимости установлены

### Проблема: "Page not found"
- Проверьте настройки роутинга
- Убедитесь, что используется `trailingSlash: true`

## 📊 Мониторинг

После деплоя отслеживайте:

- **Analytics** - статистика посещений
- **Functions** - логи серверных функций
- **Performance** - метрики производительности

## 🔄 Обновления

Для обновления приложения:
1. Внесите изменения в код
2. Сделайте push в main ветку
3. Cloudflare автоматически пересоберет и задеплоит

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте [документацию Cloudflare Pages](https://developers.cloudflare.com/pages/)
2. Посмотрите логи в Cloudflare Dashboard
3. Обратитесь в поддержку Cloudflare

---

**🎉 Поздравляем! Ваше приложение готово к работе на Cloudflare Pages!**
