'use client'

import { useState, useEffect } from 'react'
import { RiCpuLine, RiDatabase2Line, RiLoader4Line, RiRefreshLine, RiEyeLine } from 'react-icons/ri'
import Link from 'next/link'

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

interface ProcessMetricsTableProps {
  serverIp: string
  refreshInterval?: number
}

export function ProcessMetricsTable({ serverIp, refreshInterval = 10000 }: ProcessMetricsTableProps) {
  const [metrics, setMetrics] = useState<ProcessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'cpu' | 'ram'>('cpu')

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
    if (command.length <= maxLength) return command
    return command.substring(0, maxLength) + '...'
  }

  // Função para buscar dados de processos
  const fetchProcesses = async () => {
    if (!serverIp) return
    
    try {
      setLoading(true)
      
      // Nova estrutura não tem mais process_source, todos os dados estão em uma única linha
      const response = await fetch(`/api/process-metrics?ip=${serverIp}&_t=${Date.now()}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de processos')
      }
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        console.log('Dados de processos recebidos:', {
          timestamp: data[0].created_at,
          processes_count: data[0].processes?.by_cpu?.length || 0
        });
        setMetrics(data[0])
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
      
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar dados de processos:', err)
      setError('Não foi possível carregar os dados de processos')
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar dados iniciais e configurar intervalo de atualização
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

  if (loading && !metrics) {
    return (
      <div className="bg-card rounded-lg p-4 card-neomorphic mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Processos</h3>
        </div>
        <div className="h-60 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2 text-muted-foreground">Carregando processos...</span>
        </div>
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="bg-card rounded-lg p-4 card-neomorphic mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Processos</h3>
        </div>
        <div className="h-60 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Ordenar processos com base na tab ativa
  const sortedProcesses = metrics?.processes?.by_cpu
    ? [...metrics.processes.by_cpu].sort((a, b) => {
        if (activeTab === 'cpu') {
          return b.cpu_percent - a.cpu_percent;
        } else {
          return b.ram_percent - a.ram_percent;
        }
      })
    : []

  return (
    <div className="bg-card rounded-lg p-4 card-neomorphic mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">Processos</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Atualização: {lastUpdate}
          </span>
          <button 
            onClick={handleRefresh}
            className="p-1.5 rounded-full hover:bg-slate-800/50 transition-colors"
            title="Atualizar dados"
          >
            {loading ? (
              <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <RiRefreshLine className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex bg-slate-800/70 rounded-md p-1 w-fit">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'cpu' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveTab('cpu')}
          >
            <RiCpuLine className="w-4 h-4" />
            CPU
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'ram' ? 'bg-slate-700 text-purple-400' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveTab('ram')}
          >
            <RiDatabase2Line className="w-4 h-4" />
            RAM
          </button>
        </div>
      </div>

      {/* Tabela de processos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-2 text-muted-foreground font-medium text-sm">PID</th>
              <th className="text-left p-2 text-muted-foreground font-medium text-sm">Usuário</th>
              <th className="text-left p-2 text-muted-foreground font-medium text-sm">Comando</th>
              <th className="text-right p-2 text-muted-foreground font-medium text-sm">
                {activeTab === 'cpu' ? 'CPU %' : 'RAM %'}
              </th>
              <th className="text-right p-2 text-muted-foreground font-medium text-sm">Memória</th>
              <th className="text-center p-2 text-muted-foreground font-medium text-sm">Ação</th>
            </tr>
          </thead>
          <tbody>
            {sortedProcesses.slice(0, 10).map((process) => (
              <tr key={process.pid} className="border-b border-slate-700/30">
                <td className="py-2 px-3 text-sm text-left">{process.pid}</td>
                <td className="py-2 px-3 text-sm text-left">{process.user}</td>
                <td className="py-2 px-3 text-sm text-left">
                  <div className="truncate max-w-[300px]" title={process.command}>
                    {truncateCommand(process.command)}
                  </div>
                </td>
                <td className="py-2 px-3 text-sm text-right">
                  {activeTab === 'cpu' 
                    ? `${process.cpu_percent.toFixed(1)}%` 
                    : `${process.ram_percent.toFixed(1)}%`
                  }
                </td>
                <td className="py-2 px-3 text-sm text-right">{formatMemorySize(process.rss_kb)}</td>
                <td className="py-2 px-3 text-sm text-center">
                  <Link 
                    href={`/process/${serverIp}/${process.pid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-slate-700/50 transition-colors inline-flex items-center justify-center"
                    title="Ver detalhes do processo"
                  >
                    <RiEyeLine className="w-4 h-4 text-primary" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
