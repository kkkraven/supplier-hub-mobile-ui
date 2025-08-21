'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type Factory = Database['public']['Tables']['factories']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type RFQ = Database['public']['Tables']['rfqs']['Row']
type Message = Database['public']['Tables']['messages']['Row']

// Хук для аутентификации
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Получаем текущую сессию
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(userData)
      }
      setLoading(false)
    }

    getSession()

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUser(userData)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('📝 Попытка регистрации для:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('❌ Ошибка регистрации:', error.message)
        
        // Более понятные сообщения об ошибках
        if (error.message.includes('User already registered')) {
          throw new Error('Пользователь с таким email уже зарегистрирован. Попробуйте войти.')
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Пароль должен содержать минимум 6 символов.')
        } else if (error.message.includes('Unable to validate email address')) {
          throw new Error('Некорректный email адрес.')
        } else {
          throw new Error(`Ошибка регистрации: ${error.message}`)
        }
      }

      if (data.user) {
        console.log('👤 Создание профиля пользователя...')
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ 
            id: data.user.id, 
            email, 
            role: 'user',
            ...userData 
          }])

        if (profileError) {
          console.error('❌ Ошибка создания профиля:', profileError.message)
          throw new Error(`Ошибка создания профиля: ${profileError.message}`)
        }
        
        console.log('✅ Профиль пользователя создан')
      }

      console.log('✅ Регистрация успешна для:', email)
      return data
    } catch (error: any) {
      console.error('❌ Критическая ошибка при регистрации:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Попытка входа для:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Ошибка входа:', error.message)
        
        // Более понятные сообщения об ошибках
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Неверный email или пароль. Проверьте данные или зарегистрируйтесь.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Подтвердите ваш email адрес, проверив почту.')
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Слишком много попыток входа. Попробуйте позже.')
        } else {
          throw new Error(`Ошибка входа: ${error.message}`)
        }
      }

      console.log('✅ Успешный вход для:', email)
      return data
    } catch (error: any) {
      console.error('❌ Критическая ошибка при входе:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }
}

// Хук для работы с фабриками
export function useFactories() {
  const [factories, setFactories] = useState<Factory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFactories = async (filters?: {
    city?: string
    segment?: string
    category?: string
  }) => {
    setLoading(true)
    let query = supabase.from('factories').select('*')

    if (filters?.city) {
      query = query.eq('city', filters.city)
    }
    if (filters?.segment) {
      query = query.eq('segment', filters.segment)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    setFactories(data || [])
    setLoading(false)
  }

  const createFactory = async (factoryData: Omit<Factory, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('factories')
      .insert([factoryData])
      .select()
      .single()

    if (error) throw error
    setFactories(prev => [data, ...prev])
    return data
  }

  const updateFactory = async (id: string, updates: Partial<Factory>) => {
    const { data, error } = await supabase
      .from('factories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setFactories(prev => prev.map(f => f.id === id ? data : f))
    return data
  }

  useEffect(() => {
    fetchFactories()
  }, [])

  return {
    factories,
    loading,
    fetchFactories,
    createFactory,
    updateFactory,
  }
}

// Хук для работы с категориями
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    fetchCategories,
  }
}

// Хук для работы с RFQ
export function useRFQs() {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRFQs = async (userId?: string) => {
    setLoading(true)
    let query = supabase.from('rfqs').select(`
      *,
      categories (name, slug),
      users (full_name, company_name)
    `)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    setRfqs(data || [])
    setLoading(false)
  }

  const createRFQ = async (rfqData: Omit<RFQ, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('rfqs')
      .insert([rfqData])
      .select()
      .single()

    if (error) throw error
    setRfqs(prev => [data, ...prev])
    return data
  }

  const updateRFQ = async (id: string, updates: Partial<RFQ>) => {
    const { data, error } = await supabase
      .from('rfqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setRfqs(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  return {
    rfqs,
    loading,
    fetchRFQs,
    createRFQ,
    updateRFQ,
  }
}

// Хук для работы с сообщениями
export function useMessages(rfqId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    if (!rfqId) return

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (full_name, avatar_url),
        receiver:users!messages_receiver_id_fkey (full_name, avatar_url)
      `)
      .eq('rfq_id', rfqId)
      .order('created_at', { ascending: true })

    if (error) throw error
    setMessages(data || [])
    setLoading(false)
  }

  const sendMessage = async (messageData: Omit<Message, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()

    if (error) throw error
    setMessages(prev => [...prev, data])
    return data
  }

  const markAsRead = async (messageId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error
    setMessages(prev => prev.map(m => m.id === messageId ? data : m))
    return data
  }

  useEffect(() => {
    if (rfqId) {
      fetchMessages()
    }
  }, [rfqId])

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead,
  }
}
