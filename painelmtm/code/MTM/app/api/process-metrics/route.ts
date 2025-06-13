import { NextResponse, NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    const timeWindow = searchParams.get('timeWindow') || '1min'
    const requestId = searchParams.get('_r') || 'unknown'
    
    console.log(`[${requestId}] API process-metrics: Recebida requisição para IP ${ip}, janela de tempo: ${timeWindow}`)
    
    if (!ip) {
      console.error(`[${requestId}] API process-metrics: IP do servidor não fornecido`)
      return NextResponse.json({ error: 'IP do servidor é obrigatório' }, { status: 400 })
    }

    // Cliente Supabase centralizado (service-role)
    const supabase = createSupabaseServer()

    // Calcular o timestamp de início com base na janela de tempo
    const now = new Date()
    let startTime = new Date(now)
    let limit = 1
    
    // Ajustar o tempo de início com base na janela selecionada
    switch (timeWindow) {
      case '1min':
        startTime.setMinutes(now.getMinutes() - 1)
        limit = 1 // Apenas o mais recente
        break
      case '10min':
        startTime.setMinutes(now.getMinutes() - 10)
        limit = 3 // Buscar mais registros para ter uma média
        break
      case '30min':
        startTime.setMinutes(now.getMinutes() - 30)
        limit = 5 // Buscar mais registros para ter uma média
        break
      default:
        startTime.setMinutes(now.getMinutes() - 1)
        limit = 1
    }
    
    // Buscar métricas de processos com base na janela de tempo
    const timestamp = new Date().toISOString()
    console.log(`[${requestId}] API process-metrics: Buscando dados de ${startTime.toISOString()} até ${timestamp}`)
    
    const { data, error } = await supabase
      .from('process_metrics')
      .select('*')
      .eq('server_ip', ip)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error(`[${requestId}] Erro ao buscar métricas de processos:`, error)
      return NextResponse.json({ error: 'Erro ao buscar métricas de processos' }, { status: 500 })
    }
    
    // Log dos dados encontrados
    if (data && data.length > 0) {
      console.log(`[${requestId}] API process-metrics: Encontrados ${data.length} registros, mais recente de ${data[0].created_at}`, {
        cores_count: data[0].cpu_cores?.length || 0,
        cores_sample: data[0].cpu_cores?.slice(0, 2) || [],
        processes_count: data[0].processes?.by_cpu?.length || 0
      })
    } else {
      console.log(`[${requestId}] API process-metrics: Nenhum dado encontrado para o período selecionado`)
    }

    // Quando não houver dados reais, retornar array vazio
    if (!data || data.length === 0) {
      console.log(`[${requestId}] API process-metrics: Nenhum dado encontrado para o servidor ${ip}`)
      
      // Retornar array vazio para indicar que não há dados disponíveis
      return NextResponse.json([])      
    }
    
    // Adicionar headers para evitar cache
    const headers = new Headers()
    headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.append('Pragma', 'no-cache')
    headers.append('Expires', '0')
    headers.append('Surrogate-Control', 'no-store')
    
    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Erro na API de métricas de processos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
