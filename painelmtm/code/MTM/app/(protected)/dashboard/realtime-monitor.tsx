'use client'

import { useState, useEffect } from 'react'
import { ServerMonitor } from '@/components/dashboard/server-monitor'
import { DigitalClock } from '@/components/dashboard/digital-clock'
import { CpuCoresUsage } from '@/components/dashboard/cpu-cores-usage'
import { BannedIpsCounter } from '@/components/dashboard/banned-ips-counter'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RiCpuLine, RiDatabase2Line, RiHardDriveLine } from 'react-icons/ri'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface Servidor {
  uid: string
  ip: string | null
  cpu: number | null
  ram: number | null
  storage: number | null
  nome: string | null
}

interface RealtimeMonitorProps {
  selectedServer: Servidor | null
}

interface ProcessMetrics {
  uid: string
  created_at: string
  server_ip: string
  hostname: string
  process_source: string
  processes: any[]
  server_uid: string
  titular: string
  cpu_cores: { core: number; usage: number }[]
  cpu_total: number
  cpu_usada: number
  cpu_livre: number
  mem_total: number
  mem_usada: number
  mem_livre: number
  disco_total: number
  disco_usado: number
  disco_livre: number
}

export function RealtimeMonitor({ selectedServer }: RealtimeMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [processMetrics, setProcessMetrics] = useState<ProcessMetrics | null>(null)

  // Mostrar o componente apenas quando o servidor estiver selecionado
  useEffect(() => {
    if (selectedServer?.ip) {
      setIsVisible(true)
      fetchProcessMetrics()
    } else {
      setIsVisible(false)
      setProcessMetrics(null)
    }
  }, [selectedServer])
  
  // Função para buscar dados de monitoramento da nova tabela process_metrics
  const fetchProcessMetrics = async () => {
    if (!selectedServer?.ip) return
    
    try {
      // Adicionar timestamp para evitar cache e um identificador único para rastrear a requisição
      const requestId = Math.random().toString(36).substring(2, 9);
      const timestamp = Date.now();
      console.log(`[${requestId}] Buscando dados de process_metrics em ${new Date(timestamp).toISOString()}`);
      
      // Nova estrutura não tem mais process_source, todos os dados estão em uma única linha
      const response = await fetch(`/api/process-metrics?ip=${selectedServer.ip}&_t=${timestamp}&_r=${requestId}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de monitoramento')
      }
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        console.log(`[${requestId}] Dados recebidos:`, {
          timestamp: data[0].created_at,
          cpu_cores: data[0].cpu_cores?.slice(0, 2) || [],
          processes_count: data[0].processes?.by_cpu?.length || 0
        });
        setProcessMetrics(data[0])
      } else {
        console.warn(`[${requestId}] Nenhum dado recebido da API`);
      }
    } catch (err) {
      console.error('Erro ao buscar dados de monitoramento:', err)
    }
  }
  
  // Efeito para buscar dados periodicamente
  useEffect(() => {
    // Buscar dados imediatamente
    fetchProcessMetrics()
    
    // Configurar intervalo para buscar dados a cada 3 segundos
    // Reduzido de 10 para 3 segundos para corresponder ao intervalo do CpuCoresUsage
    const interval = setInterval(() => {
      fetchProcessMetrics()
    }, 3000)
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [selectedServer?.ip])
  
  // Verificar se temos dados para exibir
  const hasData = processMetrics !== null
  
  // Calcular porcentagens no frontend
  const calculatePercentages = () => {
    if (!processMetrics) return {
      cpu_percent: 0,
      mem_percent: 0,
      disk_percent: 0,
      disk_free_percent: 0
    }
    
    // CPU - se cpu_usada já estiver em porcentagem, usar diretamente, caso contrário calcular
    const cpu_percent = processMetrics.cpu_total > 0 ? 
      (processMetrics.cpu_usada / processMetrics.cpu_total) * 100 : 
      parseFloat(processMetrics.cpu_usada.toString())
    
    // Memória - calcular com base nos valores absolutos
    const mem_total = parseFloat(processMetrics.mem_total)
    const mem_usada = parseFloat(processMetrics.mem_usada)
    const mem_percent = mem_total > 0 ? (mem_usada / mem_total) * 100 : 0
    
    // Disco - calcular com base nos valores absolutos
    const disco_total = parseFloat(processMetrics.disco_total)
    const disco_usado = parseFloat(processMetrics.disco_usado)
    const disk_percent = disco_total > 0 ? (disco_usado / disco_total) * 100 : 0
    const disk_free_percent = 100 - disk_percent
    
    // Log para depuração
    console.log('Porcentagens calculadas:', {
      cpu_percent,
      mem_percent,
      disk_percent,
      disk_free_percent,
      cpu_cores: processMetrics.cpu_cores?.slice(0, 2) || [],
      processes_count: processMetrics.processes?.by_cpu?.length || 0
    });
    
    return {
      cpu_percent,
      mem_percent,
      disk_percent,
      disk_free_percent
    }
  }
  
  // Obter porcentagens calculadas
  const { cpu_percent, mem_percent, disk_percent, disk_free_percent } = calculatePercentages()

  if (!isVisible || !selectedServer?.ip) {
    return (
      <div className="bg-card rounded-lg p-6 card-neomorphic">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Monitoramento em Tempo Real</h3>
          <p className="text-muted-foreground">
            Selecione um servidor para visualizar os dados de monitoramento em tempo real.
          </p>
        </div>
      </div>
    )
  }

  // Se não tiver dados, mostrar mensagem de sem dados
  if (!hasData) {
    return (
      <div className="mt-6">
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Monitoramento em Tempo Real</h3>
            <p className="text-muted-foreground">
              SEM DADOS PARA EXIBIR
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              O coletor de métricas não está ativo para este servidor ou ainda não enviou dados.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {/* Cards de monitoramento em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Relógio Digital */}
        <DigitalClock />
        
        {/* Card 2: CPU Usage */}
        <MetricCard
          title="CPU Usage"
          value={`${cpu_percent.toFixed(0)}%`}
          subtitle={processMetrics && selectedServer ? 
            `${selectedServer.cpu} GHz | ${processMetrics.cpu_cores?.length || 4} Cores` : 
            '-'}
          icon={<RiCpuLine className="w-5 h-5 text-cyan-400" />}
          color="cyan"
          trend={cpu_percent > 80 ? 'up' : cpu_percent < 20 ? 'down' : 'neutral'}
          chart={processMetrics ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{value: cpu_percent}, {value: cpu_percent * 0.8}, {value: cpu_percent * 0.9}]}>
                <Bar dataKey="value" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          ) : undefined}
        />
        
        {/* Card 3: CPU por Core */}
        <CpuCoresUsage 
          cpuCoresData={processMetrics?.cpu_cores || []}
        />
        
        {/* Card 4: Memory */}
        <MetricCard
          title="Memory"
          value={`${mem_percent.toFixed(0)}%`}
          subtitle={processMetrics && selectedServer ? 
            `${(processMetrics.mem_usada / 1024).toFixed(1)} GB / ${(processMetrics.mem_total / 1024).toFixed(1)} GB` : 
            selectedServer ? `${selectedServer.ram} GB` : '-'}
          icon={<RiDatabase2Line className="w-5 h-5 text-purple-400" />}
          color="purple"
          trend={mem_percent > 80 ? 'up' : mem_percent < 20 ? 'down' : 'neutral'}
          chart={processMetrics ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{value: mem_percent * 0.9}, {value: mem_percent}, {value: mem_percent * 0.95}]}>
                <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : undefined}
        />
        
        {/* Card 5: Storage */}
        <MetricCard
          title="Storage"
          value={`${disk_percent.toFixed(0)}%`}
          subtitle={processMetrics && selectedServer ? 
            `${(processMetrics.disco_usado / 1024).toFixed(1)} GB / ${(processMetrics.disco_total / 1024).toFixed(1)} GB` : 
            selectedServer ? `${selectedServer.storage} GB` : '-'}
          icon={<RiHardDriveLine className="w-5 h-5 text-green-400" />}
          color="green"
          trend={disk_percent > 80 ? 'up' : disk_percent < 20 ? 'down' : 'neutral'}
          chart={processMetrics ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Usado', value: disk_percent },
                    { name: 'Livre', value: disk_free_percent }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={24}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : undefined}
        />
        
        {/* Card 6: IPs Banidos */}
        <BannedIpsCounter serverIp={selectedServer?.ip || ''} refreshInterval={60000} />
      </div>
      
      {/* Gráficos detalhados de monitoramento e informações Docker */}
      <div className="bg-card rounded-lg p-6 card-neomorphic">
        <ServerMonitor 
          serverIp={selectedServer?.ip || ''}
          serverCpu={selectedServer?.cpu || 0}
          serverRam={selectedServer?.ram || 0}
          serverStorage={selectedServer?.storage || 0}
          processMetricsData={processMetrics}
        />
      </div>
    </div>
  )
}
