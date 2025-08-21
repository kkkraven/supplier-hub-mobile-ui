import React from 'react';
import {
  Factory,
  MessageSquare,
  FileText,
  Settings,
  Home,
  Search,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function LayoutSidebar({
  currentPage = 'landing',
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navigationItems = [
    {
      id: 'landing',
      label: 'Главная',
      icon: Home,
      badge: null,
    },
    {
      id: 'catalog',
      label: 'Каталог фабрик',
      icon: Factory,
      badge: null,
    },
    {
      id: 'chat',
      label: 'RFQ Чаты',
      icon: MessageSquare,
      badge: 5,
    },
    {
      id: 'contracts',
      label: 'Контракты',
      icon: FileText,
      badge: null,
    },
    {
      id: 'admin',
      label: 'Управление',
      icon: Settings,
      badge: null,
    },
  ];

  const secondaryItems = [
    {
      id: 'search',
      label: 'Поиск',
      icon: Search,
    },
    {
      id: 'users',
      label: 'Пользователи',
      icon: Users,
    },
    {
      id: 'analytics',
      label: 'Аналитика',
      icon: BarChart3,
    },
  ];

  const handleNavClick = (pageId: string) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 shadow-sm h-screen flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg text-gray-900">Навигация</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      !isCollapsed && 'mr-3'
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-warning text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <div className="absolute left-8 top-1 bg-warning text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="p-2 border-t border-gray-200 mt-4">
          {!isCollapsed && (
            <h3 className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
              Инструменты
            </h3>
          )}
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-primary transition-all duration-200',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      !isCollapsed && 'mr-3'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-xs text-gray-500">
            <p>Supplier Hub v1.0</p>
            <p className="mt-1">© 2025 Platform</p>
          </div>
        )}
      </div>
    </div>
  );
}