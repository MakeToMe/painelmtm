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
  timestamp: string;
  containerName?: string;
  cpu: number;
  memory: number;
  netRx: number;
  netTx: number;
  blockRead: number;
  blockWrite: number;
}

interface ContainerDetails {
  ID: string
  Name: string
  PIDs: string
  CPUPerc: string
  MemPerc: string
  MemUsage: string
  NetIO: string
  BlockIO: string
  Status: string
  NetIO_RX_Bytes?: number
  NetIO_TX_Bytes?: number
  NetIO_RX_Formatted?: string
  NetIO_TX_Formatted?: string
  vmData?: {
    cpu_total?: number
    cpu_usada?: number
    cpu_livre?: number
    mem_total?: number
    mem_usada?: number
    mem_livre?: number
    disco_total?: number
    disco_usado?: number
    disco_livre?: number
    memory_percent?: number
    disk_percent?: number
    network_rx_bytes?: number
    network_tx_bytes?: number
  }
}

export default function ContainerDetailsPage({ params }: { params: { ip: string, id: string } }) {
  const [containerData, setContainerData] = useState<ContainerStats | null>(null)
  const [containerDetails, setContainerDetails] = useState<ContainerDetails | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 segundos
  const [activeTab, setActiveTab] = useState<'overview' | 'cpu' | 'memory' | 'network'>('overview')
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
  
  // Função para formatar bytes em unidades legíveis (KB, MB, GB, etc)
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Função para simplificar o nome do container
  const getSimplifiedName = (fullName: string) => {
    // Extrair o nome antes do primeiro ponto ou usar o nome completo
    const nameParts = fullName.split('.')
    return nameParts[0]
  }

  // Função para buscar detalhes do container
  const fetchContainerDetails = async () => {
    if (!params.ip || !params.id) return

    try {
      // Iniciar loading
      setLoading(true)
      
      // Buscar dados do container usando a mesma API da dashboard
      const containerResponse = await fetch(`/api/docker-stats?ip=${params.ip}`)
      
      if (!containerResponse.ok) {
        throw new Error('Falha ao buscar detalhes do container')
      }
      
      const containersData = await containerResponse.json()
      
      // Encontrar o container específico pelo ID
      const containerData = containersData.containers?.find((container: any) => container.ID === params.id)
      
      // Buscar dados da VM/servidor usando a mesma API da dashboard
      const timestamp = Date.now()
      const requestId = Math.random().toString(36).substring(2, 9)
      const serverResponse = await fetch(`/api/process-metrics?ip=${params.ip}&_t=${timestamp}&_r=${requestId}`)
      
      let vmData = null
      
      if (serverResponse.ok) {
        const serverData = await serverResponse.json()
        if (serverData && serverData.length > 0) {
          vmData = serverData[0]
          console.log('Dados da VM recebidos:', {
            cpu_total: vmData.cpu_total,
            mem_usada: vmData.mem_usada,
            mem_total: vmData.mem_total
          })
        }
      }
      
      if (containerData) {
        // Manter os dados antigos se não tivermos novos dados
        const newVmData = vmData || (containerDetails?.vmData || null)
        
        // Atualizar os dados de forma suave sem refresh
        setContainerDetails(prevDetails => ({
          ...prevDetails,
          ...containerData,
          vmData: newVmData
        }))
        
        // Atualizar o horário da última atualização
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
        setError(null)
      } else {
        // Não definir erro se já tivermos dados
        if (!containerDetails) {
          setError(`Container com ID ${params.id} não encontrado`)
        }
      }
      
      // Finalizar loading
      setLoading(false)
    } catch (err) {
      console.error('Erro ao buscar detalhes do container:', err)
      setLoading(false)
      // Não definir erro se já tivermos dados
      if (!containerDetails) {
        setError('Falha ao buscar detalhes do container')
      }
    }
  }
  
  // Função para buscar dados históricos do container
  const fetchHistoricalData = async () => {
    if (!params.ip || !params.id) return

    try {
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const requestId = Math.random().toString(36).substring(2, 9);
      
      const response = await fetch(`/api/container-history?ip=${params.ip}&containerId=${params.id}&timeRange=${timeRange}&_t=${timestamp}&_r=${requestId}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados históricos do container')
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        console.log(`Recebidos ${data.length} registros históricos para o container ${params.id}`)
        
        // Atualização suave dos dados
        setHistoricalData(prevData => {
          // Se não houver dados anteriores, simplesmente use os novos dados
          if (prevData.length === 0) return data;
          
          // Atualizar os dados mantendo a transição suave
          return data;
        });
        
        // Atualizar o timestamp da última atualização
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } else {
        console.log('Nenhum dado histórico encontrado ou formato inválido')
        // Não limpar os dados existentes para evitar flicker
        if (historicalData.length === 0) {
          setHistoricalData([])
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados históricos do container:', err)
      // Não definimos o erro aqui para não afetar a experiência do usuário
      // se apenas os dados históricos falharem
    }
  }

  // Efeito para buscar dados iniciais apenas uma vez
  useEffect(() => {
    fetchContainerDetails()
    fetchHistoricalData()
    
    // Removemos a atualização automática para evitar refresh da página
  }, [params.ip, params.id])
  
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
                {containerDetails?.Name ? getSimplifiedName(containerDetails.Name) : 'Container'}
              </h1>
              <p className="text-sm text-slate-400">
                {containerDetails?.ID || params.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Atualização: {lastUpdate}
            </span>
            <button 
              onClick={fetchContainerDetails}
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

      {/* Cards de métricas (dados da VM) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CPU */}
        <MetricCard
          title="CPU VM"
          value={containerDetails?.vmData?.cpu_usada ? `${containerDetails.vmData.cpu_usada.toFixed(1)}%` : '0%'}
          icon={<RiCpuLine className="w-5 h-5 text-cyan-400" />}
          color="cyan"
          trend={
            containerDetails?.vmData?.cpu_usada && containerDetails.vmData.cpu_usada > 80 
              ? 'up' 
              : containerDetails?.vmData?.cpu_usada && containerDetails.vmData.cpu_usada < 20 
                ? 'down' 
                : 'neutral'
          }
        />
        
        {/* Memória */}
        <MetricCard
          title="RAM VM"
          value={containerDetails?.vmData?.mem_usada && containerDetails?.vmData?.mem_total 
            ? `${((containerDetails.vmData.mem_usada / containerDetails.vmData.mem_total) * 100).toFixed(1)}%` 
            : '0%'}
          icon={<RiDatabase2Line className="w-5 h-5 text-purple-400" />}
          color="purple"
          trend={
            containerDetails?.vmData?.mem_usada && containerDetails?.vmData?.mem_total && 
            ((containerDetails.vmData.mem_usada / containerDetails.vmData.mem_total) * 100) > 80 
              ? 'up' 
              : containerDetails?.vmData?.mem_usada && containerDetails?.vmData?.mem_total && 
                ((containerDetails.vmData.mem_usada / containerDetails.vmData.mem_total) * 100) < 20 
                ? 'down' 
                : 'neutral'
          }
        />

        {/* Rede */}
        <MetricCard
          title="Rede VM"
          value={
            // Tenta usar os dados históricos mais recentes (que são os mesmos usados no gráfico)
            historicalData.length > 0
              ? `${formatBytes(historicalData[historicalData.length - 1].netRx + historicalData[historicalData.length - 1].netTx)}`
              // Se não tiver dados históricos, tenta usar os dados da VM
              : containerDetails?.vmData?.network_rx_bytes && containerDetails?.vmData?.network_tx_bytes
                ? `${formatBytes(containerDetails.vmData.network_rx_bytes + containerDetails.vmData.network_tx_bytes)}` 
                // Se não tiver nenhum dos dois, mostra 0 Bytes
                : '0 Bytes'
          }
          icon={<RiWifiLine className="w-5 h-5 text-blue-400" />}
          color="blue"
          trend="neutral"
        />
      </div>

      {/* Gráficos */}
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-white">
              Container
            </h1>
            <p className="text-slate-400">
              {historicalData.length > 0 && historicalData[0].containerName ? 
                historicalData[0].containerName : 
                params.id}
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
            {/* Gráfico Geral - Combina CPU, RAM e Rede */}
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
                      tickFormatter={(value) => formatBytes(value)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Recebido' || name === 'Transmitido') {
                          return [formatBytes(value), name];
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
                      dataKey="netRx" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#10b981' }}
                      name="Recebido"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="netTx" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#f43f5e' }}
                      name="Transmitido"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Sem dados históricos disponíveis</div>
                  <div className="text-sm">Os dados serão coletados à medida que o container for monitorado</div>
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
                  <div className="text-sm">Os dados serão coletados à medida que o container for monitorado</div>
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
                  <div className="text-sm">Os dados serão coletados à medida que o container for monitorado</div>
                </div>
              )
            )}
            
            {/* Gráfico de Rede */}
            {activeTab === 'network' && (
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
                      tickFormatter={(value) => formatBytes(value)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatBytes(value)}
                      labelFormatter={(label) => formatDateTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="netRx" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#10b981' }}
                      name="Recebido"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="netTx" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#f43f5e' }}
                      name="Transmitido"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="text-lg mb-2">Sem dados históricos disponíveis</div>
                  <div className="text-sm">Os dados serão coletados à medida que o container for monitorado</div>
                </div>
              )
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
