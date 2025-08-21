# 📖 Инструкция по настройке GitHub репозитория

## 🎯 Шаг 1: Создание репозитория на GitHub

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите зеленую кнопку "New repository"
3. Заполните форму:
   - **Repository name**: `supplier-hub-mobile-ui`
   - **Description**: `Supplier Hub - Mobile-First UI Kit для поиска и работы с фабриками. Next.js + Supabase + Tailwind CSS`
   - **Visibility**: Public (или Private по вашему выбору)
   - **НЕ СТАВЬТЕ галочки** на "Add a README file", "Add .gitignore", "Choose a license"
4. Нажмите "Create repository"

## 🔗 Шаг 2: Подключение локального репозитория

После создания репозитория на GitHub выполните следующие команды в терминале:

```bash
# Перейдите в папку web (если не там)
cd web

# Добавьте remote репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/supplier-hub-mobile-ui.git

# Отправьте код на GitHub
git push -u origin master
```

## 📋 Альтернативный способ (SSH)

Если у вас настроен SSH ключ:

```bash
# Добавьте remote репозиторий через SSH
git remote add origin git@github.com:YOUR_USERNAME/supplier-hub-mobile-ui.git

# Отправьте код на GitHub
git push -u origin master
```

## ✅ Проверка

После выполнения команд:
1. Обновите страницу репозитория на GitHub
2. Вы должны увидеть все ваши файлы
3. Репозиторий готов для деплоя на Cloudflare Pages

## 🚀 Следующий шаг

После успешного push на GitHub:
1. Перейдите к настройке Cloudflare Pages
2. Следуйте инструкциям в `CLOUDFLARE_DEPLOY_GUIDE.md`

---

**💡 Совет**: Замените `YOUR_USERNAME` на ваш реальный GitHub username в командах выше.
