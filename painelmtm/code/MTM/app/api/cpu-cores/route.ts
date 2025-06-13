import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    
    if (!ip) {
      return NextResponse.json({ error: 'IP do servidor é obrigatório' }, { status: 400 })
    }

    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: 'mtm'
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )

    // Buscar os dados mais recentes de CPU cores
    const { data, error } = await supabase
      .from('vm_stats')
      .select('cpu_cores, created_at')
      .eq('ip', ip)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Erro ao buscar dados de CPU cores:', error)
      return NextResponse.json({ error: 'Erro ao buscar dados de CPU cores' }, { status: 500 })
    }
    
    // Se não houver dados, retornar array vazio
    if (!data || data.length === 0 || !data[0].cpu_cores) {
      return NextResponse.json([])
    }
    
    // Retornar os dados de CPU cores
    return NextResponse.json(data[0].cpu_cores)
  } catch (error) {
    console.error('Erro na API de CPU cores:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
