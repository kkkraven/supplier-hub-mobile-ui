'use client'

import React from 'react';
import { 
  Shield, 
  LogOut, 
  User, 
  UserPlus, 
  Settings, 
  Search, 
  Factory, 
  DollarSign,
  FileText,
  X
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import { Separator } from './separator';
import { MobileMenuButton } from './touch-button';

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string) => void;
  showAdminButton?: boolean;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
}

export function MobileMenu({ 
  isOpen, 
  onOpenChange, 
  onNavigate, 
  showAdminButton = false,
  isAdminAuthenticated = false,
  onAdminLogout
}: MobileMenuProps) {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  // Навигационные элементы
  const navigationItems = [
    { key: 'catalog', label: 'Каталог', icon: Search, path: '/catalog' },
    { key: 'factories', label: 'Фабрики', icon: Factory, path: '/factories' },
    { key: 'pricing', label: 'Цены', icon: DollarSign, path: '/pricing' },
    ...(user ? [{ key: 'rfq', label: 'Мои RFQ', icon: FileText, path: '/rfq' }] : [])
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 overflow-y-auto">
        <SheetHeader className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-xl font-bold text-primary">Factura</div>
              <div className="ml-2 text-sm text-gray-600">Supplier Hub</div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Закрыть меню"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Основная навигация */}
          <div className="flex-1 px-6 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                
                return (
                  <MobileMenuButton
                    key={item.key}
                    icon={<Icon className="w-5 h-5" />}
                    label={item.label}
                    isActive={isActive}
                    onClick={() => {
                      onNavigate(item.key);
                      onOpenChange(false);
                    }}
                  />
                );
              })}
            </nav>
          </div>

          {/* Разделитель */}
          <Separator />

          {/* Пользовательская секция */}
          <div className="px-6 py-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-green-600">Авторизован</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 active:bg-gray-100"
                  style={{ minHeight: '44px' }}
                  aria-label="Выйти из аккаунта"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Выйти</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onNavigate('auth');
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 active:bg-primary/80"
                  style={{ minHeight: '44px' }}
                  aria-label="Войти в аккаунт"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Войти</span>
                </button>
                
                <button
                  onClick={() => {
                    onNavigate('auth');
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 active:bg-gray-100"
                  style={{ minHeight: '44px' }}
                  aria-label="Зарегистрироваться"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">Регистрация</span>
                </button>
              </div>
            )}

            {/* Админ и тестовые кнопки */}
            {(showAdminButton || !isAdminAuthenticated) && (
              <>
                <Separator className="my-3" />
                <div className="space-y-2">
                  {showAdminButton && (
                    <button
                      onClick={() => {
                        onNavigate('admin-login');
                        onOpenChange(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 active:bg-gray-100"
                      style={{ minHeight: '44px' }}
                      aria-label="Админ панель"
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Админ панель</span>
                    </button>
                  )}
                  
                                               <button
                               onClick={() => {
                                 onNavigate('supabase-test');
                                 onOpenChange(false);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 active:bg-gray-100"
                               style={{ minHeight: '44px' }}
                               aria-label="Тест Supabase"
                             >
                               <Settings className="w-5 h-5" />
                               <span className="font-medium">Тест Supabase</span>
                             </button>

                             <button
                               onClick={() => {
                                 onNavigate('mobile-demo');
                                 onOpenChange(false);
                               }}
                               className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 active:bg-gray-100"
                               style={{ minHeight: '44px' }}
                               aria-label="Мобильные компоненты"
                             >
                               <Settings className="w-5 h-5" />
                               <span className="font-medium">Мобильные компоненты</span>
                             </button>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
