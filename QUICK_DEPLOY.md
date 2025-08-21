# ⚡ Быстрый деплой на Cloudflare Pages

Минимальная инструкция для быстрого развертывания проекта.

## 🚀 За 5 минут

### 1. Подготовка (1 мин)
```bash
# Убедитесь, что проект собирается
npm run build
```

### 2. Cloudflare Pages (2 мин)
1. Откройте [dash.cloudflare.com/pages](https://dash.cloudflare.com/pages)
2. **Create a project** → **Connect to Git**
3. Выберите репозиторий `supplier-hub-mobile-ui`

### 3. Настройки сборки (1 мин)
- **Framework preset**: `Next.js`
- **Build command**: `npm run build`  
- **Build output directory**: `.next`
- **Root directory**: `/` (пустое)

### 4. Переменные окружения (1 мин)
Добавьте в **Environment variables**:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_APP_URL = https://your-project.pages.dev
```

### 5. Деплой (автоматически)
Нажмите **"Save and Deploy"** - готово! 🎉

---

## ❓ Где взять ключи Supabase?

1. [app.supabase.com](https://app.supabase.com) → ваш проект
2. **Settings** → **API**
3. Скопируйте **Project URL** и **anon public** ключ

## 🔗 Результат

Ваш сайт будет доступен по адресу: `https://supplier-hub-xxx.pages.dev`

---

**Подробная инструкция**: [CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md)
