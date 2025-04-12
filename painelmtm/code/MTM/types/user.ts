import { User } from '@supabase/supabase-js'

export interface MtmUser {
  uid: string
  created_at: string
  nome: string | null
  perfil: string | null
  documento: string | null
  whatsapp: string | null
  whatsapp_valid: boolean | null
  email: string
  email_valid: boolean | null
  cep: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  token: string | null
  password: string | null
  email_token: string | null
  whatsapp_token: string | null
  admin: boolean | null
}

export interface AuthState {
  user: User | null
  profile: MtmUser | null
  loading: boolean
}
