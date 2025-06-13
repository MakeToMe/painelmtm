'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, MtmUser } from '@/types/user'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, nome: string, whatsapp?: string) => Promise<void>
  signIn: (identifier: string, password: string, loginMethod: 'email' | 'whatsapp') => Promise<MtmUser>
  signOut: () => Promise<void>
  updateProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true
  })

  useEffect(() => {
    async function initAuth() {
      const token = Cookies.get('mtm_token')
      const user = localStorage.getItem('mtm_user')

      if (token && user) {
        try {
          const userData = JSON.parse(user)
          
          const resp = await fetch(`/api/auth/profile?email=${encodeURIComponent(userData.email)}`)
          if (!resp.ok) {
            console.error('Erro ao buscar perfil:', await resp.text())
            return
          }
          const currentUser = await resp.json()
          setState({ user: currentUser, profile: currentUser, loading: false })
        } catch (error) {
          console.error('Erro ao processar dados do usuário:', error)
          setState({ user: null, profile: null, loading: false })
        }
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    initAuth()
  }, [])

  const handleSignOut = () => {
    Cookies.remove('mtm_token')
    localStorage.removeItem('mtm_user')
    setState({ user: null, profile: null, loading: false })
    router.push('/')
  }

  useEffect(() => {
    // Se não tiver usuário logado, não precisa buscar o perfil
    if (!state.user?.email) return

    // Função para buscar o perfil do usuário
    const fetchUserProfile = async () => {
      try {
        // Verificar se o email do usuário existe
        if (!state.user?.email) {
          console.error('Email do usuário não disponível para buscar perfil')
          return
        }
        
        // Buscar o perfil do usuário usando a API
        const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(state.user.email)}`)
        
        if (!response.ok) {
          console.error('Erro ao buscar perfil do usuário')
          return
        }
        
        const profileData = await response.json()
        
        // Atualizar o estado com os novos dados
        setState(prev => ({
          ...prev,
          profile: profileData,
          user: profileData
        }))
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error)
      }
    }

    // Buscar o perfil inicialmente
    fetchUserProfile()
    
    // Não usamos mais polling automático, apenas a busca inicial
  }, [state.user?.email])

  async function fetchProfile() {
    const user = state.user
    console.log('fetchProfile - Estado atual:', state)
    console.log('fetchProfile - user:', user)
    if (!user?.email) {
      console.log('fetchProfile - Sem email do usuário, retornando')
      return
    }

    try {
      console.log('Buscando perfil para:', user.email)
      const resp = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      if (!resp.ok) {
        console.error('Erro ao buscar perfil:', await resp.text())
        return
      }
      const data = await resp.json()
      setState(prev => ({ ...prev, profile: data }))
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    }
  }

  // Função para atualizar o perfil do usuário após modificações
  async function updateProfile() {
    const user = state.user
    if (!user?.email) {
      console.log('updateProfile - Sem email do usuário, retornando')
      return
    }

    try {
      console.log('Atualizando perfil para:', user.email)
      // Buscar o perfil do usuário usando a API
      const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      
      if (!response.ok) {
        console.error('Erro ao buscar perfil atualizado do usuário')
        return
      }
      
      const profileData = await response.json()
      
      // Atualizar o estado com os novos dados
      setState(prev => ({
        ...prev,
        profile: profileData,
        user: profileData
      }))

      // Atualizar também o localStorage para manter a consistência
      localStorage.setItem('mtm_user', JSON.stringify(profileData))
      
      console.log('Perfil atualizado com sucesso:', profileData)
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error)
    }
  }

  async function signIn(identifier: string, password: string, loginMethod: 'email' | 'whatsapp') {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password, loginMethod })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Erro ao fazer login')

      const { token, user } = data

      Cookies.set('mtm_token', token, {
        expires: 7,
        path: '/',
        secure: true,
        sameSite: 'lax'
      })
      localStorage.setItem('mtm_user', JSON.stringify(user))

      setState(prev => ({ ...prev, user, profile: user, loading: false }))
      router.refresh()
      setTimeout(() => router.push('/dashboard'), 100)
      return user
    } catch (err) {
      console.error('Erro no signIn:', err)
      throw err
    }
  }

  async function signUp(email: string, password: string, nome: string, whatsapp?: string) {
    try {
      console.log('Iniciando cadastro com dados:', { email, nome, whatsapp })
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nome, whatsapp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      console.log('Resposta do cadastro:', data)
      
      // Verificar se temos os dados necessários
      if (!data.user) {
        throw new Error('Dados do usuário não retornados pelo servidor')
      }
      
      // Criar um objeto de usuário completo com os dados do cadastro
      const userObject = {
        ...data.user,
        // Garantir que temos os dados do formulário caso a API não retorne
        nome: data.user.nome || nome,
        email: data.user.email || email,
        whatsapp: data.user.whatsapp || whatsapp
      }
      
      // Salvar token no cookie para o middleware
      Cookies.set('mtm_token', data.token, { 
        expires: 1,
        path: '/',
        secure: true,
        sameSite: 'lax'
      })
      
      // Salvar dados completos do usuário
      localStorage.setItem('mtm_user', JSON.stringify(userObject))

      // Atualizar o estado com os dados completos
      setState(prev => ({ 
        ...prev, 
        user: userObject,
        profile: userObject,
        loading: false 
      }))
      
      // Buscar perfil completo do banco de dados
      await fetchProfile()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  async function signOut() {
    handleSignOut()
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
