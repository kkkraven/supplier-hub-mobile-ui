'use client'

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Shield, 
  LogOut, 
  User, 
  UserPlus, 
  Settings, 
  Menu
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useIsMobile } from './ui/use-mobile';
import { BottomNavigation } from './ui/bottom-navigation';
import { MobileMenu } from './ui/mobile-menu';

interface NavbarProps {
  currentPage: string;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
  showAdminButton?: boolean;
}

export function Navbar({ 
  currentPage, 
  isAdminAuthenticated, 
  onAdminLogout, 
  showAdminButton = false 
}: NavbarProps) {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'landing':
        router.push('/');
        break;
      case 'catalog':
        router.push('/catalog');
        break;
      case 'factories':
        router.push('/factories');
        break;
      case 'pricing':
        router.push('/pricing');
        break;
      case 'admin-login':
        router.push('/admin/login');
        break;
      case 'auth':
        router.push('/auth');
        break;
                         case 'supabase-test':
                     router.push('/supabase-test');
                     break;
                   case 'mobile-demo':
                     router.push('/mobile-demo');
                     break;
      case 'rfq':
        router.push('/rfq');
        break;
      default:
        router.push('/');
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
    <>
      {/* Основная навигация */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div 
              className="flex items-center cursor-pointer animate-nav-item transform hover:scale-105 transition-all duration-300" 
              onClick={() => handleNavigate('landing')}
              style={{ minHeight: '44px', minWidth: '44px' }} // Touch target optimization
            >
              <div className="text-xl sm:text-2xl font-bold text-primary animate-text-glow">Factura</div>
              <div className="ml-2 text-xs sm:text-sm text-gray-600 animate-fade-left hidden sm:block">Supplier Hub</div>
            </div>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center space-x-4">
                {!isAdminAuthenticated && (
                  <>
                    {/* Основная навигация */}
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.path;
                      
                      return (
                        <Button
                          key={item.key}
                          variant={isActive ? 'default' : 'ghost'}
                          onClick={() => handleNavigate(item.key)}
                          className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                          style={{ minHeight: '44px' }}
                        >
                          {item.label}
                        </Button>
                      );
                    })}
                    
                    {/* Админ и тестовые кнопки */}
                    {showAdminButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigate('admin-login')}
                        className="text-gray-500 hover:text-gray-700"
                        style={{ minHeight: '44px' }}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Админ
                      </Button>
                    )}

                                         <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleNavigate('supabase-test')}
                       className="text-gray-500 hover:text-gray-700"
                       style={{ minHeight: '44px' }}
                     >
                       <Settings className="w-4 h-4 mr-1" />
                       Тест Supabase
                     </Button>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleNavigate('mobile-demo')}
                       className="text-gray-500 hover:text-gray-700"
                       style={{ minHeight: '44px' }}
                     >
                       <Settings className="w-4 h-4 mr-1" />
                       Мобильные компоненты
                     </Button>
                    
                    {/* Аутентификация */}
                    {user ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 hidden lg:block">
                            {user.full_name || user.email}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSignOut}
                          className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                          style={{ minHeight: '44px' }}
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Выйти
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigate('auth')}
                          className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                          style={{ minHeight: '44px' }}
                        >
                          <User className="w-4 h-4 mr-1" />
                          Войти
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigate('auth')}
                          className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                          style={{ minHeight: '44px' }}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Регистрация
                        </Button>
                      </div>
                    )}
                  </>
                )}
                
                {/* Admin navigation */}
                {isAdminAuthenticated && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Админ панель</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAdminLogout}
                      className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                      style={{ minHeight: '44px' }}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Выйти
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label="Открыть меню"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        onNavigate={handleNavigate}
        showAdminButton={showAdminButton}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={onAdminLogout}
      />

      {/* Bottom Navigation */}
      {isMobile && <BottomNavigation onNavigate={handleNavigate} />}

      {/* Отступ для bottom navigation на мобильных устройствах */}
      {isMobile && <div className="h-16" />}
    </>
  );
}