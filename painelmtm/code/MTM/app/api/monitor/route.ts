import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
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
    
    // Obter o IP do servidor e o intervalo de tempo da query string
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get('ip')
    const timeRange = searchParams.get('timeRange') || '30min'
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP do servidor é obrigatório' },
        { status: 400 }
      )
    }
    
    // Calcular o timestamp de início com base no intervalo de tempo
    const now = new Date()
    let startTime = new Date(now)
    let useAggregation = false
    let samplingInterval = 1 // Pegar 1 a cada X registros
    
    // Ajustar o tempo de início e a estratégia de amostragem com base no intervalo selecionado
    switch (timeRange) {
      case '30min':
        startTime.setMinutes(now.getMinutes() - 30)
        break
      case '1h':
        startTime.setHours(now.getHours() - 1)
        break
      case '3h':
        startTime.setHours(now.getHours() - 3)
        samplingInterval = 2 // Pegar 1 a cada 2 registros (reduz pela metade)
        break
      case '6h':
        startTime.setHours(now.getHours() - 6)
        samplingInterval = 4 // Pegar 1 a cada 4 registros
        break
      case '12h':
        startTime.setHours(now.getHours() - 12)
        samplingInterval = 8 // Pegar 1 a cada 8 registros
        break
      case '24h':
        startTime.setHours(now.getHours() - 24)
        samplingInterval = 15 // Pegar 1 a cada 15 registros
        break
      default:
        startTime.setMinutes(now.getMinutes() - 30)
    }
    
    console.log(`Buscando dados para intervalo: ${timeRange}, de ${startTime.toISOString()} até agora`)
    console.log(`Estratégia: ${useAggregation ? 'Agregação' : 'Amostragem'}, intervalo: ${samplingInterval}`)
    
    // Buscar os dados de monitoramento para o período especificado
    const { data, error } = await supabase
      .from('vm_stats')
      .select('*')
      .eq('ip', ip)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar dados de monitoramento:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar dados de monitoramento' },
        { status: 500 }
      )
    }
    
    // Se não houver dados, retornar dados simulados para teste
    if (!data || data.length === 0) {
      // Criar dados simulados para teste (remover em produção)
      const mockData = [{
        uid: 'mock-uid',
        created_at: new Date().toISOString(),
        titular: 'Teste',
        ip: ip,
        mem_total: 8192, // 8GB em MB
        mem_usada: 4096, // 4GB em MB
        mem_usada_p: 50, // 50%
        mem_disponivel_p: 50, // 50%
        mem_disponivel: 4096, // 4GB em MB
        cpu_total: 100,
        cpu_livre: 70,
        cpu_usada: 30, // 30%
        disco_total: 100, // 100GB
        disco_usado: 60, // 60GB
        disco_livre: 40, // 40GB
        disco_uso_p: 60, // 60%
        disco_livre_p: 40 // 40%
      }]
      
      console.log('Retornando dados simulados para teste')
      return NextResponse.json(mockData)
    }
    
    console.log(`Dados de monitoramento encontrados: ${data.length} registros`)
    
    // Aplicar amostragem para reduzir o volume de dados enviados ao cliente
    let processedData = data
    
    if (samplingInterval > 1) {
      // Ordenar por data (mais recente primeiro)
      processedData = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      // Garantir que temos o registro mais recente
      const mostRecent = processedData[0]
      
      // Aplicar amostragem (pegar 1 a cada N registros)
      processedData = processedData.filter((_, index) => index === 0 || index % samplingInterval === 0)
      
      console.log(`Dados após amostragem: ${processedData.length} registros`)
    }
    
    return NextResponse.json(processedData)
  } catch (error) {
    console.error('Erro na API de monitoramento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
