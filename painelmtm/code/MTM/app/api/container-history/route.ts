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
    
    // Obter parâmetros da query string
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get('ip')
    const containerId = searchParams.get('containerId')
    const timeRange = searchParams.get('timeRange') || '30min'
    
    if (!ip || !containerId) {
      return NextResponse.json(
        { error: 'IP do servidor e ID do container são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Determinar o intervalo de tempo com base no parâmetro timeRange
    const now = new Date()
    let startTime: Date
    
    switch (timeRange) {
      case '30min':
        startTime = new Date(now.getTime() - 30 * 60 * 1000)
        break
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '3h':
        startTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
        break
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        break
      case '12h':
        startTime = new Date(now.getTime() - 12 * 60 * 60 * 1000)
        break
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 30 * 60 * 1000)
    }
    
    // Buscar registros históricos para o IP e intervalo de tempo especificados
    let { data, error } = await supabase
      .from('docker_stats')
      .select('created_at, stats')
      .eq('ip', ip)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true })
      
    // Adicionar log para depuração
    console.log(`Buscando histórico de container para IP ${ip}, container ${containerId}, intervalo ${timeRange}`)
    
    // Log para depuração
    if (!data || data.length === 0) {
      console.log(`Nenhum dado encontrado na tabela docker_stats para o IP ${ip}`)
    } else {
      console.log(`Encontrados ${data.length} registros na tabela docker_stats`)
    }
    
    if (error) {
      console.error('Erro ao buscar histórico do container:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar histórico do container' },
        { status: 500 }
      )
    }
    
    // Se não houver dados, retornar array vazio
    if (!data || data.length === 0) {
      return NextResponse.json([])
    }
    
    // Função para converter unidades (B, KB, MB, GB) para bytes
    const convertToBytes = (value: string): number => {
      const units = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024
      }
      
      const match = value.match(/(\d+(\.\d+)?)\s*([KMGT]?B)/i)
      if (!match) return 0
      
      const num = parseFloat(match[1])
      const unit = match[3].toUpperCase()
      
      return num * (units[unit as keyof typeof units] || 1)
    }
    
    // Extrair dados históricos do container específico
    const containerHistory = data.map(record => {
      try {
        // Verificar se stats existe e tem container_list
        if (!record.stats || !record.stats.container_list || !Array.isArray(record.stats.container_list)) {
          console.log(`Registro sem container_list válido: ${record.created_at}`)
          return null
        }
        
        // Encontrar o container pelo ID
        const containerData = record.stats.container_list.find((c: any) => c.id === containerId)
        
        if (!containerData) {
          console.log(`Container ${containerId} não encontrado no registro de ${record.created_at}`)
          return null
        }
        
        // Normalizar campos (suporte para diferentes formatos)
        const cpuPerc = containerData.cpu_perc || (containerData.cpu_percent ? `${containerData.cpu_percent}%` : '0%')
        const memPerc = containerData.mem_perc || (containerData.mem_percent ? `${containerData.mem_percent}%` : '0%')
        const netIO = containerData.net_io || '0B / 0B'
        const blockIO = containerData.block_io || '0B / 0B'
        
        // Processar NetIO para extrair valores em bytes
        const netIOParts = netIO.split(' / ') || ['0B', '0B']
        const rxValue = netIOParts[0].trim()
        const txValue = netIOParts[1]?.trim() || '0B'
        
        // Processar BlockIO para extrair valores em bytes
        const blockIOParts = blockIO.split(' / ') || ['0B', '0B']
        const readValue = blockIOParts[0].trim()
        const writeValue = blockIOParts[1]?.trim() || '0B'
        
        // Usar valores brutos se disponíveis
        const netRxRaw = containerData.net_io_rx_bytes_raw || convertToBytes(rxValue)
        const netTxRaw = containerData.net_io_tx_bytes_raw || convertToBytes(txValue)
        const blockReadRaw = containerData.block_io_read_bytes_raw || convertToBytes(readValue)
        const blockWriteRaw = containerData.block_io_write_bytes_raw || convertToBytes(writeValue)
        
        return {
          timestamp: record.created_at,
          containerName: containerData.name || containerId,
          cpu: parseFloat(cpuPerc.replace('%', '')) || 0,
          memory: parseFloat(memPerc.replace('%', '')) || 0,
          netRx: netRxRaw,
          netTx: netTxRaw,
          blockRead: blockReadRaw,
          blockWrite: blockWriteRaw
        }
      } catch (err) {
        console.error(`Erro ao processar registro de ${record.created_at}:`, err)
        return null
      }
    }).filter(Boolean) // Remover entradas nulas
    
    console.log(`Encontrados ${containerHistory.length} registros históricos para o container ${containerId}`)
    
    // Retornar o histórico do container
    return NextResponse.json(containerHistory)
  } catch (error) {
    console.error('Erro na API de histórico do container:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
