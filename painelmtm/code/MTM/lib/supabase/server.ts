import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

if (!process.env.NEXT_SUPABASE_URL) {
  throw new Error('NEXT_SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createSupabaseClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': `supabase-js/2.x`,
        },
        fetch: (url, options) => {
          const headers = new Headers(options?.headers)
          if (cookieStore.get('sb-access-token')?.value) {
            headers.set('Authorization', `Bearer ${cookieStore.get('sb-access-token')?.value}`)
          }
          return fetch(url, { ...options, headers })
        }
      }
    }
  )
}
