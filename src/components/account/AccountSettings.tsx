// ============================================================================
// ACCOUNT SETTINGS COMPONENT
// ============================================================================
// Компонент настроек аккаунта пользователя
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Building2, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';

// ============================================================================
// 1. ОСНОВНОЙ КОМПОНЕНТ НАСТРОЕК АККАУНТА
// ============================================================================

export const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      {/* Личная информация */}
      <PersonalInfoCard user={user} loading={loading} saved={saved} />
      
      {/* Информация о компании */}
      <CompanyInfoCard user={user} loading={loading} />
      
      {/* Настройки уведомлений */}
      <NotificationSettingsCard />
      
      {/* Безопасность */}
      <SecuritySettingsCard />
      
      {/* Опасная зона */}
      <DangerZoneCard />
    </div>
  );
};

// ============================================================================
// 2. КАРТОЧКА ЛИЧНОЙ ИНФОРМАЦИИ
// ============================================================================

interface PersonalInfoCardProps {
  user: any;
  loading: boolean;
  saved: boolean;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ 
  user, 
  loading, 
  saved 
}) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Логика сохранения личной информации
    console.log('Saving personal info:', formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          Личная информация
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Полное имя</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Введите ваше имя"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">О себе</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Расскажите немного о себе..."
            rows={3}
          />
        </div>
        
        {saved && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Личная информация успешно сохранена
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 3. КАРТОЧКА ИНФОРМАЦИИ О КОМПАНИИ
// ============================================================================

interface CompanyInfoCardProps {
  user: any;
  loading: boolean;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ user, loading }) => {
  const [companyData, setCompanyData] = useState({
    company_name: user?.company_name || '',
    company_website: user?.company_website || '',
    company_address: user?.company_address || '',
    company_description: user?.company_description || '',
    industry: user?.industry || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Логика сохранения информации о компании
    console.log('Saving company info:', companyData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-500" />
          Информация о компании
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Название компании</Label>
            <Input
              id="company_name"
              value={companyData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="ООО 'Ваша компания'"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_website">Веб-сайт</Label>
            <Input
              id="company_website"
              type="url"
              value={companyData.company_website}
              onChange={(e) => handleInputChange('company_website', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Отрасль</Label>
          <Input
            id="industry"
            value={companyData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            placeholder="Например: Текстиль, Электроника, Автомобили"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company_address">Адрес</Label>
          <Input
            id="company_address"
            value={companyData.company_address}
            onChange={(e) => handleInputChange('company_address', e.target.value)}
            placeholder="Полный адрес компании"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company_description">Описание деятельности</Label>
          <Textarea
            id="company_description"
            value={companyData.company_description}
            onChange={(e) => handleInputChange('company_description', e.target.value)}
            placeholder="Опишите основную деятельность вашей компании..."
            rows={3}
          />
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 4. КАРТОЧКА НАСТРОЕК УВЕДОМЛЕНИЙ
// ============================================================================

const NotificationSettingsCard: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email_marketing: true,
    email_updates: true,
    email_billing: true,
    push_notifications: false,
    sms_notifications: false
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Логика сохранения настроек уведомлений
    console.log('Saving notification settings:', notifications);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-green-500" />
          Настройки уведомлений
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Email уведомления</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Новости и обновления</div>
                  <div className="text-xs text-slate-500">Информация о новых функциях и улучшениях</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_updates}
                  onChange={(e) => handleNotificationChange('email_updates', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Биллинг и платежи</div>
                  <div className="text-xs text-slate-500">Уведомления о счетах и платежах</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_billing}
                  onChange={(e) => handleNotificationChange('email_billing', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Маркетинговые материалы</div>
                  <div className="text-xs text-slate-500">Специальные предложения и акции</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_marketing}
                  onChange={(e) => handleNotificationChange('email_marketing', e.target.checked)}
                  className="rounded"
                />
              </label>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Другие уведомления</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Push уведомления</div>
                  <div className="text-xs text-slate-500">Уведомления в браузере</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push_notifications}
                  onChange={(e) => handleNotificationChange('push_notifications', e.target.checked)}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">SMS уведомления</div>
                  <div className="text-xs text-slate-500">Важные уведомления по SMS</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.sms_notifications}
                  onChange={(e) => handleNotificationChange('sms_notifications', e.target.checked)}
                  className="rounded"
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 5. КАРТОЧКА НАСТРОЕК БЕЗОПАСНОСТИ
// ============================================================================

const SecuritySettingsCard: React.FC = () => {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Пароли не совпадают');
      return;
    }
    
    // Логика смены пароля
    console.log('Changing password...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          Безопасность
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Смена пароля</h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="current_password">Текущий пароль</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                placeholder="Введите текущий пароль"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password">Новый пароль</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                placeholder="Введите новый пароль"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Подтвердите новый пароль</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                placeholder="Повторите новый пароль"
              />
            </div>
          </div>
          
          <Button onClick={handleChangePassword} className="w-full md:w-auto">
            Изменить пароль
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Двухфакторная аутентификация</h4>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <div className="font-medium text-sm">2FA отключена</div>
              <div className="text-xs text-slate-500">Добавьте дополнительный уровень безопасности</div>
            </div>
            <Button variant="outline" size="sm">
              Включить 2FA
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Активные сессии</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-sm">Текущая сессия</div>
                <div className="text-xs text-slate-500">Windows • Chrome • Москва</div>
              </div>
              <Badge variant="outline" className="text-green-700">Активна</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 6. ОПАСНАЯ ЗОНА
// ============================================================================

const DangerZoneCard: React.FC = () => {
  const [confirmDelete, setConfirmDelete] = useState('');
  
  const handleDeleteAccount = async () => {
    if (confirmDelete !== 'УДАЛИТЬ') {
      alert('Введите "УДАЛИТЬ" для подтверждения');
      return;
    }
    
    if (!confirm('Вы уверены? Это действие нельзя отменить!')) {
      return;
    }
    
    // Логика удаления аккаунта
    console.log('Deleting account...');
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Опасная зона
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>Внимание!</strong> Действия в этом разделе необратимы. 
            Пожалуйста, будьте осторожны.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-red-800 mb-2">Удаление аккаунта</h4>
            <p className="text-sm text-red-700 mb-4">
              При удалении аккаунта будут безвозвратно удалены все ваши данные, 
              включая подписку, историю использования и настройки.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="confirm_delete" className="text-red-800">
                  Введите "УДАЛИТЬ" для подтверждения:
                </Label>
                <Input
                  id="confirm_delete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="УДАЛИТЬ"
                  className="border-red-300"
                />
              </div>
              
              <Button 
                onClick={handleDeleteAccount}
                variant="destructive"
                className="w-full md:w-auto"
                disabled={confirmDelete !== 'УДАЛИТЬ'}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить аккаунт навсегда
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// 7. ЭКСПОРТ
// ============================================================================

export default AccountSettings;
