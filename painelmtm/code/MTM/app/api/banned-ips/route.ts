import { NextResponse, NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    
    if (!ip) {
      return NextResponse.json({ error: 'IP do servidor é obrigatório' }, { status: 400 })
    }

    // Cliente Supabase backend usando chave de serviço
    const supabase = createSupabaseServer()

    // Buscar a contagem total de IPs banidos ativos para este servidor
    const { count, error: countError } = await supabase
      .from('banned_ips')
      .select('*', { count: 'exact', head: true })
      .eq('servidor_ip', ip)
      .eq('active', true)
    
    if (countError) {
      console.error('Erro ao contar IPs banidos:', countError)
      return NextResponse.json({ error: 'Erro ao contar IPs banidos' }, { status: 500 })
    }
    
    // Buscar os IPs banidos mais recentes
    const { data: recentBans, error: recentError } = await supabase
      .from('banned_ips')
      .select('ip_banido, created_at')
      .eq('servidor_ip', ip)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentError) {
      console.error('Erro ao buscar IPs banidos recentes:', recentError)
      return NextResponse.json({ error: 'Erro ao buscar IPs banidos recentes' }, { status: 500 })
    }
    
    // Retornar os dados
    return NextResponse.json({
      count: count || 0,
      recent: recentBans || []
    })
  } catch (error) {
    console.error('Erro na API de IPs banidos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
