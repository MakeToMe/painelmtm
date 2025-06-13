import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Cliente Supabase centralizado (service-role)
    const supabase = createSupabaseServer()
    
    // Obter o IP do servidor e o intervalo de tempo da query string
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get('ip')
    const timeRange = searchParams.get('timeRange') || '30min'
    const requestId = searchParams.get('_r') || 'unknown'
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP do servidor é obrigatório' },
        { status: 400 }
      )
    }
    
    // Calcular o timestamp de início com base no intervalo de tempo
    const now = new Date()
    let startTime = new Date(now)
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
    
    console.log(`[${requestId}] Buscando dados para intervalo: ${timeRange}, de ${startTime.toISOString()} até agora`)
    console.log(`[${requestId}] Estratégia: Amostragem, intervalo: ${samplingInterval}`)
    
    // Buscar os dados de monitoramento para o período especificado da tabela process_metrics
    const { data, error } = await supabase
      .from('process_metrics')
      .select('*')
      .eq('server_ip', ip)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error(`[${requestId}] Erro ao buscar dados de monitoramento:`, error)
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
        server_ip: ip,
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
      
      console.log(`[${requestId}] Retornando dados simulados para teste`)
      return NextResponse.json(mockData)
    }
    
    console.log(`[${requestId}] Dados de monitoramento encontrados: ${data.length} registros`)
    
    // Transformar os dados da tabela process_metrics para o formato esperado pelo componente
    const transformedData = data.map(item => {
      // Calcular porcentagens se não estiverem presentes
      const mem_usada_p = typeof item.mem_usada === 'number' && typeof item.mem_total === 'number' 
        ? Number(((Number(item.mem_usada) / Number(item.mem_total)) * 100).toFixed(2))
        : 0;
      
      const mem_disponivel = typeof item.mem_total === 'number' && typeof item.mem_usada === 'number'
        ? Number(item.mem_total) - Number(item.mem_usada)
        : 0;
      
      const mem_disponivel_p = 100 - mem_usada_p;
      
      const cpu_livre = typeof item.cpu_total === 'number' && typeof item.cpu_usada === 'number'
        ? Number(item.cpu_total) - Number(item.cpu_usada)
        : 0;
      
      // Calcular porcentagens de disco se disponíveis
      const disco_uso_p = typeof item.disco_total === 'number' && typeof item.disco_usado === 'number'
        ? Number(((Number(item.disco_usado) / Number(item.disco_total)) * 100).toFixed(2))
        : 0;
      
      const disco_livre_p = 100 - disco_uso_p;
      
      return {
        uid: item.uid,
        created_at: item.created_at,
        titular: item.titular || '',
        ip: item.server_ip, // Usar server_ip como ip para compatibilidade
        mem_total: Number(item.mem_total) || 0,
        mem_usada: Number(item.mem_usada) || 0,
        mem_usada_p,
        mem_disponivel_p,
        mem_disponivel,
        cpu_total: Number(item.cpu_total) || 0,
        cpu_livre,
        cpu_usada: Number(item.cpu_usada) || 0,
        disco_total: Number(item.disco_total) || 0,
        disco_usado: Number(item.disco_usado) || 0,
        disco_livre: Number(item.disco_livre) || 0,
        disco_uso_p,
        disco_livre_p
      };
    });
    
    // Aplicar amostragem para reduzir o volume de dados enviados ao cliente
    let processedData = transformedData;
    
    if (samplingInterval > 1) {
      // Ordenar por data (mais recente primeiro)
      processedData = transformedData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      // Garantir que temos o registro mais recente
      const mostRecent = processedData[0]
      
      // Aplicar amostragem (pegar 1 a cada N registros)
      processedData = processedData.filter((_, index) => index === 0 || index % samplingInterval === 0)
      
      console.log(`[${requestId}] Dados após amostragem: ${processedData.length} registros`)
    }
    
    // Adicionar headers para evitar cache
    const headers = new Headers()
    headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.append('Pragma', 'no-cache')
    headers.append('Expires', '0')
    headers.append('Surrogate-Control', 'no-store')
    
    return NextResponse.json(processedData, { headers })
  } catch (error) {
    console.error('Erro na API de monitoramento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
