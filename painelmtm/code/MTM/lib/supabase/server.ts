import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
