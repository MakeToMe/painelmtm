'use client'

import { useEffect, useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { 
  RiCpuLine, 
  RiDatabase2Line, 
  RiHardDriveLine,
  RiWifiLine,
  RiRefreshLine,
  RiLoader4Line,
  RiArrowLeftLine
} from 'react-icons/ri'
import { MetricCard } from '@/components/dashboard/metric-card'
import Link from 'next/link'

interface ContainerStats {
  ID: string
  Name: string
  PIDs: string
  CPUPerc: string
  MemPerc: string
  MemUsage: string
  NetIO: string
  BlockIO: string
  NetIO_RX_Bytes: number
  NetIO_TX_Bytes: number
  NetIO_RX_Formatted: string
  NetIO_TX_Formatted: string
}

interface HistoricalData {
  timestamp: string
  cpu: number
  memory: number
  netRx: number
  netTx: number
  blockRead: number
  blockWrite: number
}

export default function ContainerDetailsPage({ params }: { params: { ip: string, id: string } }) {
  const [containerData, setContainerData] = useState<ContainerStats | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 segundos
  const [activeTab, setActiveTab] = useState<'overview' | 'cpu' | 'memory' | 'network'>('overview')
  const [timeRange, setTimeRange] = useState<'30min' | '1h' | '3h' | '6h' | '12h' | '24h'>('30min')

  // Função para formatar data para exibição no gráfico
  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Função para formatar data completa
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Função para simplificar o nome do container
  const getSimplifiedName = (fullName: string) => {
    // Extrair o nome antes do primeiro ponto ou usar o nome completo
    const nameParts = fullName.split('.')
    return nameParts[0]
  }

  // Função para buscar dados atuais do container
  const fetchContainerData = async () => {
    if (!params.ip || !params.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/docker-stats?ip=${params.ip}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados do container')
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        // Encontrar o container específico pelo ID
        const container = data.find(c => c.ID === params.id)
        
        if (container) {
          setContainerData(container)
          
          // Atualizar horário da última atualização
          const now = new Date()
          setLastUpdate(
            now.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })
          )
        } else {
          setError(`Container com ID ${params.id} não encontrado`)
        }
      }
      
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar dados do container:', err)
      setError('Não foi possível carregar os dados do container')
    } finally {
      setLoading(false)
    }
  }
  
  // Função para buscar dados históricos do container
  const fetchHistoricalData = async () => {
    if (!params.ip || !params.id) return

    try {
      const response = await fetch(`/api/container-history?ip=${params.ip}&containerId=${params.id}&timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados históricos do container')
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        setHistoricalData(data)
      }
    } catch (err) {
      console.error('Erro ao buscar dados históricos do container:', err)
      // Não definimos o erro aqui para não afetar a experiência do usuário
      // se apenas os dados históricos falharem
    }
  }

  // Efeito para buscar dados iniciais e configurar atualização periódica
  useEffect(() => {
    fetchContainerData()
    fetchHistoricalData()
    
    const dataInterval = setInterval(() => {
      fetchContainerData()
    }, refreshInterval)
    
    const historyInterval = setInterval(() => {
      fetchHistoricalData()
    }, refreshInterval * 3) // Atualiza o histórico com menos frequência
    
    return () => {
      clearInterval(dataInterval)
      clearInterval(historyInterval)
    }
  }, [params.ip, params.id, refreshInterval])
  
  // Efeito para atualizar os dados históricos quando o intervalo de tempo mudar
  useEffect(() => {
    fetchHistoricalData()
  }, [timeRange])

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

  if (loading && !containerData) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Carregando dados do container...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !containerData) {
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
                {containerData ? getSimplifiedName(containerData.Name) : 'Container'}
              </h1>
              <p className="text-sm text-slate-400">{params.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Atualização: {lastUpdate}
            </span>
            <button 
              onClick={fetchContainerData}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* CPU */}
        <MetricCard
          title="CPU Usage"
          value={containerData ? containerData.CPUPerc : '0%'}
          icon={<RiCpuLine className="w-5 h-5 text-cyan-400" />}
          color="cyan"
          trend={
            containerData && parseFloat(containerData.CPUPerc) > 80 
              ? 'up' 
              : containerData && parseFloat(containerData.CPUPerc) < 20 
                ? 'down' 
                : 'neutral'
          }
        />

        {/* Memória */}
        <MetricCard
          title="Memory"
          value={containerData ? containerData.MemPerc : '0%'}
          subtitle={containerData ? containerData.MemUsage : '-'}
          icon={<RiDatabase2Line className="w-5 h-5 text-purple-400" />}
          color="purple"
          trend={
            containerData && parseFloat(containerData.MemPerc) > 80 
              ? 'up' 
              : containerData && parseFloat(containerData.MemPerc) < 20 
                ? 'down' 
                : 'neutral'
          }
        />

        {/* Rede */}
        <MetricCard
          title="Network I/O"
          value={containerData ? containerData.NetIO : '0B / 0B'}
          icon={<RiWifiLine className="w-5 h-5 text-blue-400" />}
          color="blue"
        />

        {/* Disco */}
        <MetricCard
          title="Block I/O"
          value={containerData ? containerData.BlockIO : '0B / 0B'}
          icon={<RiHardDriveLine className="w-5 h-5 text-green-400" />}
          color="green"
        />
      </div>

      {/* Gráficos */}
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-white">Métricas de Desempenho</h3>
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
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'network' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setActiveTab('network')}
            >
              Rede
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
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    labelFormatter={(label) => formatDateTime(label as string)}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
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
                    name="Memory (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {/* Gráfico de CPU */}
            {activeTab === 'cpu' && (
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
                    name="CPU Usage (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            
            {/* Gráfico de RAM */}
            {activeTab === 'memory' && (
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
                    name="Memory Usage (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            
            {/* Gráfico de Rede */}
            {activeTab === 'network' && (
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
                    stroke="#64748b" 
                    tickFormatter={(value) => `${(value / 1024 / 1024).toFixed(1)} MB`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${(value / 1024 / 1024).toFixed(2)} MB`}
                    labelFormatter={(label) => formatDateTime(label as string)}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="netRx" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                    name="Received"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netTx" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#22c55e' }}
                    name="Transmitted"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Sem dados históricos disponíveis</p>
              <p className="text-xs text-slate-500">Os dados serão coletados à medida que o container for monitorado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
