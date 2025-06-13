'use client'

import { useEffect, useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { 
  RiCpuLine, 
  RiDatabase2Line, 
  RiLoader4Line,
  RiRefreshLine,
  RiArrowLeftLine
} from 'react-icons/ri'
import { MetricCard } from '@/components/dashboard/metric-card'
import Link from 'next/link'

interface ProcessData {
  pid: number
  user: string
  command: string
  cpu_percent: number
  ram_percent: number
  rss_kb: number
  created_at?: string
  vmData?: {
    cpu_total?: number
    cpu_usada?: number
    cpu_livre?: number
    mem_total?: number
    mem_usada?: number
    mem_livre?: number
    memory_percent?: number
  }
}

interface HistoricalData {
  timestamp: string
  pid?: number
  command?: string
  cpu: number
  memory: number
  rss_kb: number
}

export default function ProcessDetailsPage({ params }: { params: { ip: string, pid: string } }) {
  const [processData, setProcessData] = useState<ProcessData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'cpu' | 'memory'>('overview')
  const [timeRange, setTimeRange] = useState<'30min' | '1h' | '3h' | '6h' | '12h' | '24h'>('30min')

  // Função para formatar o horário no eixo X
  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Função para formatar a data e hora completa para o tooltip
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  // Função para formatar o tamanho da memória
  const formatMemorySize = (sizeKb: number): string => {
    if (sizeKb < 1024) {
      return `${sizeKb}KB`
    } else if (sizeKb < 1024 * 1024) {
      return `${(sizeKb / 1024).toFixed(2)}MB`
    } else {
      return `${(sizeKb / 1024 / 1024).toFixed(2)}GB`
    }
  }

  // Função para truncar o comando
  const truncateCommand = (command: string, maxLength: number = 40): string => {
    if (!command) return '';
    if (command.length <= maxLength) return command;
    return command.substring(0, maxLength) + '...';
  }

  // Função para buscar detalhes do processo
  const fetchProcessDetails = async () => {
    if (!params.ip || !params.pid) return

    try {
      // Iniciar loading
      setLoading(true)
      
      // Buscar dados do processo usando a API de métricas de processos
      const timestamp = Date.now()
      const requestId = Math.random().toString(36).substring(2, 9)
      const response = await fetch(`/api/process-metrics?ip=${params.ip}&_t=${timestamp}&_r=${requestId}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar detalhes do processo')
      }
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        // Encontrar o processo pelo PID
        const processList = data[0].processes?.by_cpu || []
        const process = processList.find((p: any) => p.pid === parseInt(params.pid))
        
        if (process) {
          // Adicionar dados da VM
          const processWithVM = {
            ...process,
            vmData: {
              cpu_total: data[0].cpu_total,
              cpu_usada: data[0].cpu_usada,
              cpu_livre: data[0].cpu_livre,
              mem_total: data[0].mem_total,
              mem_usada: data[0].mem_usada,
              mem_livre: data[0].mem_livre,
              memory_percent: data[0].memory_percent
            }
          }
          
          setProcessData(processWithVM)
          console.log('Dados do processo recebidos:', processWithVM)
          
          // Criar dados históricos simulados para demonstração
          // Em produção, você precisaria implementar uma API para buscar dados históricos reais
          const now = new Date()
          const simulatedData: HistoricalData[] = []
          
          for (let i = 0; i < 20; i++) {
            const timestamp = new Date(now.getTime() - (i * 60000)) // 1 minuto de intervalo
            simulatedData.push({
              timestamp: timestamp.toISOString(),
              pid: process.pid,
              command: process.command,
              cpu: process.cpu_percent * (0.8 + Math.random() * 0.4), // Variação aleatória
              memory: process.ram_percent * (0.8 + Math.random() * 0.4), // Variação aleatória
              rss_kb: process.rss_kb * (0.8 + Math.random() * 0.4) // Variação aleatória
            })
          }
          
          // Ordenar por timestamp (mais antigo para mais recente)
          simulatedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          setHistoricalData(simulatedData)
          
          setError(null)
        } else {
          setError(`Processo com PID ${params.pid} não encontrado`)
        }
      } else {
        setError('Não foi possível obter dados do processo')
      }
      
      // Atualizar o horário da última atualização
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
      
      // Finalizar loading
      setLoading(false)
    } catch (err) {
      console.error('Erro ao buscar detalhes do processo:', err)
      setLoading(false)
      setError('Falha ao buscar detalhes do processo')
    }
  }

  // Efeito para buscar dados iniciais
  useEffect(() => {
    fetchProcessDetails()
  }, [params.ip, params.pid])

  // Função para filtrar dados com base no intervalo de tempo selecionado
  const getFilteredData = () => {
    if (historicalData.length === 0) return [];
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '30min':
        cutoff.setMinutes(now.getMinutes() - 30);
        break;
      case '1h':
        cutoff.setHours(now.getHours() - 1);
        break;
      case '3h':
        cutoff.setHours(now.getHours() - 3);
        break;
      case '6h':
        cutoff.setHours(now.getHours() - 6);
        break;
      case '12h':
        cutoff.setHours(now.getHours() - 12);
        break;
      case '24h':
        cutoff.setHours(now.getHours() - 24);
        break;
      default:
        cutoff.setMinutes(now.getMinutes() - 30);
    }
    
    // Filtrar dados com base no intervalo
    return historicalData.filter(item => new Date(item.timestamp) >= cutoff);
  }

  if (loading && !processData) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Carregando dados do processo...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !processData) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <div className="flex items-center justify-center h-96 flex-col">
            <p className="text-red-400 mb-4">{error}</p>
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors flex items-center"
            >
              <RiArrowLeftLine className="mr-2" /> Voltar para o Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="bg-card rounded-lg p-4 card-neomorphic mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
              title="Voltar para o Dashboard"
            >
              <RiArrowLeftLine className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-medium text-white">
                Processo {processData?.pid}
              </h1>
              <p className="text-sm text-slate-400 truncate max-w-[300px]" title={processData?.command || ''}>
                {processData?.command ? truncateCommand(processData.command, 50) : 'Processo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Atualização: {lastUpdate}
            </span>
            <button 
              onClick={fetchProcessDetails}
              className="p-2 rounded-full hover:bg-slate-800/50 transition-colors"
              title="Atualizar dados"
            >
              {loading ? (
                <RiLoader4Line className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <RiRefreshLine className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CPU */}
        <MetricCard
          title="CPU"
          value={processData?.cpu_percent ? `${processData.cpu_percent.toFixed(1)}%` : '0%'}
          icon={<RiCpuLine className="w-5 h-5 text-cyan-400" />}
          color="cyan"
          trend={
            processData?.cpu_percent && processData.cpu_percent > 80 
              ? 'up' 
              : processData?.cpu_percent && processData.cpu_percent < 20 
                ? 'down' 
                : 'neutral'
          }
        />
        
        {/* Memória */}
        <MetricCard
          title="RAM"
          value={processData?.ram_percent ? `${processData.ram_percent.toFixed(1)}%` : '0%'}
          icon={<RiDatabase2Line className="w-5 h-5 text-purple-400" />}
          color="purple"
          trend={
            processData?.ram_percent && processData.ram_percent > 80 
              ? 'up' 
              : processData?.ram_percent && processData.ram_percent < 20 
                ? 'down' 
                : 'neutral'
          }
        />

        {/* Memória Física */}
        <MetricCard
          title="Memória Física"
          value={processData?.rss_kb ? formatMemorySize(processData.rss_kb) : '0 KB'}
          icon={<RiDatabase2Line className="w-5 h-5 text-blue-400" />}
          color="blue"
          trend="neutral"
        />
      </div>

      {/* Detalhes do Processo */}
      <div className="bg-card rounded-lg p-4 card-neomorphic mb-6">
        <h3 className="font-medium text-white mb-4">Informações do Processo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <p className="text-sm text-slate-400 mb-1">PID</p>
            <p className="text-white">{processData?.pid}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <p className="text-sm text-slate-400 mb-1">Usuário</p>
            <p className="text-white">{processData?.user}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg col-span-1 md:col-span-2">
            <p className="text-sm text-slate-400 mb-1">Comando</p>
            <p className="text-white break-words">{processData?.command}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-white">
              Processo
            </h1>
            <p className="text-slate-400">
              {processData?.pid} - {processData?.user}
            </p>
          </div>
          <div className="flex space-x-2">
            {/* Seletores de intervalo de tempo */}
            <div className="flex rounded-md overflow-hidden text-xs border border-border/30">
              <button 
                className={`px-2 py-1 ${timeRange === '30min' ? 'bg-primary/20 text-primary' : 'bg-muted/10 hover:bg-muted/20'}`}
                onClick={() => setTimeRange('30min')}
              >
                30m
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '1h' ? 'bg-primary/20 text-primary' : 'bg-muted/10 hover:bg-muted/20'}`}
                onClick={() => setTimeRange('1h')}
              >
                1h
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '3h' ? 'bg-primary/20 text-primary' : 'bg-muted/10 hover:bg-muted/20'}`}
                onClick={() => setTimeRange('3h')}
              >
                3h
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '6h' ? 'bg-primary/20 text-primary' : 'bg-muted/10 hover:bg-muted/20'}`}
                onClick={() => setTimeRange('6h')}
              >
                6h
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '12h' ? 'bg-primary/20 text-primary' : 'bg-muted/10 hover:bg-muted/20'}`}
                onClick={() => setTimeRange('12h')}
              >
                12h
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '24h' ? 'bg-primary/20 text-primary' : 'bg-muted/10 hover:bg-muted/20'}`}
                onClick={() => setTimeRange('24h')}
              >
                24h
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs de navegação */}
        <div className="mb-4">
          <div className="flex bg-slate-800/70 rounded-md p-1 w-fit">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'overview' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Geral
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'cpu' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setActiveTab('cpu')}
            >
              CPU
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'memory' ? 'bg-slate-700 text-purple-400' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setActiveTab('memory')}
            >
              RAM
            </button>
          </div>
        </div>
        
        {loading && historicalData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : historicalData.length > 0 ? (
          <div className="h-80">
            {/* Gráfico Geral - Combina CPU e RAM */}
            {activeTab === 'overview' && (
              getFilteredData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={getFilteredData()}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#64748b"
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 12 }}
                      minTickGap={30}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#64748b" 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b" 
                      tickFormatter={(value) => formatMemorySize(value)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Memória (KB)') {
                          return [formatMemorySize(value), name];
                        }
                        return [`${value.toFixed(1)}%`, name];
                      }}
                      labelFormatter={(label) => formatDateTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#22d3ee" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#22d3ee' }}
                      name="CPU (%)"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#a855f7' }}
                      name="RAM (%)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="rss_kb" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                      name="Memória (KB)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Sem dados históricos disponíveis</div>
                  <div className="text-sm">Os dados serão coletados à medida que o processo for monitorado</div>
                </div>
              )
            )}
            
            {/* Gráfico de CPU */}
            {activeTab === 'cpu' && (
              getFilteredData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={getFilteredData()}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#64748b"
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 12 }}
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) => formatDateTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#22d3ee" 
                      fill="#22d3ee" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Uso de CPU (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Sem dados históricos disponíveis</div>
                  <div className="text-sm">Os dados serão coletados à medida que o processo for monitorado</div>
                </div>
              )
            )}
            
            {/* Gráfico de RAM */}
            {activeTab === 'memory' && (
              getFilteredData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={getFilteredData()}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#64748b"
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 12 }}
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) => formatDateTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#a855f7" 
                      fill="#a855f7" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Uso de RAM (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Sem dados históricos disponíveis</div>
                  <div className="text-sm">Os dados serão coletados à medida que o processo for monitorado</div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Sem dados históricos disponíveis</p>
              <p className="text-xs text-slate-500">Os dados serão coletados à medida que o processo for monitorado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
