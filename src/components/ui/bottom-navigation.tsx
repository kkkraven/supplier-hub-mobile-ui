'use client'

import React from 'react';
import { Home, Search, Factory, DollarSign, FileText, User } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { MobileNavButton } from './touch-button';

interface BottomNavigationProps {
  onNavigate?: (page: string) => void;
}

export function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
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
        case 'rfq':
          router.push('/rfq');
          break;
        case 'auth':
          router.push('/auth');
          break;
        default:
          router.push('/');
      }
    }
  };

  const navigationItems = [
    { key: 'landing', label: 'Главная', icon: Home, path: '/' },
    { key: 'catalog', label: 'Каталог', icon: Search, path: '/catalog' },
    { key: 'factories', label: 'Фабрики', icon: Factory, path: '/factories' },
    { key: 'pricing', label: 'Цены', icon: DollarSign, path: '/pricing' },
    ...(user ? [{ key: 'rfq', label: 'RFQ', icon: FileText, path: '/rfq' }] : [{ key: 'auth', label: 'Войти', icon: User, path: '/auth' }])
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow-lg">
      <div className="flex justify-around p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <MobileNavButton
              key={item.key}
              icon={<Icon className="w-5 h-5" />}
              label={item.label}
              isActive={isActive}
              onClick={() => handleNavigate(item.key)}
              className="flex-1"
            />
          );
        })}
      </div>
    </nav>
  );
}
