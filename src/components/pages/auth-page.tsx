'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthPageProps {
  onNavigate?: (page: string) => void;
  onSuccess?: () => void;
}

export function AuthPage({ onNavigate, onSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const { signIn, signUp } = useAuthContext();
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      switch (page) {
        case 'landing':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === "signin") {
        await signIn(formData.email, formData.password);
      } else {
        const userData = {
          full_name: formData.fullName,
          phone: formData.phone,
          role: 'user' as const
        };
        await signUp(formData.email, formData.password, userData);
      }
      onSuccess?.();
      handleNavigate('landing');
    } catch (error: any) {
      console.error('Authentication failed:', error);
      setError(error.message || 'Произошла ошибка при аутентификации');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null); // Очищаем ошибку при изменении полей
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null); // Очищаем ошибку при смене вкладки
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: ''
    }); // Очищаем форму при смене вкладки
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => handleNavigate('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад на главную
        </Button>

        <Tabs defaultValue="signin" onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Вход</TabsTrigger>
            <TabsTrigger value="signup">Регистрация</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle>Вход</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Пароль
                    </label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle>Регистрация</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Полное имя
                    </label>
                    <Input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Телефон
                    </label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Пароль
                    </label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
