import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_SUPABASE_URL) {
  throw new Error('NEXT_SUPABASE_URL is required')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

const supabaseUrl = process.env.NEXT_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, serviceKey)
