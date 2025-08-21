import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { ArrowLeft } from 'lucide-react'

interface SupabaseTestPageProps {
  onNavigate?: (page: string) => void
}

export function SupabaseTestPage({ onNavigate }: SupabaseTestPageProps) {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const testSupabaseConnection = async () => {
    setStatus('Проверяем подключение к Supabase...')
    setError('')

    try {
      // Проверяем, есть ли переменные окружения
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Переменные окружения Supabase не настроены. Создайте файл .env.local с вашими ключами.')
      }

      // Динамически импортируем Supabase для проверки
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Пробуем подключиться к базе данных
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1)

      if (error) {
        throw new Error(`Ошибка подключения к базе данных: ${error.message}`)
      }

      setStatus('✅ Подключение к Supabase успешно! База данных доступна.')
    } catch (err: any) {
      setError(err.message)
      setStatus('❌ Ошибка подключения к Supabase')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate?.('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад на главную
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Тестирование Supabase
            </CardTitle>
            <p className="text-gray-600">
              Проверьте подключение к Supabase и настройку базы данных
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSupabaseConnection} className="w-full">
              Проверить подключение к Supabase
            </Button>

            {status && (
              <Alert>
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Инструкции по настройке</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Создайте проект Supabase</h3>
              <p className="text-sm text-gray-600 mb-2">
                Перейдите на <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> и создайте новый проект
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Получите ключи API</h3>
              <p className="text-sm text-gray-600 mb-2">
                В настройках проекта (Settings → API) скопируйте Project URL и anon public key
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Создайте файл .env.local</h3>
              <p className="text-sm text-gray-600 mb-2">
                В папке web/ создайте файл .env.local со следующим содержимым:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Создайте базу данных</h3>
              <p className="text-sm text-gray-600 mb-2">
                В SQL Editor Supabase выполните содержимое файла supabase/migrations/001_initial_schema.sql
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Перезапустите сервер</h3>
              <p className="text-sm text-gray-600 mb-2">
                Остановите сервер разработки (Ctrl+C) и запустите заново: npm run dev
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
