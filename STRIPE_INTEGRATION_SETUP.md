# 🔐 STRIPE INTEGRATION SETUP GUIDE

## 📋 Обзор интеграции

Полная интеграция со Stripe для обработки подписок, платежей и управления способами оплаты в проекте Supplier Hub.

## 🔑 Переменные окружения

Добавьте следующие переменные в ваш `.env.local` файл:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs for Plans
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# Site URL (for webhooks and redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🏗️ Настройка Stripe Dashboard

### 1. Создание продуктов и цен

В Stripe Dashboard создайте следующие продукты:

#### **Starter Plan**
- Название: "Starter"
- Описание: "Базовый план для малого бизнеса"
- Цены:
  - Месячная: 990₽/месяц
  - Годовая: 9900₽/год (17% скидка)

#### **Professional Plan**
- Название: "Professional" 
- Описание: "Профессиональный план для растущего бизнеса"
- Цены:
  - Месячная: 2990₽/месяц
  - Годовая: 29900₽/год (17% скидка)

#### **Enterprise Plan**
- Название: "Enterprise"
- Описание: "Корпоративный план для крупного бизнеса"
- Цены:
  - Месячная: 7990₽/месяц
  - Годовая: 79900₽/год (17% скидка)

### 2. Настройка Webhooks

Создайте webhook endpoint в Stripe Dashboard:

**URL:** `https://yourdomain.com/api/webhooks/stripe`

**События для подписки:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.trial_will_end`

## 📦 Установка зависимостей

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## 🔧 Файловая структура

```
src/
├── lib/
│   ├── stripe.ts              # Клиентская конфигурация Stripe
│   └── stripe-server.ts       # Серверные утилиты Stripe
├── app/api/
│   ├── subscription/
│   │   ├── create/route.ts    # Создание подписки
│   │   └── upgrade/route.ts   # Апгрейд подписки
│   └── webhooks/
│       └── stripe/route.ts    # Обработка webhooks
├── components/stripe/
│   ├── StripeProvider.tsx     # Провайдер Stripe Elements
│   ├── CheckoutForm.tsx       # Форма оплаты
│   ├── SetupForm.tsx         # Форма добавления карты
│   └── PaymentMethodManager.tsx # Управление картами
└── types/
    └── stripe.ts             # TypeScript типы
```

## 🚀 API Endpoints

### **POST /api/subscription/create**
Создание новой подписки

**Request Body:**
```json
{
  "plan_id": "uuid",
  "billing_cycle": "monthly" | "annual",
  "trial_days": 7,
  "coupon_code": "DISCOUNT20"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_session": {
      "id": "cs_...",
      "url": "https://checkout.stripe.com/..."
    }
  }
}
```

### **POST /api/subscription/upgrade**
Апгрейд существующей подписки

**Request Body:**
```json
{
  "new_plan_id": "uuid",
  "billing_cycle": "monthly",
  "prorate": true
}
```

### **POST /api/webhooks/stripe**
Обработка webhook событий от Stripe

## 🎨 Компоненты

### **StripeProvider**
Провайдер для Stripe Elements с настройками темы

```tsx
import { StripeProvider } from '@/components/stripe/StripeProvider';

<StripeProvider>
  <CheckoutForm />
</StripeProvider>
```

### **CheckoutForm**
Полная форма оплаты с PaymentElement

```tsx
import { CheckoutForm } from '@/components/stripe/CheckoutForm';

<CheckoutForm
  planName="Professional"
  planPrice={299000} // в копейках
  billingCycle="monthly"
  onSuccess={() => console.log('Success!')}
/>
```

### **PaymentMethodManager**
Управление сохраненными способами оплаты

```tsx
import { PaymentMethodManager } from '@/components/stripe/PaymentMethodManager';

<PaymentMethodManager />
```

## 🔄 Workflow подписки

### 1. **Создание подписки**
1. Пользователь выбирает план на странице `/pricing`
2. API создает Stripe Checkout Session
3. Пользователь перенаправляется на Stripe Checkout
4. После успешной оплаты webhook обновляет БД

### 2. **Апгрейд подписки**
1. Пользователь выбирает новый план в `/account`
2. API обновляет подписку в Stripe
3. Создается prorated invoice
4. Webhook обновляет статус в БД

### 3. **Управление картами**
1. Пользователь добавляет карту через SetupIntent
2. Карта сохраняется в Stripe Customer
3. Можно установить карту по умолчанию
4. Удаление карты через API

## 🛡️ Безопасность

### **Webhook Verification**
Все webhooks верифицируются через Stripe signature:

```typescript
const event = verifyStripeWebhook(payload, signature, webhookSecret);
```

### **Metadata Security**
В metadata Stripe передается только:
- `user_id` - ID пользователя в нашей БД
- `plan_id` - ID плана
- `plan_name` - название плана

### **Error Handling**
Все ошибки Stripe локализованы на русский язык:

```typescript
const errorMessage = getLocalizedErrorMessage(error.code);
```

## 🎯 Интеграция с PaywallGuard

PaywallGuard автоматически интегрируется со Stripe:

```tsx
<PaywallGuard requiredPlan="professional">
  <PremiumContent />
</PaywallGuard>
```

При клике на "Upgrade" пользователь перенаправляется на Stripe Checkout.

## 📊 Мониторинг

### **Stripe Dashboard**
- Отслеживание платежей
- Анализ конверсии
- Управление спорами

### **Webhook Logs**
Все webhook события логируются в консоль:

```typescript
console.log(`Processing webhook event: ${event.type}`);
```

### **Database Sync**
Автоматическая синхронизация между Stripe и Supabase через webhooks.

## 🔧 Тестирование

### **Test Cards**
Используйте тестовые карты Stripe:

- **Успешная оплата:** `4242 4242 4242 4242`
- **Отклонена:** `4000 0000 0000 0002`
- **Требует 3DS:** `4000 0025 0000 3155`

### **Webhook Testing**
Используйте Stripe CLI для локального тестирования:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## ⚡ Production Checklist

- [ ] Переключиться на live ключи Stripe
- [ ] Настроить production webhook URL
- [ ] Добавить домен в Stripe Dashboard
- [ ] Настроить мониторинг ошибок
- [ ] Проверить все Price IDs
- [ ] Настроить email уведомления в Stripe

## 🎉 Готово!

Интеграция со Stripe полностью настроена и готова к использованию. Все компоненты автоматически работают с системой подписок и обеспечивают seamless UX для пользователей.
