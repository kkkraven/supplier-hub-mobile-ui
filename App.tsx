import React, { useState } from 'react';
import { LandingPage } from './components/pages/landing-page';
import { CatalogPage } from './components/pages/catalog-page';
import { PricingPage } from './components/pages/pricing-page';
import { OnboardingPage } from './components/pages/onboarding-page';
import { CategoryDetailPage } from './components/pages/category-detail-page';
import { AdminLoginPage } from './components/pages/admin-login-page';
import { AdminDashboardPage } from './components/pages/admin-dashboard-page';
import { Navbar } from './components/navbar';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleNavigate = (page: string, category?: string) => {
    setCurrentPage(page);
    if (category) {
      setSelectedCategory(category);
    }
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'login') {
      setIsAdminAuthenticated(true);
      setCurrentPage('admin-dashboard');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentPage('landing');
  };

  // Скрытый доступ к админ панели через комбинацию клавиш
  React.useEffect(() => {
    let keySequence: string[] = [];
    
    const handleKeyPress = (e: KeyboardEvent) => {
      keySequence.push(e.key.toLowerCase());
      
      // Сохраняем только последние 5 нажатий
      if (keySequence.length > 5) {
        keySequence = keySequence.slice(-5);
      }
      
      // Проверяем секретную комбинацию: "admin"
      if (keySequence.join('') === 'admin') {
        setCurrentPage('admin-login');
        keySequence = []; // Сбрасываем последовательность
      }
      
      // Очищаем последовательность через 2 секунды бездействия
      setTimeout(() => {
        keySequence = [];
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'catalog':
        return <CatalogPage onNavigate={handleNavigate} />;
      case 'pricing':
        return <PricingPage onNavigate={handleNavigate} />;
      case 'onboarding':
        return <OnboardingPage onNavigate={handleNavigate} />;
      case 'category-detail':
        return <CategoryDetailPage category={selectedCategory} onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLoginPage onLogin={handleAdminLogin} onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return isAdminAuthenticated ? (
          <AdminDashboardPage onNavigate={handleNavigate} onLogout={handleAdminLogout} />
        ) : (
          <AdminLoginPage onLogin={handleAdminLogin} onNavigate={handleNavigate} />
        );
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={handleAdminLogout}
        showAdminButton={false} // Скрываем кнопку админ панели
      />
      <div className="animate-fade-in">
        {renderCurrentPage()}
      </div>
      <Toaster />
    </div>
  );
}