"use client";

import React from 'react';
import { supabase } from '../../lib/supabase';

export default function EnvTest() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const [connectionTest, setConnectionTest] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('count').limit(1);
      if (error) {
        setConnectionTest(`❌ Ошибка: ${error.message}`);
      } else {
        setConnectionTest('✅ Подключение к Supabase работает!');
      }
    } catch (err) {
      setConnectionTest(`❌ Ошибка подключения: ${err}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Тест переменных окружения
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">NEXT_PUBLIC_SUPABASE_URL:</h3>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-2">
              {supabaseUrl || "❌ НЕ НАЙДЕНО"}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h3>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-2">
              {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : "❌ НЕ НАЙДЕНО"}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Статус переменных:</h3>
            <p className="text-lg font-bold mt-2">
              {supabaseUrl && supabaseAnonKey ? (
                <span className="text-green-600">✅ Переменные загружены</span>
              ) : (
                <span className="text-yellow-600">⚠️ Переменные не найдены (используются fallback значения)</span>
              )}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Тест подключения к Supabase:</h3>
            <button 
              onClick={testConnection}
              disabled={isLoading}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Проверяем...' : 'Проверить подключение'}
            </button>
            {connectionTest && (
              <p className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono">
                {connectionTest}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <a 
            href="/" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ← Назад на главную
          </a>
        </div>
      </div>
    </div>
  );
}
