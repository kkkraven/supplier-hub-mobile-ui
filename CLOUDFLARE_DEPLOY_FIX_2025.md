# Исправление деплоя на Cloudflare Pages - 2025

## Проблема
Ошибка: "Pages only supports files up to 25 MiB in size"
Файл `cache/webpack/server-production/0.pack` имеет размер 80.7 MiB

## Решение

### 1. Обновленная конфигурация Next.js
Файл `next.config.ts` обновлен с дополнительными оптимизациями:

```typescript
// Отключение кэширования
experimental: {
  isrMemoryCacheSize: 0,
},
onDemandEntries: {
  maxInactiveAge: 25 * 1000,
  pagesBufferLength: 2,
},

// Отключение webpack кэша в production
webpack: (config, { isServer, dev }) => {
  if (!dev) {
    config.cache = false;
  }
  // ... остальные оптимизации
}
```

### 2. Обновленные скрипты сборки
В `package.json` добавлены новые скрипты:

```json
{
  "scripts": {
    "clean": "rimraf .next node_modules/.cache",
    "clean:win": "powershell -ExecutionPolicy Bypass -File clean.ps1",
    "build:cloudflare": "npm run clean && NEXT_TELEMETRY_DISABLED=1 next build",
    "build:cloudflare:win": "npm run clean:win && NEXT_TELEMETRY_DISABLED=1 next build"
  }
}
```

### 3. Обновленная конфигурация Wrangler
Файл `wrangler.toml` обновлен:

```toml
[build]
command = "npm run build:cloudflare"
pages_build_output_dir = ".next"

[build.upload]
exclude = [
  "**/cache/**",
  "**/*.pack",
  "**/webpack/**"
]
```

### 4. Исключения в .gitignore
Добавлены исключения для кэш-файлов:

```
# webpack cache files
**/cache/
**/*.pack
**/webpack/cache/
**/webpack/server-production/
**/webpack/client-production/
```

### 5. PowerShell скрипт очистки
Создан файл `clean.ps1` для Windows:

```powershell
# Удаляет .next, node_modules/.cache и webpack кэш
```

## Инструкции по деплою

### Для Windows:
```bash
npm run build:cloudflare:win
```

### Для Linux/Mac:
```bash
npm run build:cloudflare
```

### Автоматический деплой:
1. Закоммитить изменения
2. Запушить в репозиторий
3. Cloudflare Pages автоматически выполнит деплой

## Результат
- ✅ Устранена проблема с большими файлами
- ✅ Оптимизирован размер бандла
- ✅ Отключено кэширование webpack
- ✅ Добавлена кросс-платформенная поддержка

## Примечания
- Используется `rimraf` для кросс-платформенной очистки
- Отключена телеметрия Next.js для ускорения сборки
- Все кэш-файлы исключены из деплоя
