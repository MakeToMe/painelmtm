import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants'

// Configuração do cliente Supabase com opções adicionais
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export interface App {
  uid: string
  criada: string
  nome: string
  descricao: string | null
  icone: string | null
  categoria: string | null
}
