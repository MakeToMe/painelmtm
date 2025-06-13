'use client'

import { useState, useEffect } from 'react'
import { RiCpuLine, RiDatabase2Line, RiLoader4Line, RiRefreshLine } from 'react-icons/ri'

interface Process {
  pid: number
  rank: number
  user: string
  rss_kb: number
  command: string
  cpu_percent: number
  ram_percent: number
}

interface ProcessMetrics {
  uid: string
  created_at: string
  server_ip: string
  hostname: string
  processes: {
    by_cpu: Process[]
  }
}

interface TopProcessesProps {
  serverIp: string
  refreshInterval?: number
}

type TimeWindow = '1min' | '10min' | '30min'

interface TimeWindowState {
  cpu: TimeWindow
  ram: TimeWindow
}

export function ProcessTopCards({ serverIp, refreshInterval = 60000 }: TopProcessesProps) {
  const [topCpuProcesses, setTopCpuProcesses] = useState<Process[]>([])
  const [topRamProcesses, setTopRamProcesses] = useState<Process[]>([])
  const [loadingCpu, setLoadingCpu] = useState(true)
  const [loadingRam, setLoadingRam] = useState(true)
  const [errorCpu, setErrorCpu] = useState<string | null>(null)
  const [errorRam, setErrorRam] = useState<string | null>(null)
  const [lastUpdateCpu, setLastUpdateCpu] = useState<string>('')
  const [lastUpdateRam, setLastUpdateRam] = useState<string>('')
  const [timeWindows, setTimeWindows] = useState<TimeWindowState>({
    cpu: '1min',
    ram: '1min'
  })

  // Função para truncar o comando
  const truncateCommand = (command: string, maxLength: number = 30): string => {
    if (command.length <= maxLength) return command
    return command.substring(0, maxLength) + '...'
  }

  // Função para buscar os dados de processos da nova API process-metrics
  const fetchProcesses = async () => {
    if (!serverIp) return

    try {
      setLoadingCpu(true)
      setLoadingRam(true)
      
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const requestId = Math.random().toString(36).substring(2, 9);
      
      // Buscar dados da nova API process-metrics com janela de tempo para CPU
      const responseCpu = await fetch(`/api/process-metrics?ip=${serverIp}&timeWindow=${timeWindows.cpu}&_t=${timestamp}&_r=${requestId}-cpu`)
      
      if (!responseCpu.ok) {
        throw new Error('Falha ao buscar dados de processos para CPU')
      }
      
      // Buscar dados da nova API process-metrics com janela de tempo para RAM
      const responseRam = await fetch(`/api/process-metrics?ip=${serverIp}&timeWindow=${timeWindows.ram}&_t=${timestamp}&_r=${requestId}-ram`)
      
      if (!responseRam.ok) {
        throw new Error('Falha ao buscar dados de processos para RAM')
      }
      
      const dataCpu = await responseCpu.json()
      const dataRam = await responseRam.json()
      
      // Processar dados de CPU
      if (dataCpu && dataCpu.length > 0) {
        // Combinar processos de todos os registros retornados
        let allCpuProcesses: Process[] = [];
        
        // Processar cada registro retornado
        dataCpu.forEach((record: ProcessMetrics) => {
          if (record.processes?.by_cpu && Array.isArray(record.processes.by_cpu)) {
            allCpuProcesses = [...allCpuProcesses, ...record.processes.by_cpu];
          }
        });
        
        // Agrupar processos por PID e calcular média de uso de CPU
        const groupedCpuProcesses = allCpuProcesses.reduce((acc, process) => {
          const key = `${process.pid}-${process.command}`;
          if (!acc[key]) {
            acc[key] = { ...process, count: 1 };
          } else {
            acc[key].cpu_percent += process.cpu_percent;
            acc[key].ram_percent += process.ram_percent;
            acc[key].count += 1;
          }
          return acc;
        }, {} as Record<string, Process & { count: number }>);
        
        // Calcular média e ordenar por uso de CPU
        const cpuProcesses = Object.values(groupedCpuProcesses)
          .map(p => ({
            ...p,
            cpu_percent: p.cpu_percent / p.count,
            ram_percent: p.ram_percent / p.count
          }))
          .sort((a, b) => b.cpu_percent - a.cpu_percent)
          .slice(0, 3);
        
        console.log(`TOP 3 CPU (${timeWindows.cpu}):`, cpuProcesses);
        setTopCpuProcesses(cpuProcesses);
      }
      
      // Processar dados de RAM
      if (dataRam && dataRam.length > 0) {
        // Combinar processos de todos os registros retornados
        let allRamProcesses: Process[] = [];
        
        // Processar cada registro retornado
        dataRam.forEach((record: ProcessMetrics) => {
          if (record.processes?.by_cpu && Array.isArray(record.processes.by_cpu)) {
            allRamProcesses = [...allRamProcesses, ...record.processes.by_cpu];
          }
        });
        
        // Agrupar processos por PID e calcular média de uso de RAM
        const groupedRamProcesses = allRamProcesses.reduce((acc, process) => {
          const key = `${process.pid}-${process.command}`;
          if (!acc[key]) {
            acc[key] = { ...process, count: 1 };
          } else {
            acc[key].cpu_percent += process.cpu_percent;
            acc[key].ram_percent += process.ram_percent;
            acc[key].count += 1;
          }
          return acc;
        }, {} as Record<string, Process & { count: number }>);
        
        // Calcular média e ordenar por uso de RAM
        const ramProcesses = Object.values(groupedRamProcesses)
          .map(p => ({
            ...p,
            cpu_percent: p.cpu_percent / p.count,
            ram_percent: p.ram_percent / p.count
          }))
          .sort((a, b) => b.ram_percent - a.ram_percent)
          .slice(0, 3);
        
        console.log(`TOP 3 RAM (${timeWindows.ram}):`, ramProcesses);
        setTopRamProcesses(ramProcesses);
      }
      
      // Atualizar horário da última atualização
      const now = new Date()
      const timeStr = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      setLastUpdateCpu(timeStr)
      setLastUpdateRam(timeStr)
      
      setErrorCpu(null)
      setErrorRam(null)
    } catch (err) {
      console.error('Erro ao buscar dados de processos:', err)
      setErrorCpu('Não foi possível carregar os TOP processos')
      setErrorRam('Não foi possível carregar os TOP processos')
    } finally {
      setLoadingCpu(false)
      setLoadingRam(false)
    }
  }

  // Função para atualizar a janela de tempo para CPU
  const updateCpuTimeWindow = (window: TimeWindow) => {
    setTimeWindows(prev => ({
      ...prev,
      cpu: window
    }))
  }
  
  // Função para atualizar a janela de tempo para RAM
  const updateRamTimeWindow = (window: TimeWindow) => {
    setTimeWindows(prev => ({
      ...prev,
      ram: window
    }))
  }

  // Efeito para buscar dados iniciais e configurar atualização periódica
  useEffect(() => {
    // Buscar dados iniciais
    fetchProcesses()
    
    // Configurar intervalo para atualização periódica
    const interval = setInterval(() => {
      fetchProcesses()
    }, refreshInterval)
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [serverIp, refreshInterval])
  
  // Função para atualizar dados manualmente
  const handleRefresh = () => {
    fetchProcesses()
  }

  return (
    <div className="mt-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card de TOP CPU */}
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RiCpuLine className="w-5 h-5 text-cyan-400" />
            <h3 className="font-medium text-white">CPU - TOP 3</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {lastUpdateCpu}
            </span>
            {loadingCpu && <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />}
          </div>
        </div>
        
        {/* Tabs para seleção de intervalo de tempo - CPU */}
        <div className="flex mb-4">
          <div className="flex rounded-md overflow-hidden text-xs border border-border/30 bg-slate-800/70 w-full">
            <button 
              className={`px-3 py-1.5 flex-1 ${timeWindows.cpu === '1min' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-muted/10 hover:bg-muted/20'}`}
              onClick={() => {
                updateCpuTimeWindow('1min');
                fetchProcesses();
              }}
            >
              1 min
            </button>
            <button 
              className={`px-3 py-1.5 flex-1 ${timeWindows.cpu === '10min' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-muted/10 hover:bg-muted/20'}`}
              onClick={() => {
                updateCpuTimeWindow('10min');
                fetchProcesses();
              }}
            >
              10 min
            </button>
            <button 
              className={`px-3 py-1.5 flex-1 ${timeWindows.cpu === '30min' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-muted/10 hover:bg-muted/20'}`}
              onClick={() => {
                updateCpuTimeWindow('30min');
                fetchProcesses();
              }}
            >
              30 min
            </button>
          </div>
        </div>

        {errorCpu ? (
          <div className="text-center py-4">
            <p className="text-red-400 text-sm">{errorCpu}</p>
          </div>
        ) : topCpuProcesses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topCpuProcesses.slice(0, 3).map((process, index) => (
              <div key={`cpu-${process.pid}-${index}`} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                      PID {process.pid}
                    </span>
                    <span className="text-xs text-slate-400">{process.user}</span>
                  </div>
                  <span className="text-lg font-medium text-cyan-400">{process.cpu_percent.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-slate-300 truncate" title={process.command}>
                  {truncateCommand(process.command)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card de TOP RAM */}
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RiDatabase2Line className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">RAM - TOP 3</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {lastUpdateRam}
            </span>
            {loadingRam && <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />}
          </div>
        </div>
        
        {/* Tabs para seleção de intervalo de tempo - RAM */}
        <div className="flex mb-4">
          <div className="flex rounded-md overflow-hidden text-xs border border-border/30 bg-slate-800/70 w-full">
            <button 
              className={`px-3 py-1.5 flex-1 ${timeWindows.ram === '1min' ? 'bg-purple-500/20 text-purple-400' : 'bg-muted/10 hover:bg-muted/20'}`}
              onClick={() => {
                updateRamTimeWindow('1min');
                fetchProcesses();
              }}
            >
              1 min
            </button>
            <button 
              className={`px-3 py-1.5 flex-1 ${timeWindows.ram === '10min' ? 'bg-purple-500/20 text-purple-400' : 'bg-muted/10 hover:bg-muted/20'}`}
              onClick={() => {
                updateRamTimeWindow('10min');
                fetchProcesses();
              }}
            >
              10 min
            </button>
            <button 
              className={`px-3 py-1.5 flex-1 ${timeWindows.ram === '30min' ? 'bg-purple-500/20 text-purple-400' : 'bg-muted/10 hover:bg-muted/20'}`}
              onClick={() => {
                updateRamTimeWindow('30min');
                fetchProcesses();
              }}
            >
              30 min
            </button>
          </div>
        </div>

        {errorRam ? (
          <div className="text-center py-4">
            <p className="text-red-400 text-sm">{errorRam}</p>
          </div>
        ) : topRamProcesses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRamProcesses.slice(0, 3).map((process, index) => (
              <div key={`ram-${process.pid}-${index}`} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      PID {process.pid}
                    </span>
                    <span className="text-xs text-slate-400">{process.user}</span>
                  </div>
                  <span className="text-lg font-medium text-purple-400">{process.ram_percent.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-slate-300 truncate" title={process.command}>
                  {truncateCommand(process.command)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
