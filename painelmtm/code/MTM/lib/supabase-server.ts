import { createClient } from '@supabase/supabase-js'

// Helper que cria um cliente Supabase autenticado como service-role.
// Usa variáveis sem o prefixo PUBLIC para evitar exposição ao frontend.
// Lança erro se variáveis não estiverem definidas para facilitar debug.
export function createSupabaseServer() {
  const url = process.env.NEXT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Variáveis NEXT_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas')
  }

  return createClient(url, serviceKey, {
    db: { schema: 'mtm' }
  })
}
