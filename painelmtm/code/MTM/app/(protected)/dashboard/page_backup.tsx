'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useProfileRefresh } from '@/hooks/use-profile-refresh'
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

  const handleCopy = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    if (profile?.uid) {
      fetchServidores()
    }
  }, [profile])

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
        sistema: serverData.sistema,
        ip: serverData.ip,
        cpu: serverData.cpu,
        ram: serverData.ram,
        banda: serverData.banda,
        storage: serverData.storage,
        location: serverData.location,
        tipo: serverData.tipo, // Campo tipo (Computação ou Armazenamento)
        senha: serverData.senha, // Garantir que a senha seja enviada
        // Mapear para os nomes corretos das colunas no banco
        providerLoginUrl: serverData.providerLoginUrl,
        providerLogin: serverData.providerLogin,
        providerPassword: serverData.providerPassword
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
      
      // Fechar o modal
      setIsAddServerModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar servidor:', error);
      // Se tiver um componente de notificação, poderia exibir aqui
    } finally {
      setLoading(false);
    }
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
      {/* Navbar com elementos alinhados à direita */}
      <div className="bg-card rounded-lg mb-8 card-neomorphic">
        <div className="flex items-center justify-end p-4">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 rounded-full bg-card hover:bg-muted/10 transition-colors"
              aria-label="Configurações"
            >
              <RiSettings4Line className="w-5 h-5 text-primary" />
            </button>
            <div className="flex items-center gap-2 bg-muted/10 rounded-md px-3 py-1.5">
              <img
                src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
                alt="Foto de perfil"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-white font-medium">
                {profile?.nome?.split(' ')[0] || 'Usuário'}
              </span>
            </div>
          </div>
        </div>
      </div>

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
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 btn-neomorphic">
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
            /* Quadro Informativo */ 
            <div className="bg-card rounded-lg p-6 card-neomorphic">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    {selectedServer.status === 'online' && (
                      <RiCheckboxCircleFill className="w-5 h-5 text-green-500" />
                    )}
                    {selectedServer.status === 'offline' && (
                      <RiCloseCircleFill className="w-5 h-5 text-red-500" />
                    )}
                    {selectedServer.status === null && (
                      <RiQuestionLine className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">STATUS</p>
                    <p className={`font-medium ${
                      selectedServer.status === 'online' ? 'text-green-500' : 
                      selectedServer.status === 'offline' ? 'text-red-500' : 
                      'text-gray-400'
                    }`}>
                      {selectedServer.status === 'online' ? 'Online' : 
                       selectedServer.status === 'offline' ? 'Offline' : 
                       'Desconhecido'}
                    </p>
                  </div>
                </div>

                {/* Hostname */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiServerLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HOSTNAME</p>
                    <p className="text-card-foreground font-medium">{selectedServer.nome || '-'}</p>
                  </div>
                </div>

                {/* Root Password */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiShieldLine className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">ROOT PASSWORD</p>
                      <button 
                        onClick={() => handleCopy(selectedServer.senha)}
                        className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                      >
                        <RiFileCopyLine className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                    <p className="text-card-foreground font-medium mt-1">••••••••</p>
                  </div>
                </div>

                {/* IP Address */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiGlobalLine className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">PRIMARY IP ADDRESS</p>
                      <button 
                        onClick={() => handleCopy(selectedServer.ip)}
                        className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                      >
                        <RiFileCopyLine className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                    <p className="text-card-foreground font-medium mt-1">{selectedServer.ip || '-'}</p>
                  </div>
                </div>

                {/* CPU */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiCpuLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPU Cores</p>
                    <p className="text-card-foreground font-medium">{selectedServer.cpu || '-'}</p>
                  </div>
                </div>

                {/* RAM */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiHardDriveLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RAM</p>
                    <p className="text-card-foreground font-medium">{selectedServer.ram ? `${selectedServer.ram}GB` : '-'}</p>
                  </div>
                </div>

                {/* Storage */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiDatabase2Line className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="text-card-foreground font-medium">{selectedServer.storage ? `${selectedServer.storage}GB` : '-'}</p>
                  </div>
                </div>

                {/* Bandwidth */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiSpeedLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bandwidth</p>
                    <p className="text-card-foreground font-medium">{selectedServer.banda ? `${selectedServer.banda}TB` : '-'}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiGlobalLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-card-foreground font-medium">{selectedServer.location || '-'}</p>
                  </div>
                </div>

                {/* Sistema Operacional */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4 card-neomorphic">
                  <div className="p-2 rounded-full bg-primary/10">
                    {selectedServer.sistema?.toLowerCase().includes('ubuntu') ? (
                      <RiUbuntuFill className="w-5 h-5 text-[#E95420]" />
                    ) : selectedServer.sistema?.toLowerCase().includes('windows') ? (
                      <RiWindowsFill className="w-5 h-5 text-[#00A4EF]" />
                    ) : selectedServer.sistema?.toLowerCase().includes('centos') ? (
                      <RiCentosFill className="w-5 h-5 text-[#932279]" />
                    ) : (
                      <RiTerminalBoxFill className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sistema Operacional</p>
                    <p className="text-card-foreground font-medium">{selectedServer.sistema || '-'}</p>
                  </div>
                </div>
              </div>
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
                        <th className="text-left p-4 text-muted-foreground font-medium">Senha</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">IP</th>
                        <th className="text-left p-4 text-muted-foreground font-medium">SSH</th>
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
                                <td colSpan={10} className="p-2 px-4">
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
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">Senha</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">IP</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">SSH</th>
                                <th className="text-left p-2 text-muted-foreground font-medium text-sm">Titular</th>
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
                                  <span>••••••••</span>
                                  <button 
                                    onClick={() => handleCopy(servidor.senha_prov)}
                                    className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                                  >
                                    <RiFileCopyLine className="w-4 h-4 text-primary" />
                                  </button>
                                </div>
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
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span>••••••••</span>
                                  <button 
                                    onClick={() => handleCopy(servidor.senha)}
                                    className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                                  >
                                    <RiFileCopyLine className="w-4 h-4 text-primary" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">{servidor.titular_nome || '-'}</td>
                              <td className="p-4">{servidor.cpu} vCPU</td>
                              <td className="p-4">{servidor.ram} GB</td>
                              <td className="p-4">{servidor.storage} GB</td>
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
                                <span>••••••••</span>
                                <button 
                                  onClick={() => handleCopy(servidor.senha_prov)}
                                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                  <RiFileCopyLine className="w-4 h-4 text-primary" />
                                </button>
                              </div>
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
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span>••••••••</span>
                                <button 
                                  onClick={() => handleCopy(servidor.senha)}
                                  className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                  <RiFileCopyLine className="w-4 h-4 text-primary" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4">{servidor.cpu} vCPU</td>
                            <td className="p-4">{servidor.ram} GB</td>
                            <td className="p-4">{servidor.storage} GB</td>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getServidoresFiltrados().map((servidor) => (
                <div 
                  key={servidor.uid}
                  className="bg-card rounded-lg p-6 hover:bg-muted/10 transition-colors cursor-pointer card-neomorphic"
                  onClick={() => setSelectedServer(servidor)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <RiServerLine className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {servidor.status === 'online' && (
                        <div className="flex items-center px-2 py-1 rounded-full bg-green-500/10">
                          <RiCheckboxCircleFill className="w-4 h-4 text-green-500" />
                          <span className="text-green-500 text-xs ml-1 font-medium">Online</span>
                        </div>
                      )}
                      {servidor.status === 'offline' && (
                        <div className="flex items-center px-2 py-1 rounded-full bg-red-500/10">
                          <RiCloseCircleFill className="w-4 h-4 text-red-500" />
                          <span className="text-red-500 text-xs ml-1 font-medium">Offline</span>
                        </div>
                      )}
                      {servidor.status === null && (
                        <div className="flex items-center px-2 py-1 rounded-full bg-gray-500/10">
                          <RiQuestionLine className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-xs ml-1 font-medium">Desconhecido</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedServer(servidor)
                        }}
                        className="p-2 rounded-full bg-button-dark hover:bg-button-dark/80 transition-colors btn-neomorphic"
                      >
                        <RiEyeLine className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {servidor.nome || 'Servidor sem nome'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{servidor.ip}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CPU</p>
                      <p className="text-white font-medium">{servidor.cpu} Cores</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">RAM</p>
                      <p className="text-white font-medium">{servidor.ram} GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Storage</p>
                      <p className="text-white font-medium">{servidor.storage} GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bandwidth</p>
                      <p className="text-white font-medium">{servidor.banda} TB</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Modal de Adicionar Servidor */}
      <AddServerModal 
        isOpen={isAddServerModalOpen}
        onClose={() => setIsAddServerModalOpen(false)}
        onSave={handleAddServer}
      />
    </div>
  )
}
