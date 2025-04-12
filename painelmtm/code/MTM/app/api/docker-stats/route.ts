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
    
    // Obter o IP do servidor da query string
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get('ip')
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP do servidor é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar o registro mais recente para o IP especificado
    const { data, error } = await supabase
      .from('docker_stats')
      .select('*')
      .eq('ip', ip)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Erro ao buscar dados dos containers:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar dados dos containers' },
        { status: 500 }
      )
    }
    
    // Se não houver dados, retornar array vazio
    if (!data || data.length === 0) {
      return NextResponse.json([])
    }
    
    // Extrair o array de containers do campo stats
    const containerStats = data[0].stats
    
    // Processar os dados de rede para extrair valores em bytes
    const processedStats = containerStats.map((container: any) => {
      // Processar NetIO para extrair valores em bytes
      const netIOParts = container.NetIO?.split(' / ') || ['0B', '0B']
      
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
      
      // Extrair valores de recebido (RX) e transmitido (TX)
      const rxValue = netIOParts[0].trim()
      const txValue = netIOParts[1]?.trim() || '0B'
      
      return {
        ...container,
        NetIO_RX_Bytes: convertToBytes(rxValue),
        NetIO_TX_Bytes: convertToBytes(txValue)
      }
    })
    
    // Retornar o array de containers processado
    return NextResponse.json(processedStats)
  } catch (error) {
    console.error('Erro na API de docker-stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
