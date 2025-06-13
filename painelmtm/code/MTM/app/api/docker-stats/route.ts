import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função de log que não registra nada em produção
function secureLog(operation: string, status: string, details?: string) {
  // Em ambiente de produção, não registramos nada
  if (process.env.NODE_ENV === 'production') {
    return; // Não registra nada em produção
  }
  
  // Em desenvolvimento, apenas registra a operação e status sem detalhes
  if (process.env.NODE_ENV === 'development') {
    console.log(`API: ${operation} - ${status}`)
  }
}

// Cria um cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'mtm'
    }
  }
)

// Verifica se o usuário é administrador
async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('mtm_users')
      .select('admin')
      .eq('uid', uid)
      .single()
    
    if (error || !data) return false
    return data.admin === true
  } catch (error) {
    // Erro silencioso para não expor informações sobre permissões
    return false
  }
}

// Verifica se o usuário é o titular do servidor com o IP especificado
async function isServerOwner(uid: string, ip: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('servidores')
      .select('titular')
      .eq('ip', ip)
      .single()
    
    if (error || !data) return false
    return data.titular === uid
  } catch (error) {
    // Erro silencioso para não expor informações sobre propriedade
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extrair parâmetros da URL
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get('ip')
    
    secureLog('Docker stats', 'inicio')
    
    // Validar parâmetros obrigatórios
    if (!ip) {
      return NextResponse.json(
        { error: 'IP do servidor é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar o registro mais recente de docker_stats para o IP especificado
    const { data: dockerData, error: dockerError } = await supabaseAdmin
      .from('docker_stats')
      .select('*')
      .eq('ip', ip)
      .order('created_at', { ascending: false })
      .limit(1)
      
    // Buscar dados de CPU por core da tabela process_metrics
    const { data: processData, error: processError } = await supabaseAdmin
      .from('process_metrics')
      .select('cpu_cores, cpu_total, cpu_usada, cpu_livre')
      .eq('server_ip', ip)
      .order('created_at', { ascending: false })
      .limit(1)
    
    // Verificar erros nas consultas
    if (dockerError) {
      secureLog('Docker stats', 'erro', 'falha na consulta de docker_stats')
      return NextResponse.json(
        { error: 'Erro ao buscar dados dos containers' },
        { status: 500 }
      )
    }
    
    if (processError) {
      secureLog('Process metrics', 'erro', 'falha na consulta de process_metrics')
      // Continuamos mesmo com erro nas métricas de processo, apenas logamos
      console.error('Erro ao buscar dados de CPU:', processError)
    }
    
    // Se não houver dados de docker, retornar array vazio
    if (!dockerData || dockerData.length === 0) {
      secureLog('Docker stats', 'sucesso', 'sem dados')
      return NextResponse.json([])
    }
    
    // Extrair o array de containers do campo stats
    const containerList = dockerData[0].stats?.container_list
    
    if (!containerList || !Array.isArray(containerList)) {
      secureLog('Docker stats', 'erro', 'formato de dados inválido')
      return NextResponse.json([])
    }
    
    // Extrair dados de CPU cores se disponíveis
    const cpuCores = processData && processData.length > 0 ? processData[0].cpu_cores : null
    const cpuTotal = processData && processData.length > 0 ? processData[0].cpu_total : null
    const cpuUsada = processData && processData.length > 0 ? processData[0].cpu_usada : null
    const cpuLivre = processData && processData.length > 0 ? processData[0].cpu_livre : null
    
    // Processar os dados para o formato esperado pelo frontend
    const processedStats = containerList.map((container: any) => {
      return {
        ID: container.id || '',
        Name: container.name || '',
        PIDs: container.pids_count?.toString() || container.pids || '0',
        CPUPerc: container.cpu_perc || container.cpu_percent?.toString() + '%' || '0%',
        MemPerc: container.mem_perc || container.mem_percent?.toString() + '%' || '0%',
        MemUsage: container.mem_usage || '0MiB / 0GiB',
        NetIO: container.net_io || '0B / 0B',
        BlockIO: container.block_io || '0B / 0B',
        Status: 'running',
        NetIO_RX_Bytes: container.net_io_rx_bytes_raw || 0,
        NetIO_TX_Bytes: container.net_io_tx_bytes_raw || 0
      }
    })
    
    secureLog('Docker stats', 'sucesso')
    
    // Preparar resposta com dados dos containers e dados de CPU
    const response = {
      containers: processedStats,
      cpu: {
        cores: cpuCores || [],
        total: cpuTotal || 0,
        usada: cpuUsada || 0,
        livre: cpuLivre || 0
      }
    }
    
    // Retornar a resposta completa
    return NextResponse.json(response)
  } catch (error) {
    secureLog('Docker stats', 'erro', 'erro interno')
    console.error('Erro na API de docker-stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
