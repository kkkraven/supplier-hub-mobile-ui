import React from 'react';
import { Button } from './ui/button';
import { Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
  showAdminButton?: boolean; // Новый проп для контроля видимости кнопки админ панели
}

export function Navbar({ 
  currentPage, 
  onNavigate, 
  isAdminAuthenticated, 
  onAdminLogout, 
  showAdminButton = false 
}: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer animate-nav-item transform hover:scale-105 transition-all duration-300" 
            onClick={() => onNavigate('landing')}
          >
            <div className="text-2xl font-bold text-primary animate-text-glow">Factura</div>
            <div className="ml-2 text-sm text-gray-600 animate-fade-left">Supplier Hub</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Regular navigation */}
            {!isAdminAuthenticated && (
              <>
                <Button
                  variant={currentPage === 'catalog' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('catalog')}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  Каталог
                </Button>
                <Button
                  variant={currentPage === 'pricing' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('pricing')}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  Цены
                </Button>
                
                {/* Кнопка админ панели показывается только если showAdminButton = true */}
                {showAdminButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('admin-login')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Админ
                  </Button>
                )}
                
                <Button
                  className="gradient-factura animate-button-hover transform hover:scale-105 transition-all duration-300"
                  onClick={() => onNavigate('onboarding')}
                >
                  Начать
                </Button>
              </>
            )}

            {/* Admin navigation */}
            {isAdminAuthenticated && (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg animate-bounce-in">
                  <Shield className="w-4 h-4 text-primary animate-icon-pulse" />
                  <span className="text-sm font-medium text-primary animate-pulse-slow">Админ режим</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('landing')}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  Вернуться на сайт
                </Button>
                <Button
                  variant="outline"
                  onClick={onAdminLogout}
                  className="animate-nav-item transform hover:scale-105 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2 animate-icon-bounce" />
                  Выйти
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}