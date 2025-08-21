import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, EyeOff, Keyboard, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

interface AdminLoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onNavigate?: (page: string) => void;
}

export function AdminLoginPage({ onLogin, onNavigate }: AdminLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = onLogin(username, password);
    
    if (!success) {
      setError('Неверный логин или пароль');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate?.('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад на главную
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Админ панель
            </CardTitle>
            <p className="text-gray-600">
              Вход в систему управления Factura Supplier Hub
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-warning bg-warning/10">
                  <AlertDescription className="text-warning">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 gradient-factura"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти в админ панель'}
              </Button>
            </form>

            {/* Демо доступ */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Демо доступ:</strong><br />
                Логин: admin<br />
                Пароль: login
              </p>
            </div>

            {/* Информация о скрытом доступе */}
            <Alert className="mt-4 border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Keyboard className="w-4 h-4" />
                  <strong>Скрытый доступ:</strong>
                </div>
                На главной странице наберите на клавиатуре: <code className="bg-white px-2 py-1 rounded">admin</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}