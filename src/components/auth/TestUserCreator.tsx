'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { CheckCircle, XCircle, User, Mail, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function TestUserCreator() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const testCredentials = {
    email: 'test@example.com',
    password: 'test123456',
    fullName: 'Тестовый Пользователь'
  }

  const createTestUser = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      console.log('🧪 Создание тестового пользователя...')
      
      // Сначала пытаемся зарегистрировать пользователя
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testCredentials.email,
        password: testCredentials.password,
      })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setStatus('success')
          setMessage('✅ Тестовый пользователь уже существует! Можете использовать его для входа.')
          return
        }
        throw signUpError
      }

      if (signUpData.user) {
        // Создаем профиль пользователя в таблице users
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: signUpData.user.id,
            email: testCredentials.email,
            full_name: testCredentials.fullName,
            role: 'user'
          }])

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.warn('Ошибка создания профиля:', profileError.message)
        }
      }

      setStatus('success')
      setMessage('✅ Тестовый пользователь создан успешно! Теперь можете войти с этими данными.')
      
    } catch (error: any) {
      console.error('❌ Ошибка создания тестового пользователя:', error)
      setStatus('error')
      setMessage(`❌ Ошибка: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      console.log('🔑 Тестирование входа...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password,
      })

      if (error) {
        throw error
      }

      setStatus('success')
      setMessage('✅ Вход выполнен успешно! Аутентификация работает корректно.')
      
      // Выходим из системы после теста
      setTimeout(async () => {
        await supabase.auth.signOut()
        console.log('🚪 Автоматический выход из тестовой сессии')
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Ошибка тестирования входа:', error)
      setStatus('error')
      setMessage(`❌ Ошибка входа: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Тестовый пользователь
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">Данные для тестирования:</p>
          <div className="bg-gray-50 p-3 rounded border space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-mono">{testCredentials.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="font-mono">{testCredentials.password}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={createTestUser} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Создание...' : 'Создать тестового пользователя'}
          </Button>
          
          <Button 
            onClick={testLogin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Тестирование...' : 'Тестировать вход'}
          </Button>
        </div>

        {message && (
          <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            {getStatusIcon()}
            <AlertDescription className="ml-2">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500">
          <p>💡 После создания тестового пользователя вы сможете использовать эти данные для входа в систему.</p>
        </div>
      </CardContent>
    </Card>
  )
}

