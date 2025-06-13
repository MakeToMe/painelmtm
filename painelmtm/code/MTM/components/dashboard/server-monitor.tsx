'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar, LineChart, Line, AreaChart, Area, LabelList,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { 
  RiCpuLine, 
  RiHardDriveLine, 
  RiDatabase2Line,
  RiLoader4Line,
  RiRefreshLine,
  RiInformationLine,
  RiLineChartLine,
  RiWifiLine
} from 'react-icons/ri'
import { MetricCard } from './metric-card'
import { DockerContainerTable } from './docker-container-table'

interface MonitorData {
  uid: string
  created_at: string
  titular: string
  ip: string
  mem_total: number
  mem_usada: number
  mem_usada_p: number
  mem_disponivel_p: number
  mem_disponivel: number
  cpu_total: number
  cpu_livre: number
  cpu_usada: number
  disco_total: number
  disco_usado: number
  disco_livre: number
  disco_uso_p: number
  disco_livre_p: number
}

interface ProcessMetrics {
  uid: string
  created_at: string
  server_ip: string
  hostname: string
  processes: {
    by_cpu: {
      pid: number
      rank: number
      user: string
      rss_kb: number
      command: string
      cpu_percent: number
      ram_percent: number
    }[]
  }
  cpu_cores: { core: number; usage: number }[]
  cpu_total: number | string
  cpu_usada: number | string
  cpu_livre: number | string
  mem_total: number | string
  mem_usada: number | string
  mem_livre: number | string
  disco_total: number | string
  disco_usado: number
  disco_livre: number
}

interface ServerMonitorProps {
  serverIp: string
  serverCpu: number
  serverRam: number
  serverStorage: number
  processMetricsData?: ProcessMetrics | null
}

// Função para formatar data para exibição no gráfico
const formatTimeLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatTooltipTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
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

// Função para formatar GB com 2 casas decimais
const formatGB = (value: number) => {
  return `${(value / 1024).toFixed(2)} GB`;
};

// Função para formatar percentual
const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export function ServerMonitor({ serverIp, serverCpu, serverRam, serverStorage, processMetricsData }: ServerMonitorProps) {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null)
  const [monitorHistory, setMonitorHistory] = useState<MonitorData[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loadingMonitor, setLoadingMonitor] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'cpu' | 'ram'>('overview')
  const [timeRange, setTimeRange] = useState<'30min' | '1h' | '3h' | '6h' | '12h' | '24h'>('3h')
  const [availableRange, setAvailableRange] = useState<string | null>(null)
  const [dataLimitMessage, setDataLimitMessage] = useState<string>('')
  const [availableTimeRange, setAvailableTimeRange] = useState<string | null>(null)

  // Formatar os dados para os gráficos
  const cpuData = monitorHistory.map(item => ({
    time: item.created_at,
    value: item.cpu_usada
  }));

  const ramData = monitorHistory.map(item => ({
    time: item.created_at,
    value: item.mem_usada_p
  }));
  
  // Filtrar dados com base no intervalo de tempo selecionado
  const getFilteredData = () => {
    if (monitorHistory.length === 0) return [];
    
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
        cutoff.setHours(now.getHours() - 3); // Padrão: 3 horas
    }
    
    // Filtrar dados com base no intervalo
    return monitorHistory.filter(item => new Date(item.created_at) >= cutoff);
  }
  
  // Verificar se temos dados suficientes para o intervalo selecionado
  const checkDataAvailability = () => {
    if (monitorHistory.length === 0) return;
    
    const oldestData = new Date(monitorHistory[0].created_at);
    const newestData = new Date(monitorHistory[monitorHistory.length - 1].created_at);
    const diffMs = newestData.getTime() - oldestData.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let availableRangeText = null;
    
    // Verificar se o intervalo selecionado é maior que os dados disponíveis
    if (
      (timeRange === '24h' && diffHours < 24) ||
      (timeRange === '12h' && diffHours < 12) ||
      (timeRange === '6h' && diffHours < 6) ||
      (timeRange === '3h' && diffHours < 3) ||
      (timeRange === '1h' && diffHours < 1) ||
      (timeRange === '30min' && diffMinutes < 30)
    ) {
      // Determinar o intervalo máximo disponível
      if (diffDays >= 1) {
        availableRangeText = `${diffDays}d`;
      } else if (diffHours >= 1) {
        availableRangeText = `${diffHours}h`;
      } else {
        availableRangeText = `${diffMinutes}min`;
      }
    }
    
    setAvailableRange(availableRangeText);
  }
  
  // Buscar dados de monitoramento
  const fetchMonitorData = async () => {
    if (!serverIp) return
    
    setLoadingMonitor(true)
    
    try {
      // Incluir o intervalo de tempo selecionado na requisição
      const response = await fetch(`/api/monitor?ip=${serverIp}&timeRange=${timeRange}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na resposta da API:', errorData)
        throw new Error(errorData.error || 'Erro ao carregar dados de monitoramento')
      }
      
      const responseData = await response.json()
      
      // Verificar se a resposta contém uma mensagem especial (caso de dados limitados)
      if (responseData.message && responseData.data) {
        setDataLimitMessage(responseData.message)
        
        // Se houver um intervalo de tempo real diferente do solicitado
        if (responseData.actualTimeRange && responseData.actualTimeRange !== timeRange) {
          setAvailableTimeRange(responseData.actualTimeRange)
        }
        
        // Usar os dados da propriedade data
        const data = responseData.data
        
        if (data && data.length > 0) {
          // Ordenar por data de criação (mais antigo primeiro)
          const sortedData = [...data].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          
          setMonitorData(data[0])
          setMonitorHistory(sortedData)
          
          // Verificar disponibilidade de dados para o intervalo selecionado
          setTimeout(() => checkDataAvailability(), 0);
        }
      } else {
        // Resposta normal sem mensagem especial
        setDataLimitMessage('')
        
        const data = responseData
        
        if (data && data.length > 0) {
          // Ordenar por data de criação (mais antigo primeiro)
          const sortedData = [...data].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          
          setMonitorData(data[0])
          setMonitorHistory(sortedData)
          
          // Verificar disponibilidade de dados para o intervalo selecionado
          setTimeout(() => checkDataAvailability(), 0);
        }
      }
      
      // Atualizar horário da última atualização
      const now = new Date()
      setLastUpdate(
        now.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })
      )
    } catch (error) {
      console.error('Erro ao buscar dados de monitoramento:', error)
    } finally {
      setLoadingMonitor(false)
    }
  }
  
  // Efeito para atualizar a verificação de disponibilidade quando o intervalo muda
  useEffect(() => {
    checkDataAvailability();
  }, [timeRange, monitorHistory]);
  
  // Efeito para buscar dados iniciais e configurar atualização periódica
  useEffect(() => {
    // Buscar dados iniciais
    fetchMonitorData()
    
    // Configurar atualização periódica
    const interval = setInterval(() => {
      fetchMonitorData()
    }, 60000) // Atualizar a cada 60 segundos
    
    // Limpar intervalo ao desmontar componente
    return () => clearInterval(interval)
  }, [serverIp, timeRange]) // Refazer a busca quando o IP ou o intervalo de tempo mudar

  // Função para calcular o domínio dinâmico do eixo Y para RAM
  const calculateRamDomain = () => {
    const data = getFilteredData();
    if (data.length === 0) return [0, 100]; // Valor padrão se não houver dados
    
    // Calcular valores mínimo e máximo
    const values = data.map(item => item.mem_usada_p);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calcular média
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calcular desvio padrão
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Definir domínio com base na média e desvio padrão para aumentar a sensibilidade
    // Usar no mínimo 10% de margem para evitar que o gráfico fique muito achatado
    const margin = Math.max(stdDev * 2, 10);
    
    // Garantir que o domínio não seja menor que 10 unidades para evitar gráficos muito achatados
    // quando a variação for muito pequena
    const domainSize = Math.max(max - min, 10);
    
    // Calcular limites com base na média, garantindo que todos os pontos sejam visíveis
    let lowerBound = Math.max(0, Math.min(min - margin, avg - domainSize));
    let upperBound = Math.min(100, Math.max(max + margin, avg + domainSize));
    
    return [lowerBound, upperBound];
  };

  return (
    <div className="space-y-6">
      {/* Removidos os cards duplicados de CPU, Memory e Storage */}

      {/* Área para os gráficos de monitoramento */}
      <div className="grid grid-cols-1 gap-6">
        {/* Gráfico com Tabs para CPU e RAM */}
        <div className="bg-card rounded-lg p-4 card-neomorphic">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <RiLineChartLine className="w-5 h-5 text-primary" />
              </div>
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
          
          {/* Aviso de dados insuficientes */}
          {availableRange && (
            <div className="mb-2 text-xs text-amber-400 flex items-center justify-end">
              <RiInformationLine className="w-4 h-4 mr-1" />
              Dados disponíveis apenas para as últimas {availableRange}
            </div>
          )}
          
          {/* Aviso de dados limitados */}
          {dataLimitMessage && (
            <div className="mb-2 text-xs text-amber-400 flex items-center justify-end">
              <RiInformationLine className="w-4 h-4 mr-1" />
              {dataLimitMessage}
            </div>
          )}
          
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
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ram' ? 'bg-slate-700 text-purple-400' : 'text-slate-400 hover:text-slate-300'}`}
                onClick={() => setActiveTab('ram')}
              >
                RAM
              </button>
            </div>
          </div>
          
          {loadingMonitor && !monitorData ? (
            <div className="h-80 flex items-center justify-center">
              <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : monitorData && monitorHistory.length > 0 ? (
            <div className="h-80">
              {/* Gráfico Geral - Combina CPU e RAM */}
              {activeTab === 'overview' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={getFilteredData()}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="created_at" 
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
                      labelFormatter={(label) => formatTooltipTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cpu_usada" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                      name="CPU (%)"
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="mem_usada_p" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name="RAM (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              
              {/* Gráfico de CPU */}
              {activeTab === 'cpu' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={getFilteredData().map(item => ({
                      time: item.created_at,
                      value: item.cpu_usada
                    }))}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="time" 
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
                      labelFormatter={(label) => formatTooltipTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                      name="Uso de CPU (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {/* Gráfico de RAM */}
              {activeTab === 'ram' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={getFilteredData().map(item => ({
                      time: item.created_at,
                      value: item.mem_usada_p
                    }))}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b"
                      tickFormatter={formatTimeLabel}
                      tick={{ fontSize: 12 }}
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      domain={calculateRamDomain()} 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                      allowDataOverflow={true}
                      padding={{ top: 10, bottom: 10 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      labelFormatter={(label) => formatTooltipTime(label as string)}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name="Uso de RAM (%)"
                      dot={{ r: 1, strokeWidth: 1, fill: '#10b981' }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                    <ReferenceLine 
                      y={getFilteredData().reduce((sum, item) => sum + item.mem_usada_p, 0) / getFilteredData().length} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3"
                      label={{ 
                        value: 'Média', 
                        position: 'insideBottomRight',
                        fill: '#f59e0b',
                        fontSize: 12
                      }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Sem dados de monitoramento</p>
                <div className="flex justify-center">
                  <RiInformationLine className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
          
          {/* Métricas resumidas */}
          {monitorData && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Uso Atual</p>
                <p className="text-lg font-medium">
                  {activeTab === 'ram' 
                    ? `${formatGB(monitorData.mem_usada)} (${formatPercent(monitorData.mem_usada_p)})` 
                    : activeTab === 'cpu' 
                      ? `${monitorData.cpu_usada.toFixed(1)}%` 
                      : `CPU: ${monitorData.cpu_usada.toFixed(1)}% / RAM: ${formatPercent(monitorData.mem_usada_p)}`
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Livre</p>
                <p className="text-lg font-medium">
                  {activeTab === 'ram' 
                    ? `${formatGB(monitorData.mem_disponivel)} (${formatPercent(monitorData.mem_disponivel_p)})` 
                    : activeTab === 'cpu' 
                      ? `${(100 - monitorData.cpu_usada).toFixed(1)}%` 
                      : `CPU: ${(100 - monitorData.cpu_usada).toFixed(1)}% / RAM: ${formatPercent(monitorData.mem_disponivel_p)}`
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Última Atualização</p>
                <p className="text-sm font-medium">
                  {lastUpdate}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabela de Containers Docker */}
        <DockerContainerTable serverIp={serverIp} refreshInterval={10000} />
      </div>
      
      {/* Última atualização */}
      {monitorData && (
        <div className="text-right text-sm text-muted-foreground mt-4">
          Última atualização: {formatDateTime(monitorData.created_at)}
          <button 
            onClick={fetchMonitorData}
            className="ml-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
            title="Atualizar dados"
          >
            {loadingMonitor ? (
              <RiLoader4Line className="w-4 h-4 animate-spin text-primary inline" />
            ) : (
              <RiRefreshLine className="w-4 h-4 text-primary inline" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
