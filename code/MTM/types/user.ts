import { User } from '@supabase/supabase-js'

export interface MtmUser {
  uid: string
  created_at: string
  nome: string | null
  perfil: string
  cpf: string | null
  whatsapp: string | null
  whatsapp_valid: boolean
  email: string | null
  email_valid: boolean
  cep: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  token: string | null
}

export interface AuthState {
  user: User | null
  profile: MtmUser | null
  loading: boolean
}
