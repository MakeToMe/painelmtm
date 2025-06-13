import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Definir interface para o processo
interface ProcessData {
  pid: number
  rank?: number
  user: string
  rss_kb: number
  command: string
  cpu_percent: number
  ram_percent: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    const timeWindow = parseInt(searchParams.get('timeWindow') || '60') // Padrão: 60 segundos
    const type = searchParams.get('type') // 'cpu', 'ram', ou null (ambos)
    
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

    // Calcular o timestamp de início da janela de tempo
    const now = new Date()
    const startTime = new Date(now.getTime() - (timeWindow * 1000))
    const startTimeStr = startTime.toISOString()

    // Determinar quais consultas executar com base no tipo solicitado
    let cpuData = null, ramData = null, cpuError = null, ramError = null;
    
    // Número de registros a buscar - quanto maior a janela de tempo, mais registros precisamos
    const recordLimit = Math.max(6, Math.ceil(timeWindow / 10)); // Mínimo 6, aumenta com a janela de tempo
    
    // Buscar métricas de processos de CPU se o tipo for 'cpu' ou não especificado
    if (!type || type === 'cpu') {
      const cpuResult = await supabase
        .from('process_metrics')
        .select('*')
        .eq('server_ip', ip)
        .eq('process_source', 'cpu')
        .gte('created_at', startTimeStr)
        .order('created_at', { ascending: false })
        .limit(recordLimit);
      
      cpuData = cpuResult.data;
      cpuError = cpuResult.error;
    }
    
    // Buscar métricas de processos de RAM se o tipo for 'ram' ou não especificado
    if (!type || type === 'ram') {
      const ramResult = await supabase
        .from('process_metrics')
        .select('*')
        .eq('server_ip', ip)
        .eq('process_source', 'ram')
        .gte('created_at', startTimeStr)
        .order('created_at', { ascending: false })
        .limit(recordLimit);
      
      ramData = ramResult.data;
      ramError = ramResult.error;
    }
    
    if (cpuError || ramError) {
      console.error('Erro ao buscar métricas de processos:', cpuError || ramError)
      return NextResponse.json({ error: 'Erro ao buscar métricas de processos' }, { status: 500 })
    }

    // Processar os dados para encontrar os TOP 3 processos de CPU
    let topCpuProcesses: any[] = []
    if (cpuData && cpuData.length > 0) {
      // Mapa para armazenar a soma do uso de CPU por processo
      const cpuUsageMap = new Map<string, { 
        pid: number, 
        command: string, 
        user: string, 
        totalCpu: number, 
        maxCpu: number, // Valor máximo observado
        count: number,
        rss_kb: number,
        ram_percent: number,
        samples: number[] // Armazenar todas as amostras para cálculos mais precisos
      }>()
      
      // Processar cada entrada de dados
      cpuData.forEach(entry => {
        if (entry.processes && Array.isArray(entry.processes)) {
          entry.processes.forEach((process: ProcessData) => {
            const key = `${process.pid}-${process.command}`
            if (cpuUsageMap.has(key)) {
              const existing = cpuUsageMap.get(key)!
              existing.totalCpu += process.cpu_percent
              existing.count += 1
              existing.maxCpu = Math.max(existing.maxCpu, process.cpu_percent)
              existing.samples.push(process.cpu_percent)
              // Atualizar outros valores com os mais recentes
              existing.rss_kb = process.rss_kb
              existing.ram_percent = process.ram_percent
            } else {
              cpuUsageMap.set(key, {
                pid: process.pid,
                command: process.command,
                user: process.user,
                totalCpu: process.cpu_percent,
                maxCpu: process.cpu_percent,
                count: 1,
                rss_kb: process.rss_kb,
                ram_percent: process.ram_percent,
                samples: [process.cpu_percent]
              })
            }
          })
        }
      })
      
      // Converter o mapa para array e calcular métricas de CPU
      const cpuProcessArray = Array.from(cpuUsageMap.values()).map(p => {
        // Calcular diferentes métricas com base na janela de tempo
        let cpuValue;
        
        if (timeWindow <= 60) { // Para 1 min, usar a média
          cpuValue = p.totalCpu / p.count;
        } else if (timeWindow <= 600) { // Para 10 min, considerar mais o pico recente
          // Média ponderada dando mais peso aos valores mais altos
          const sortedSamples = [...p.samples].sort((a, b) => b - a);
          const topSamples = sortedSamples.slice(0, Math.max(2, Math.ceil(p.samples.length * 0.3)));
          cpuValue = topSamples.reduce((sum, val) => sum + val, 0) / topSamples.length;
        } else { // Para 30 min, considerar picos de utilização
          // Usar o valor máximo observado com um pequeno ajuste para a média
          cpuValue = p.maxCpu * 0.8 + (p.totalCpu / p.count) * 0.2;
        }
        
        return {
          pid: p.pid,
          command: p.command,
          user: p.user,
          cpu_percent: cpuValue,
          rss_kb: p.rss_kb,
          ram_percent: p.ram_percent
        };
      })
      
      // Ordenar por uso de CPU (do maior para o menor) e pegar os TOP 3
      topCpuProcesses = cpuProcessArray
        .sort((a, b) => b.cpu_percent - a.cpu_percent)
        .slice(0, 3)
    }

    // Processar os dados para encontrar os TOP 3 processos de RAM
    let topRamProcesses: any[] = []
    if (ramData && ramData.length > 0) {
      // Mapa para armazenar a soma do uso de RAM por processo
      const ramUsageMap = new Map<string, { 
        pid: number, 
        command: string, 
        user: string, 
        totalRam: number, 
        maxRam: number, // Valor máximo observado
        count: number,
        rss_kb: number,
        cpu_percent: number,
        samples: number[] // Armazenar todas as amostras para cálculos mais precisos
      }>()
      
      // Processar cada entrada de dados
      ramData.forEach(entry => {
        if (entry.processes && Array.isArray(entry.processes)) {
          entry.processes.forEach((process: ProcessData) => {
            const key = `${process.pid}-${process.command}`
            if (ramUsageMap.has(key)) {
              const existing = ramUsageMap.get(key)!
              existing.totalRam += process.ram_percent
              existing.count += 1
              existing.maxRam = Math.max(existing.maxRam, process.ram_percent)
              existing.samples.push(process.ram_percent)
              // Atualizar outros valores com os mais recentes
              existing.rss_kb = process.rss_kb
              existing.cpu_percent = process.cpu_percent
            } else {
              ramUsageMap.set(key, {
                pid: process.pid,
                command: process.command,
                user: process.user,
                totalRam: process.ram_percent,
                maxRam: process.ram_percent,
                count: 1,
                rss_kb: process.rss_kb,
                cpu_percent: process.cpu_percent,
                samples: [process.ram_percent]
              })
            }
          })
        }
      })
      
      // Converter o mapa para array e calcular métricas de RAM
      const ramProcessArray = Array.from(ramUsageMap.values()).map(p => {
        // Calcular diferentes métricas com base na janela de tempo
        let ramValue;
        
        if (timeWindow <= 60) { // Para 1 min, usar a média
          ramValue = p.totalRam / p.count;
        } else if (timeWindow <= 600) { // Para 10 min, considerar mais o pico recente
          // Média ponderada dando mais peso aos valores mais altos
          const sortedSamples = [...p.samples].sort((a, b) => b - a);
          const topSamples = sortedSamples.slice(0, Math.max(2, Math.ceil(p.samples.length * 0.3)));
          ramValue = topSamples.reduce((sum, val) => sum + val, 0) / topSamples.length;
        } else { // Para 30 min, considerar picos de utilização
          // Usar o valor máximo observado com um pequeno ajuste para a média
          ramValue = p.maxRam * 0.8 + (p.totalRam / p.count) * 0.2;
        }
        
        return {
          pid: p.pid,
          command: p.command,
          user: p.user,
          ram_percent: ramValue,
          rss_kb: p.rss_kb,
          cpu_percent: p.cpu_percent
        };
      })
      
      // Ordenar por uso de RAM (do maior para o menor) e pegar os TOP 3
      topRamProcesses = ramProcessArray
        .sort((a, b) => b.ram_percent - a.ram_percent)
        .slice(0, 3)
    }

    // Se não houver dados reais, retornar dados simulados para desenvolvimento
    if (topCpuProcesses.length === 0 && topRamProcesses.length === 0) {
      console.log('Retornando dados simulados para teste')
      
      // Gerar processos simulados para CPU
      const simulatedCpuProcesses = Array.from({ length: 3 }, (_, i) => ({
        pid: 1000 + i,
        user: i % 2 === 0 ? 'root' : 'user',
        command: `cpu-process-${i} --option=${i} /path/to/file`,
        cpu_percent: 30 - i * 8,
        ram_percent: 5 + i * 2,
        rss_kb: 100000 + i * 50000
      }))
      
      // Gerar processos simulados para RAM
      const simulatedRamProcesses = Array.from({ length: 3 }, (_, i) => ({
        pid: 2000 + i,
        user: i % 2 === 0 ? 'user' : 'root',
        command: `ram-process-${i} --memory=${i} /path/to/app`,
        ram_percent: 25 - i * 7,
        cpu_percent: 3 + i * 1.5,
        rss_kb: 500000 - i * 100000
      }))
      
      return NextResponse.json({
        cpu: simulatedCpuProcesses,
        ram: simulatedRamProcesses
      })
    }
    
    // Retornar apenas os dados solicitados com base no tipo
    if (type === 'cpu') {
      return NextResponse.json({ cpu: topCpuProcesses });
    } else if (type === 'ram') {
      return NextResponse.json({ ram: topRamProcesses });
    } else {
      return NextResponse.json({
        cpu: topCpuProcesses,
        ram: topRamProcesses
      });
    }
  } catch (error) {
    console.error('Erro na API de TOP processos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
