'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useSupabase'
import type { Database } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
