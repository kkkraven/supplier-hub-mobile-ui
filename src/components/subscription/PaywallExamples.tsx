// ============================================================================
// PAYWALL GUARD USAGE EXAMPLES
// ============================================================================
// Примеры использования PaywallGuard компонента
// ============================================================================

'use client';

import React from 'react';
import { PaywallGuard, BlurredContent, FactoryContactGuard } from './PaywallGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Factory, 
  FileText, 
  Crown, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Users
} from 'lucide-react';

// ============================================================================
// 1. БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
// ============================================================================

export const BasicPaywallExample: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Базовое использование PaywallGuard</h2>
      
      {/* Стандартная карточка */}
      <PaywallGuard requiredPlan="professional">
        <Card>
          <CardHeader>
            <CardTitle>Премиум контент</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Этот контент доступен только подписчикам Professional плана.</p>
          </CardContent>
        </Card>
      </PaywallGuard>
    </div>
  );
};

// ============================================================================
// 2. РАЗЛИЧНЫЕ ВАРИАНТЫ ОТОБРАЖЕНИЯ
// ============================================================================

export const PaywallVariantsExample: React.FC = () => {
  const premiumContent = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Эксклюзивная аналитика
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-slate-600">Новых фабрик</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-slate-600">Успешных RFQ</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">$2.4M</div>
              <div className="text-sm text-slate-600">Объем сделок</div>
            </div>
          </div>
          <p className="text-slate-600">
            Детальная аналитика по всем фабрикам, трендам и возможностям для вашего бизнеса.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Варианты отображения Paywall</h2>
      
      {/* Карточка (по умолчанию) */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Вариант: Card (по умолчанию)</h3>
        <PaywallGuard 
          requiredPlan="professional"
          requiredFeature="Детальная аналитика"
          variant="card"
        >
          {premiumContent}
        </PaywallGuard>
      </div>
      
      {/* Overlay */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Вариант: Overlay</h3>
        <PaywallGuard 
          requiredPlan="professional"
          requiredFeature="Детальная аналитика"
          variant="overlay"
          showPreview={true}
        >
          {premiumContent}
        </PaywallGuard>
      </div>
      
      {/* Banner */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Вариант: Banner</h3>
        <div className="space-y-4">
          <PaywallGuard 
            requiredPlan="professional"
            requiredFeature="Детальная аналитика"
            variant="banner"
            customMessage="Получите доступ к расширенной аналитике и инсайтам"
          >
            {premiumContent}
          </PaywallGuard>
          {premiumContent}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. ЗАЩИТА КОНТАКТОВ ФАБРИК
// ============================================================================

export const FactoryContactExample: React.FC = () => {
  const factoryData = {
    id: 'factory-123',
    name: 'Shanghai Textile Manufacturing Co.',
    location: 'Shanghai, China',
    specialization: 'Cotton Garments',
    rating: 4.8,
    orders: 1247
  };

  const contactInfo = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Mail className="h-4 w-4 text-slate-500" />
        <span>contact@shanghai-textile.com</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Phone className="h-4 w-4 text-slate-500" />
        <span>+86 21 1234 5678</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-slate-500" />
        <span>123 Industrial Road, Shanghai 200000</span>
      </div>
      <div className="pt-2">
        <Button className="w-full">
          Связаться с фабрикой
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Защита контактов фабрик</h2>
      
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-500" />
              {factoryData.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {factoryData.rating}
            </Badge>
          </div>
          <div className="text-sm text-slate-600">
            {factoryData.specialization} • {factoryData.location}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Выполнено заказов:</span>
            <span className="font-medium">{factoryData.orders.toLocaleString()}</span>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Контактная информация</h4>
            
            <FactoryContactGuard 
              factoryId={factoryData.id}
              factoryName={factoryData.name}
            >
              {contactInfo}
            </FactoryContactGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// 4. РАЗМЫТЫЙ КОНТЕНТ
// ============================================================================

export const BlurredContentExample: React.FC = () => {
  const sensitiveContent = (
    <Card>
      <CardHeader>
        <CardTitle>Конфиденциальная информация о фабрике</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-600">Минимальный заказ:</div>
            <div className="font-semibold">500 единиц</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Время производства:</div>
            <div className="font-semibold">15-20 дней</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Цена за единицу:</div>
            <div className="font-semibold">$12.50 - $18.00</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Сертификации:</div>
            <div className="font-semibold">OEKO-TEX, GOTS</div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Специальные условия</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Скидка 5% при заказе свыше 1000 единиц</li>
            <li>• Бесплатные образцы при первом заказе</li>
            <li>• Гибкие условия оплаты для постоянных клиентов</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Размытый контент</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Легкое размытие */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Легкое размытие</h3>
          <BlurredContent 
            requiredPlan="starter"
            blurIntensity="light"
          >
            {sensitiveContent}
          </BlurredContent>
        </div>
        
        {/* Сильное размытие */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Сильное размытие</h3>
          <BlurredContent 
            requiredPlan="professional"
            blurIntensity="heavy"
          >
            {sensitiveContent}
          </BlurredContent>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. КАСТОМИЗИРОВАННЫЕ СООБЩЕНИЯ
// ============================================================================

export const CustomMessagesExample: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Кастомизированные сообщения</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Кастомное сообщение */}
        <PaywallGuard 
          requiredPlan="professional"
          customMessage="🚀 Ускорьте свой бизнес с Professional планом! Получите доступ к эксклюзивным фабрикам и инструментам."
          upgradeButtonText="Начать сейчас"
          variant="card"
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Эксклюзивные фабрики</h3>
              <p className="text-slate-600">Доступ к проверенным поставщикам с лучшими условиями.</p>
            </CardContent>
          </Card>
        </PaywallGuard>
        
        {/* Специальное предложение */}
        <PaywallGuard 
          requiredPlan="enterprise"
          customMessage="🎯 Специальное предложение! Получите Enterprise план со скидкой 30% в первый месяц."
          upgradeButtonText="Воспользоваться предложением"
          variant="card"
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Персональный менеджер</h3>
              <p className="text-slate-600">Индивидуальное сопровождение и поддержка 24/7.</p>
            </CardContent>
          </Card>
        </PaywallGuard>
      </div>
    </div>
  );
};

// ============================================================================
// 6. ГЛАВНЫЙ КОМПОНЕНТ С ПРИМЕРАМИ
// ============================================================================

export const PaywallGuardDemo: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">PaywallGuard - Примеры использования</h1>
        <p className="text-slate-600">
          Различные способы защиты контента и стимулирования апгрейда подписки
        </p>
      </div>
      
      <BasicPaywallExample />
      <PaywallVariantsExample />
      <FactoryContactExample />
      <BlurredContentExample />
      <CustomMessagesExample />
      
      <div className="text-center pt-8 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Все компоненты автоматически адаптируются под текущую подписку пользователя
        </p>
      </div>
    </div>
  );
};

export default PaywallGuardDemo;
