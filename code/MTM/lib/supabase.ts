import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

const supabaseUrl = 'https://studio.rardevops.com'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configuração do cliente Supabase com opções adicionais
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: {
      schema: 'mtm'  // Schema correto é mtm
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Exportar tipos
export interface App {
  uid: string
  criada: string
  nome: string
  descricao: string | null
  icone: string | null
  categoria: string | null
}
