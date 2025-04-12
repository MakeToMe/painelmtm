'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

/**
 * Hook personalizado para atualizar o perfil do usuário
 * 
 * Este hook pode ser usado em qualquer componente para garantir que o perfil
 * do usuário seja atualizado ao montar o componente e também fornece uma função
 * para atualizar o perfil manualmente quando necessário.
 * 
 * @param refreshOnMount Se true, atualiza o perfil ao montar o componente (padrão: true)
 * @returns Uma função para atualizar o perfil manualmente
 */
export function useProfileRefresh(refreshOnMount = true) {
  const { updateProfile } = useAuth()
  
  // Atualizar o perfil ao montar o componente, se solicitado
  useEffect(() => {
    if (refreshOnMount) {
      updateProfile()
    }
  }, [refreshOnMount])
  
  // Retorna a função para atualizar o perfil manualmente
  return { refreshProfile: updateProfile }
}
