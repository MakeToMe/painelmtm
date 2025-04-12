'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, MtmUser } from '@/types/user'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { supabase } from '@/lib/supabase'
import { hashPassword, generateToken } from '@/lib/hash'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: Partial<MtmUser>) => Promise<void>
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
          
          // Busca os dados atualizados do usuário
          const { data: currentUser, error } = await supabase
            .from('mtm_users')
            .select('*')
            .eq('email', userData.email)
            .single()

          if (error || !currentUser) {
            console.error('Erro ao buscar usuário:', error)
            return
          }

          // Atualiza o estado com os dados mais recentes
          setState({ 
            user: currentUser,
            profile: currentUser,
            loading: false 
          })
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
        // Buscar o perfil do usuário usando a API
        const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(state.user!.email)}`)
        
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
      const { data, error } = await supabase
        .from('mtm_users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()

      console.log('Resultado busca perfil:', { data, error })

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      if (data) {
        console.log('Perfil encontrado, atualizando estado')
        setState(prev => {
          console.log('Estado anterior:', prev)
          const newState = { ...prev, profile: data }
          console.log('Novo estado:', newState)
          return newState
        })
      } else {
        console.log('Nenhum perfil encontrado para o email:', user.email)
      }
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
    console.log('Iniciando login:', { identifier, loginMethod })
    try {
      // Hash da senha
      const hashedPassword = await hashPassword(password);
      console.log('Hash gerado:', hashedPassword);
      console.log('Hash esperado:', 'c6ad5fd02239a677d8ad60c0161b10030a4f7dec12c2cff33fa055c7f7bd753b');
      console.log('Hash igual?', hashedPassword === 'c6ad5fd02239a677d8ad60c0161b10030a4f7dec12c2cff33fa055c7f7bd753b');

      // Buscar usuário diretamente no Supabase usando a chave ANON
      console.log('Buscando usuário com:', {
        [loginMethod === 'whatsapp' ? 'whatsapp' : 'email']: identifier,
        password: hashedPassword
      });

      const { data: user, error } = await supabase
        .from('mtm_users')
        .select('*')
        .eq('password', hashedPassword)
        .eq(loginMethod === 'whatsapp' ? 'whatsapp' : 'email', identifier)
        .maybeSingle();

      console.log('Resultado da busca:', { user, error });

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        throw new Error('Erro ao fazer login');
      }

      if (!user) {
        // Vamos verificar se o usuário existe, independente da senha
        console.log('Usuário não encontrado, verificando se existe...');
        
        const { data: userExists } = await supabase
          .from('mtm_users')
          .select('email, password')
          .eq(loginMethod === 'whatsapp' ? 'whatsapp' : 'email', identifier)
          .maybeSingle();

        console.log('Usuário existe?', userExists);
        if (userExists) {
          console.log('Hash no banco:', userExists.password);
          console.log('Hash gerado:', hashedPassword);
          console.log('Usuário existe mas senha está incorreta');
          throw new Error('Senha incorreta');
        } else {
          console.log('Usuário não encontrado');
          throw new Error(loginMethod === 'whatsapp' ? 'WhatsApp não cadastrado' : 'Email não cadastrado');
        }
      }

      // Gerar token
      const token = await generateToken(user.email);

      // Salvar token no usuário
      const { error: updateError } = await supabase
        .from('mtm_users')
        .update({ token })
        .eq('email', user.email);

      if (updateError) {
        console.error('Erro ao salvar token:', updateError);
        throw new Error('Erro ao fazer login');
      }

      // Salvar dados localmente com opções explícitas para garantir que o cookie seja acessível
      Cookies.set('mtm_token', token, { 
        expires: 7,  // 7 dias
        path: '/',
        secure: true,
        sameSite: 'lax'
      });
      localStorage.setItem('mtm_user', JSON.stringify(user));

      // Atualizar estado
      setState(prev => ({
        ...prev,
        user,
        profile: user,
        loading: false
      }));

      // Forçar refresh para garantir que o middleware reconheça o novo token
      router.refresh();
      
      // Adicionar um pequeno atraso antes de navegar para o dashboard
      // para garantir que o refresh seja concluído
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
      return user;
    } catch (error: any) {
      console.error('Erro no signIn:', error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, userData: Partial<MtmUser>) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, ...userData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // Salvar token no cookie para o middleware
      Cookies.set('mtm_token', data.token, { 
        expires: 1,
        path: '/',
        secure: true,
        sameSite: 'lax'
      })
      localStorage.setItem('mtm_user', JSON.stringify(data.user))

      setState(prev => ({ 
        ...prev, 
        user: data.user,
        loading: false 
      }))
      
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
