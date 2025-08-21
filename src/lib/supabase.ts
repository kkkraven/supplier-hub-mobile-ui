import { createClient } from '@supabase/supabase-js'

// Проверяем наличие переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback значения для разработки (замените на свои реальные значения)
const defaultUrl = 'https://lhdjfkxrislqiivafsew.supabase.co'
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZGpma3hyaXNscWlpdmFmc2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDYwOTUsImV4cCI6MjA3MTAyMjA5NX0.oIbxSVzvWBOL8Jri8JX76aKuR_sWGrqUSwqLbkAOtvQ'

// Используем переменные окружения или fallback значения
const finalUrl = supabaseUrl || defaultUrl
const finalKey = supabaseAnonKey || defaultKey

// Выводим предупреждение в консоль если используются fallback значения
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase: Используются fallback значения. Создайте файл .env.local с вашими реальными ключами.')
  console.warn('📝 Инструкции: скопируйте env-example.txt в .env.local и замените значения')
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Добавляем обработку ошибок аутентификации
    debug: process.env.NODE_ENV === 'development'
  }
})

// Функция для проверки подключения
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('❌ Ошибка подключения к Supabase:', error.message)
      return false
    }
    console.log('✅ Подключение к Supabase успешно')
    return true
  } catch (error) {
    console.error('❌ Критическая ошибка Supabase:', error)
    return false
  }
}

// Типы для базы данных
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'factory'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'factory'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'factory'
          created_at?: string
          updated_at?: string
        }
      }
      factories: {
        Row: {
          id: string
          legal_name_cn: string
          legal_name_en: string | null
          city: string
          province: string | null
          segment: 'low' | 'mid' | 'mid+' | 'high'
          address_cn: string
          lat_lng: { lat: number; lng: number } | null
          wechat_id: string
          phone: string
          email: string | null
          moq_units: number | null
          lead_time_days: number | null
          capacity_month: number | null
          certifications: Record<string, boolean> | null
          interaction_level: 0 | 1 | 2 | 3
          last_interaction_date: string | null
          avatar_url: string | null
          last_verified: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          legal_name_cn: string
          legal_name_en?: string | null
          city: string
          province?: string | null
          segment?: 'low' | 'mid' | 'mid+' | 'high'
          address_cn: string
          lat_lng?: { lat: number; lng: number } | null
          wechat_id: string
          phone: string
          email?: string | null
          moq_units?: number | null
          lead_time_days?: number | null
          capacity_month?: number | null
          certifications?: Record<string, boolean> | null
          interaction_level?: 0 | 1 | 2 | 3
          last_interaction_date?: string | null
          avatar_url?: string | null
          last_verified?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          legal_name_cn?: string
          legal_name_en?: string | null
          city?: string
          province?: string | null
          segment?: 'low' | 'mid' | 'mid+' | 'high'
          address_cn?: string
          lat_lng?: { lat: number; lng: number } | null
          wechat_id?: string
          phone?: string
          email?: string | null
          moq_units?: number | null
          lead_time_days?: number | null
          capacity_month?: number | null
          certifications?: Record<string, boolean> | null
          interaction_level?: 0 | 1 | 2 | 3
          last_interaction_date?: string | null
          avatar_url?: string | null
          last_verified?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          image_url: string | null
          factory_count: number
          avg_moq: string
          avg_lead_time: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          image_url?: string | null
          factory_count?: number
          avg_moq: string
          avg_lead_time: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          image_url?: string | null
          factory_count?: number
          avg_moq?: string
          avg_lead_time?: string
          created_at?: string
        }
      }
      rfqs: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string
          quantity: number
          deadline: string
          status: 'draft' | 'sent' | 'quoted' | 'closed'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description: string
          quantity: number
          deadline: string
          status?: 'draft' | 'sent' | 'quoted' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          description?: string
          quantity?: number
          deadline?: string
          status?: 'draft' | 'sent' | 'quoted' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          rfq_id: string
          sender_id: string
          receiver_id: string
          content: string
          attachments: string[] | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rfq_id: string
          sender_id: string
          receiver_id: string
          content: string
          attachments?: string[] | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rfq_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          attachments?: string[] | null
          read_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
