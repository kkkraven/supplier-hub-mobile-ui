import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingPageProps {
  onNavigate?: (page: string) => void;
}

export function OnboardingPage({ onNavigate }: OnboardingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate?.('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад на главную
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Регистрация</h1>
        <p className="text-gray-600">Страница регистрации в разработке...</p>
      </div>
    </div>
  );
}