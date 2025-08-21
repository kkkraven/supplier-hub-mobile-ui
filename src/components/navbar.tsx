'use client'

import React from 'react';
import { Button } from './ui/button';
import { Shield, LogOut, User, UserPlus, Settings } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  currentPage: string;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
  showAdminButton?: boolean; // Новый проп для контроля видимости кнопки админ панели
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
      case 'rfq':
        router.push('/rfq');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer animate-nav-item transform hover:scale-105 transition-all duration-300" 
            onClick={() => handleNavigate('landing')}
          >
            <div className="text-2xl font-bold text-primary animate-text-glow">Factura</div>
            <div className="ml-2 text-sm text-gray-600 animate-fade-left">Supplier Hub</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Regular navigation */}
            {!isAdminAuthenticated && (
              <>
                <Button
                  variant={pathname === '/catalog' ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('catalog')}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  Каталог
                </Button>
                <Button
                  variant={pathname === '/factories' ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('factories')}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  Фабрики
                </Button>
                <Button
                  variant={pathname === '/pricing' ? 'default' : 'ghost'}
                  onClick={() => handleNavigate('pricing')}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  Цены
                </Button>
                {user && (
                  <Button
                    variant={pathname.startsWith('/rfq') ? 'default' : 'ghost'}
                    onClick={() => handleNavigate('rfq')}
                    className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                  >
                    Мои RFQ
                  </Button>
                )}
                
                {/* Кнопка админ панели показывается только если showAdminButton = true */}
                {showAdminButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('admin-login')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Админ
                  </Button>
                )}

                {/* Кнопка тестирования Supabase */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('supabase-test')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Тест Supabase
                </Button>
                
                {/* Аутентификация */}
                {user ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {user.full_name || user.email}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="animate-nav-item transform hover:scale-105 transition-all duration-300"
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
                    >
                      <User className="w-4 h-4 mr-1" />
                      Войти
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate('auth')}
                      className="animate-nav-item transform hover:scale-105 transition-all duration-300"
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
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Выйти
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}