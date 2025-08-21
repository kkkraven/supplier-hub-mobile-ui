"use client";

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SupabaseTestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Проверяем подключение к Supabase...');

    try {
      // Проверяем, что переменные окружения загружены
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Переменные окружения Supabase не настроены. Создайте файл .env.local с NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }

      // Динамически импортируем Supabase для проверки
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Тестируем подключение
      const { data, error } = await supabase.from('categories').select('count').limit(1);

      if (error) {
        throw new Error(`Ошибка подключения к базе данных: ${error.message}`);
      }

      setStatus('success');
      setMessage('✅ Подключение к Supabase успешно! База данных доступна.');
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Ошибка: ${error.message}`);
    }
  };

  const testAuth = async () => {
    setStatus('loading');
    setMessage('Тестируем аутентификацию...');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Переменные окружения не настроены');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Пытаемся зарегистрировать тестового пользователя
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(`Ошибка регистрации: ${error.message}`);
      }

      setStatus('success');
      setMessage('✅ Регистрация успешна! Проверьте email для подтверждения.');
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Ошибка аутентификации: ${error.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Тестирование Supabase
          </h1>
          <p className="text-gray-600">
            Проверьте настройку подключения к Supabase
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Настройка переменных окружения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supabase-url">NEXT_PUBLIC_SUPABASE_URL</Label>
                <Input
                  id="supabase-url"
                  value={process.env.NEXT_PUBLIC_SUPABASE_URL || 'Не настроено'}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="supabase-key">NEXT_PUBLIC_SUPABASE_ANON_KEY</Label>
                <Input
                  id="supabase-key"
                  value={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
                    'Не настроено'}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Тестирование подключения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testConnection} disabled={status === 'loading'}>
                Проверить подключение
              </Button>
              
              {status !== 'idle' && (
                <Alert>
                  {getStatusIcon()}
                  <AlertDescription className="ml-2">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Тестирование аутентификации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
              <Button onClick={testAuth} disabled={status === 'loading'}>
                Тестировать регистрацию
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Инструкции по настройке</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Создайте проект Supabase</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Перейдите на <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                  <li>Создайте новый проект</li>
                  <li>Выберите регион и введите пароль для БД</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Получите ключи API</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>В панели Supabase перейдите в Settings → API</li>
                  <li>Скопируйте Project URL и anon public key</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Создайте файл .env.local</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Создайте файл .env.local в папке web/</li>
                  <li>Добавьте переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">4. Создайте базу данных</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>В SQL Editor выполните содержимое файла supabase/migrations/001_initial_schema.sql</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">5. Настройте аутентификацию</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>В Authentication → Settings добавьте Site URL: http://localhost:3000</li>
                  <li>Включите Email auth</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


