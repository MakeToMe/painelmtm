'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useProfileRefresh } from '@/hooks/use-profile-refresh'
import { AgentInstallationModal } from '@/components/modals/agent-installation-modal'
import { PlusCircle } from 'lucide-react'
import { 
  RiServerLine, 
  RiEyeLine, 
  RiArrowLeftLine, 
  RiShieldLine, 
  RiDatabase2Line,
  RiHardDriveLine,
  RiCpuLine,
  RiGlobalLine,
  RiSpeedLine,
  RiFileCopyLine,
  RiUbuntuFill,
  RiWindowsFill,
  RiTerminalBoxFill,
  RiCentosFill,
  RiTableLine,
  RiLayoutGridLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiQuestionLine,
  RiRefreshLine,
  RiLoader4Line,
  RiSettings4Line
} from 'react-icons/ri'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddServerModal, ServerFormData } from '@/components/modals/add-server-modal'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar
} from 'recharts'
import { RealtimeMonitor } from './realtime-monitor'
import { ServerCardView } from '@/components/dashboard/server-card-view'
import { ProcessMetricsTable } from '@/components/dashboard/process-metrics-table'
import { ProcessTopCards } from '@/components/dashboard/process-top-cards'
import { ResourceUsageChart } from '@/components/dashboard/resource-usage-chart'
import { ResourceInfoCell } from '@/components/dashboard/resource-info-cell'

interface Servidor {
  uid: string
  created_at: string
  titular: string
  ip: string | null
  senha: string | null
  cpu: number | null
  ram: number | null
  nome: string | null
  storage: number | null
  banda: number | null
  location: string | null
  sistema: string | null
  tipo: string | null
  status: 'online' | 'offline' | null
  mtm_users: {
    nome: string | null
  } | null
  titular_nome: string | null
  url_prov: string | null
  conta_prov: string | null
  senha_prov: string | null
}

interface ListVM {
  id: string
  nome: string | null
  vcpu: number | null
  core: string | null
  ram: string | null
  nvme: string | null
  usd: number | null
  banda: string | null
  tipo: string | null
}

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

export default function DashboardPage() {
  const { profile } = useAuth()
  useProfileRefresh()
  const [servidores, setServidores] = useState<Servidor[]>([])
  const [upgradeOptions, setUpgradeOptions] = useState<ListVM[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingUpgrade, setLoadingUpgrade] = useState(false)
  const [selectedServer, setSelectedServer] = useState<Servidor | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [currentView, setCurrentView] = useState<'details' | 'upgrade'>('details')
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false)
  const [filtroTitular, setFiltroTitular] = useState<string>('todos')
  const [monitorDataMap, setMonitorDataMap] = useState<Record<string, MonitorData>>({});
  const [monitorLoading, setMonitorLoading] = useState(true);
  
  // Estado para o modal de instalação do agente
  const [isAgentInstallModalOpen, setIsAgentInstallModalOpen] = useState(false);
  const [newServerData, setNewServerData] = useState<{uid: string, ip: string, nome: string, user_ssh: string, senha: string} | null>(null);

  const handleCopy = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    if (profile?.uid) {
      fetchServidores()
    }
  }, [profile])
  
  // Efeito para buscar dados de monitoramento para todos os servidores
  useEffect(() => {
    if (servidores.length === 0) return;
    
    async function fetchAllMonitorData() {
      setMonitorLoading(true);
      
      const newMonitorDataMap: Record<string, MonitorData> = {};
      
      // Criar um array de promessas para buscar dados de todos os servidores
      const promises = servidores
        .filter(servidor => servidor.ip) // Filtrar apenas servidores com IP
        .map(async (servidor) => {
          if (!servidor.ip) return;
          
          try {
            const response = await fetch(`/api/monitor?ip=${servidor.ip}`);
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                newMonitorDataMap[servidor.ip] = data[0];
              }
            }
          } catch (error) {
            console.error(`Erro ao buscar dados de monitoramento para ${servidor.ip}:`, error);
          }
        });
      
      // Aguardar todas as promessas serem resolvidas
      await Promise.all(promises);
      
      setMonitorDataMap(newMonitorDataMap);
      setMonitorLoading(false);
    }
    
    fetchAllMonitorData();
    
    // Atualizar dados a cada 10 segundos
    const interval = setInterval(() => {
      fetchAllMonitorData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [servidores])

  // Função para ordenar os servidores por titular
  const ordenarServidores = (servidores: Servidor[]) => {
    return [...servidores].sort((a, b) => {
      // Primeiro, ordenar por titular_nome
      const titularA = a.titular_nome || '';
      const titularB = b.titular_nome || '';
      
      if (titularA !== titularB) {
        return titularA.localeCompare(titularB);
      }
      
      // Se os titulares forem iguais, ordenar por nome do servidor
      const nomeA = a.nome || '';
      const nomeB = b.nome || '';
      return nomeA.localeCompare(nomeB);
    });
  };

  // Função para obter a lista de titulares únicos
  const getTitularesUnicos = () => {
    const titulares = servidores
      .map(servidor => servidor.titular_nome)
      .filter((titular, index, self) => 
        titular && self.indexOf(titular) === index
      ) as string[];
    
    return titulares.sort((a, b) => a.localeCompare(b));
  };

  // Função para filtrar servidores pelo titular selecionado
  const getServidoresFiltrados = () => {
    if (filtroTitular === 'todos') {
      return servidores;
    }
    
    return servidores.filter(servidor => 
      servidor.titular_nome === filtroTitular
    );
  };

  const fetchServidores = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      // Verifica se o usuário é administrador para enviar o parâmetro isAdmin
      const isAdmin = profile?.admin === true
      console.log('Profile:', profile)
      console.log('É administrador?', isAdmin)
      
      const apiUrl = `/api/servidores?uid=${profile?.uid}${isAdmin ? '&isAdmin=true' : ''}`
      console.log('URL da API:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar servidores')
      }
      
      const data = await response.json()
      console.log('Servidores carregados:', data?.length || 0)
      console.log('Dados dos servidores:', JSON.stringify(data, null, 2))
      setServidores(ordenarServidores(data || []))
    } catch (error) {
      console.error('Erro ao carregar servidores:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }
  
  const handleRefresh = () => {
    fetchServidores(false)
  }

  const handleAddServer = async (serverData: ServerFormData) => {
    // Exibir estado de carregamento
    setLoading(true);
    
    try {
      console.log('Dados do novo servidor:', serverData)
      
      // Dados a serem enviados para a API
      const serverPayload = {
        titular: serverData.titular || profile?.uid, // Usa o titular selecionado pelo admin ou o usuário atual
        nome: serverData.nome,
        ip: serverData.ip,
        location: serverData.location,
        tipo: serverData.tipo, // Campo tipo (Computação ou Armazenamento)
        senha: serverData.senha, // Senha SSH
        user_ssh: serverData.user_ssh, // Usuário SSH
        // Mapear para os nomes corretos das colunas no banco
        providerLoginUrl: serverData.providerLoginUrl,
        providerLogin: serverData.providerLogin,
        providerPassword: serverData.providerPassword,
        // Definir valores padrão para campos que foram removidos do formulário
        sistema: 'Linux',
        cpu: 1,
        ram: 1,
        banda: 1,
        storage: 10
      }
      
      // Enviar dados para a API
      const response = await fetch('/api/servidores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serverPayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar servidor');
      }
      
      // Processar resposta bem-sucedida
      const data = await response.json();
      console.log('Servidor adicionado com sucesso:', data);
      
      // Atualizar a lista de servidores
      fetchServidores();
      
      // Não fechamos mais o modal aqui, isso será feito após a instalação do agente
      // Retornar os dados do servidor para que possam ser usados pelo modal de instalação
      return {
        uid: data.uid,
        ip: serverData.ip,
        nome: serverData.nome
      };
    } catch (error) {
      console.error('Erro ao adicionar servidor:', error);
      // Se tiver um componente de notificação, poderia exibir aqui
      return null;
    } finally {
      setLoading(false);
    }
  }
  
  // Função para lidar com a instalação do agente
  const handleInstallAgent = (serverData: {uid: string, ip: string, nome: string, user_ssh: string, senha: string}) => {
    // Armazenar os dados do servidor para uso no modal de instalação
    setNewServerData(serverData);
    
    // Fechar o modal de adição de servidor
    setIsAddServerModalOpen(false);
    
    // Abrir o modal de instalação do agente
    setIsAgentInstallModalOpen(true);
    
    // Aqui seria o lugar para iniciar a conexão SSH e instalar o agente
    // Por enquanto, apenas simulamos o processo no modal
  }

  useEffect(() => {
    async function carregarOpcoesUpgrade() {
      if (!selectedServer?.tipo) return

      setLoadingUpgrade(true)

      try {
        const response = await fetch(`/api/list_vms?tipo=${selectedServer.tipo}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao carregar opções de upgrade')
        }
        
        const data = await response.json()
        setUpgradeOptions(data || [])
      } catch (error) {
        console.error('Erro ao carregar opções de upgrade:', error)
      } finally {
        setLoadingUpgrade(false)
      }
    }

    if (currentView === 'upgrade') {
      carregarOpcoesUpgrade()
    }
  }, [selectedServer?.tipo, currentView])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <p className="text-muted-foreground">Carregando servidores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {servidores.length === 0 ? (
        <div className="bg-card rounded-lg shadow-lg p-8 text-center max-w-md mx-auto card-neomorphic">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <RiServerLine className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-white">
            Nenhum servidor registrado
          </h3>
          <p className="mb-8 mt-2 text-center text-muted-foreground">
            Você ainda não tem nenhum servidor registrado no sistema.
          </p>
          <button 
            onClick={() => setIsAddServerModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 btn-neomorphic"
          >
            Registrar Servidor
          </button>
        </div>
      ) : selectedServer ? (
        <>
          {/* Menu Superior */}
          <div className="bg-card rounded-lg overflow-hidden mb-8 card-neomorphic">
            <div className="flex items-center border-b border-border/50">
              <button 
                onClick={() => setSelectedServer(null)}
                className="p-2 hover:bg-muted/10 transition-colors border-r border-border/50"
              >
                <RiArrowLeftLine className="w-5 h-5 text-muted-foreground" />
              </button>
              <nav className="flex">
                <button 
                  onClick={() => setCurrentView('details')}
                  className={`px-4 py-3 text-sm font-medium transition-colors group ${
                    currentView === 'details'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  Detalhes
                </button>
                <button 
                  onClick={() => setCurrentView('upgrade')}
                  className={`px-4 py-3 text-sm font-medium transition-colors group ${
                    currentView === 'upgrade'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  Upgrade
                </button>
                <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                  Backup
                </button>
                <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                  Firewall
                </button>
                <button className="px-4 py-3 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors">
                  Encerrar
                </button>
              </nav>
            </div>
          </div>

          {currentView === 'details' ? (
            /* Painel de Estatísticas e Monitoramento */ 
            <div className="bg-card rounded-lg p-6 card-neomorphic">
              {/* Cabeçalho com informações básicas do servidor */}
              <div className="mb-6 pb-4 border-b border-border/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <RiServerLine className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-white">{selectedServer.nome || 'Servidor'}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">{selectedServer.ip}</p>
                        <button 
                          onClick={() => handleCopy(selectedServer.ip)}
                          className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                        >
                          <RiFileCopyLine className="w-3.5 h-3.5 text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      selectedServer.status === 'online' ? 'bg-green-500/10 text-green-500' : 
                      selectedServer.status === 'offline' ? 'bg-red-500/10 text-red-500' : 
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {selectedServer.status === 'online' && <RiCheckboxCircleFill className="w-4 h-4" />}
                      {selectedServer.status === 'offline' && <RiCloseCircleFill className="w-4 h-4" />}
                      {selectedServer.status === null && <RiQuestionLine className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {selectedServer.status === 'online' ? 'Online' : 
                        selectedServer.status === 'offline' ? 'Offline' : 
                        'Desconhecido'}
                      </span>
                    </div>
                    <button 
                      onClick={handleRefresh}
                      className="p-2 rounded-full bg-card border border-border/30 hover:bg-muted/10 transition-colors btn-neomorphic"
                      title="Atualizar dados"
                    >
                      {refreshing ? (
                        <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <RiRefreshLine className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Área para os gráficos de monitoramento */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2 text-white">Monitoramento em Tempo Real</h2>
                <RealtimeMonitor selectedServer={selectedServer} />
              </div>
              
              {/* TOP 3 Processos - CPU e RAM */}
              {selectedServer && selectedServer.ip && (
                <ProcessTopCards serverIp={selectedServer.ip} refreshInterval={60000} />
              )}
              
              {/* Métricas de Processos */}
              {selectedServer && selectedServer.ip && (
                <ProcessMetricsTable serverIp={selectedServer.ip} refreshInterval={10000} />
              )}
            </div>
          ) : currentView === 'upgrade' ? (
            <div className="space-y-6">
              {/* Informação do plano atual */}
              <div className="bg-card rounded-lg p-6 card-neomorphic">
                <h3 className="text-lg font-medium text-white mb-2">Plano Atual</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CPU</p>
                    <p className="text-card-foreground">{selectedServer?.cpu} vCPU</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RAM</p>
                    <p className="text-card-foreground">{selectedServer?.ram} GB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="text-card-foreground">{selectedServer?.storage} GB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bandwidth</p>
                    <p className="text-card-foreground">{selectedServer?.banda} TB</p>
                  </div>
                </div>
              </div>

              {/* Opções de upgrade */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upgradeOptions
                  .filter(option => {
                    const currentCpu = selectedServer?.cpu || 0
                    const currentRam = selectedServer?.ram || 0
                    const currentStorage = selectedServer?.storage || 0
                    
                    const optionCpu = option.vcpu || 0
                    const optionRam = parseFloat(option.ram?.replace(/[^0-9.]/g, '') || '0')
                    const optionStorage = parseFloat(option.nvme?.replace(/[^0-9.]/g, '') || '0')
                    
                    return optionCpu > currentCpu && 
                           optionRam > currentRam && 
                           optionStorage > currentStorage
                  })
                  .sort((a, b) => (a.usd || 0) - (b.usd || 0))
                  .map((option) => (
                    <div 
                      key={option.id}
                      className="bg-card rounded-lg p-6 hover:bg-muted/10 transition-colors cursor-pointer border border-border/50 card-neomorphic"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium text-white">{option.nome || `Plano ${option.tipo}`}</h4>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Preço Mensal</p>
                          <p className="text-lg font-medium text-primary">${option.usd}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">CPU</p>
                          <p className="text-card-foreground">{option.vcpu} vCPU</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">RAM</p>
                          <p className="text-card-foreground">{option.ram}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">NVMe</p>
                          <p className="text-card-foreground">{option.nvme}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bandwidth</p>
                          <p className="text-card-foreground">{option.banda}</p>
                        </div>
                      </div>
                      <button className="w-full mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 btn-neomorphic">
                        Fazer Upgrade
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* Toggle de visualização */}
          <div className="flex items-center justify-between mb-4 bg-card rounded-lg py-3 px-4 card-neomorphic">
            <div className="flex items-center gap-3">
              <div className="switch-container">
                <Button
                  data-active={viewMode === 'table'}
                  onClick={() => setViewMode('table')}
                  className="switch-button p-2 rounded-l-md transition-all"
                  variant="ghost"
                >
                  <RiTableLine className="w-5 h-5" />
                </Button>
                <Button
                  data-active={viewMode === 'card'}
                  onClick={() => setViewMode('card')}
                  className="switch-button p-2 rounded-r-md transition-all"
                  variant="ghost"
                >
                  <RiLayoutGridLine className="w-5 h-5" />
                </Button>
              </div>
              
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                disabled={refreshing}
                className="bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner btn-neomorphic"
                title="Atualizar dados"
              >
                {refreshing ? (
                  <RiLoader4Line className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-primary" />
                )}
              </Button>

              {/* Filtro por titular (apenas para admins) */}
              {profile?.admin && getTitularesUnicos().length > 0 && (
                <div className="relative ml-2">
                  <select
                    value={filtroTitular}
                    onChange={(e) => setFiltroTitular(e.target.value)}
                    className="bg-card border border-border/30 text-white rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner appearance-none btn-neomorphic"
                  >
                    <option value="todos">Todos os titulares</option>
                    {getTitularesUnicos().map((titular) => (
                      <option key={titular} value={titular}>
                        {titular}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsAddServerModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-button-dark text-white hover:bg-button-dark/90 transition-colors btn-neomorphic"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adicionar Servidor</span>
            </button>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-card rounded-lg overflow-hidden card-neomorphic">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {!profile?.admin && (
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 text-muted-foreground font-medium">SO</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">Nome</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">IP</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">CPU</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">RAM</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">NVMe</th>
                        <th className="text-right p-4 text-muted-foreground font-medium">Ações</th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {profile?.admin ? (
                      // Versão para administradores com agrupamento por titular
                      <>
                        {getServidoresFiltrados().reduce((acc: JSX.Element[], servidor, index, array) => {
                          // Verificar se é o primeiro servidor ou se o titular mudou
                          const isNewTitular = index === 0 || servidor.titular_nome !== array[index - 1].titular_nome;
                          
                          // Se for um novo titular, adicionar uma linha de cabeçalho
                          if (isNewTitular && servidor.titular_nome) {
                            // Contar quantos servidores este titular possui
                            const servidoresDoTitular = array.filter(s => s.titular_nome === servidor.titular_nome).length;
                            
                            acc.push(
                              <tr key={`header-${servidor.titular}`} className="bg-primary/5 border-t border-b border-border/50">
                                <td colSpan={7} className="p-2 px-4">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-primary">
                                      {servidor.titular_nome} ({servidoresDoTitular} {servidoresDoTitular === 1 ? 'servidor' : 'servidores'})
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                            
                            acc.push(
                              <tr key={`columns-${servidor.titular}`} className="border-b border-border/50 bg-card">
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">SO</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">Nome</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">IP</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">CPU</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">RAM</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">NVMe</th>
                                <th className="text-right p-2 text-muted-foreground font-medium text-sm">Ações</th>
                              </tr>
                            );
                          }
                          
                          acc.push(
                            <tr key={servidor.uid} className="border-b border-border/50 hover:bg-muted/5">
                              <td className="p-4">
                                {servidor.sistema?.toLowerCase().includes('ubuntu') && <RiUbuntuFill className="w-6 h-6 text-[#E95420]" />}
                                {servidor.sistema?.toLowerCase().includes('windows') && <RiWindowsFill className="w-6 h-6 text-[#00A4EF]" />}
                                {servidor.sistema?.toLowerCase().includes('centos') && <RiCentosFill className="w-6 h-6 text-[#932279]" />}
                              </td>
                              <td className="p-4">
                                {servidor.url_prov ? (
                                  <a 
                                    href={servidor.url_prov.startsWith('http') 
                                      ? `${servidor.url_prov}${servidor.url_prov.includes('?') ? '&' : '?'}email=${servidor.conta_prov || ''}`
                                      : `https://${servidor.url_prov}${servidor.url_prov?.includes('?') ? '&' : '?'}email=${servidor.conta_prov || ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline"
                                  >
                                    {servidor.nome || 'Acessar painel'}
                                  </a>
                                ) : (
                                  <span className="font-medium">{servidor.nome || '-'}</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span>{servidor.ip}</span>
                                  <button 
                                    onClick={() => handleCopy(servidor.ip)}
                                    className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                                  >
                                    <RiFileCopyLine className="w-4 h-4 text-primary" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 min-w-[190px] py-5">
                                <ResourceInfoCell
                                  totalValue={`${servidor.cpu} vCPU`}
                                  usedPercentage={servidor.ip && monitorDataMap[servidor.ip || '']?.cpu_usada || 0}
                                  type="cpu"
                                />
                              </td>
                              <td className="p-4 min-w-[190px] py-5">
                                <ResourceInfoCell
                                  totalValue={`${servidor.ram} GB`}
                                  usedPercentage={servidor.ip && monitorDataMap[servidor.ip || '']?.mem_usada_p || 0}
                                  type="memory"
                                />
                              </td>
                              <td className="p-4 min-w-[190px] py-5">
                                <ResourceInfoCell
                                  totalValue={`${servidor.storage} GB`}
                                  usedPercentage={servidor.ip && monitorDataMap[servidor.ip || '']?.disco_uso_p || 0}
                                  type="storage"
                                />
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setSelectedServer(servidor)}
                                  className="inline-flex items-center justify-center rounded-md bg-button-dark p-2 text-white hover:bg-button-dark/80 transition-colors btn-neomorphic"
                                >
                                  <RiEyeLine className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                          
                          return acc;
                        }, [])}
                      </>
                    ) : (
                      // Versão normal para usuários não-admin
                      <>
                        {getServidoresFiltrados().map((servidor) => (
                          <tr key={servidor.uid} className="border-b border-border/50 hover:bg-muted/5">
                            <td className="p-4">
                              {servidor.sistema?.toLowerCase().includes('ubuntu') && <RiUbuntuFill className="w-6 h-6 text-[#E95420]" />}
                              {servidor.sistema?.toLowerCase().includes('windows') && <RiWindowsFill className="w-6 h-6 text-[#00A4EF]" />}
                              {servidor.sistema?.toLowerCase().includes('centos') && <RiCentosFill className="w-6 h-6 text-[#932279]" />}
                            </td>
                            <td className="p-4">
                              {servidor.url_prov ? (
                                <a 
                                  href={servidor.url_prov.startsWith('http') 
                                    ? `${servidor.url_prov}${servidor.url_prov.includes('?') ? '&' : '?'}email=${servidor.conta_prov || ''}`
                                    : `https://${servidor.url_prov}${servidor.url_prov?.includes('?') ? '&' : '?'}email=${servidor.conta_prov || ''}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline"
                                >
                                  {servidor.nome || 'Acessar painel'}
                                </a>
                              ) : (
                                <span className="font-medium">{servidor.nome || '-'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span>{servidor.ip}</span>
                                <button 
                                  onClick={() => handleCopy(servidor.ip)}
                                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                  <RiFileCopyLine className="w-4 h-4 text-primary" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 min-w-[190px] py-5">
                              <ResourceInfoCell
                                totalValue={`${servidor.cpu} vCPU`}
                                usedPercentage={servidor.ip && monitorDataMap[servidor.ip || '']?.cpu_usada || 0}
                                type="cpu"
                              />
                            </td>
                            <td className="p-4 min-w-[190px] py-5">
                              <ResourceInfoCell
                                totalValue={`${servidor.ram} GB`}
                                usedPercentage={servidor.ip && monitorDataMap[servidor.ip || '']?.mem_usada_p || 0}
                                type="memory"
                              />
                            </td>
                            <td className="p-4 min-w-[190px] py-5">
                              <ResourceInfoCell
                                totalValue={`${servidor.storage} GB`}
                                usedPercentage={servidor.ip && monitorDataMap[servidor.ip || '']?.disco_uso_p || 0}
                                type="storage"
                              />
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedServer(servidor)}
                                className="inline-flex items-center justify-center rounded-md bg-button-dark p-2 text-white hover:bg-button-dark/80 transition-colors btn-neomorphic"
                              >
                                <RiEyeLine className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <ServerCardView 
              servidores={getServidoresFiltrados()} 
              monitorDataMap={monitorDataMap} 
              monitorLoading={monitorLoading} 
              onSelectServer={setSelectedServer} 
              handleCopy={handleCopy}
            />
          )}
        </>
      )}
      
      {/* Modal de Adicionar Servidor */}
      <AddServerModal 
        isOpen={isAddServerModalOpen}
        onClose={() => setIsAddServerModalOpen(false)}
        onSave={handleAddServer}
        onInstallAgent={handleInstallAgent}
      />
      
      {/* Modal de Instalação do Agente */}
      {newServerData && (
        <AgentInstallationModal
          isOpen={isAgentInstallModalOpen}
          onClose={() => {
            setIsAgentInstallModalOpen(false);
            setNewServerData(null);
          }}
          serverData={newServerData}
        />
      )}
    </div>
  )
}
