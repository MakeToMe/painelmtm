'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
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
  RiCentosFill
} from 'react-icons/ri'

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
  const [servidores, setServidores] = useState<Servidor[]>([])
  const [upgradeOptions, setUpgradeOptions] = useState<ListVM[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedServer, setSelectedServer] = useState<Servidor | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [currentView, setCurrentView] = useState<'details' | 'upgrade'>('details')

  const handleCopy = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    async function carregarServidores() {
      if (!profile?.uid) return

      try {
        const { data, error } = await supabase
          .from('servidores')
          .select('*')
          .eq('titular', profile.uid)

        if (error) {
          console.error('Erro ao carregar servidores:', error)
          return
        }

        setServidores(data || [])
      } catch (error) {
        console.error('Erro ao carregar servidores:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarServidores()
  }, [profile?.uid])

  useEffect(() => {
    async function carregarOpcoesUpgrade() {
      if (!selectedServer?.tipo) return

      try {
        const { data, error } = await supabase
          .from('list_vms')
          .select('*')
          .eq('tipo', selectedServer.tipo)

        if (error) {
          console.error('Erro ao carregar opções de upgrade:', error)
          return
        }

        setUpgradeOptions(data || [])
      } catch (error) {
        console.error('Erro ao carregar opções de upgrade:', error)
      }
    }

    if (currentView === 'upgrade') {
      carregarOpcoesUpgrade()
    }
  }, [selectedServer?.tipo, currentView])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-card/50 rounded-lg p-6">
          <p className="text-muted-foreground">Carregando servidores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Card de boas-vindas */}
      <div className="bg-card/50 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <img
            src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
            alt="Foto de perfil"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              Bem-vindo, {profile?.nome || 'Usuário'}!
            </h1>
            <p className="text-muted-foreground">
              Este é seu painel de controle MTM
            </p>
          </div>
        </div>
      </div>

      {servidores.length === 0 ? (
        <div className="bg-card/50 rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <RiServerLine className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-card-foreground">
            Nenhum servidor registrado
          </h3>
          <p className="mb-8 mt-2 text-center text-muted-foreground">
            Você ainda não tem nenhum servidor registrado no sistema.
          </p>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            Registrar Servidor
          </button>
        </div>
      ) : selectedServer ? (
        <>
          {/* Menu Superior */}
          <div className="bg-card/50 rounded-lg overflow-hidden mb-8">
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
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    currentView === 'details'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  Detalhes
                </button>
                <button 
                  onClick={() => setCurrentView('upgrade')}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
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
            <div className="bg-card/50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hostname */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiServerLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HOSTNAME</p>
                    <p className="text-card-foreground font-medium">{selectedServer.nome || '-'}</p>
                  </div>
                </div>

                {/* Root Password */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
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
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
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
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiCpuLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPU Cores</p>
                    <p className="text-card-foreground font-medium">{selectedServer.cpu || '-'}</p>
                  </div>
                </div>

                {/* RAM */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiHardDriveLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RAM</p>
                    <p className="text-card-foreground font-medium">{selectedServer.ram ? `${selectedServer.ram}GB` : '-'}</p>
                  </div>
                </div>

                {/* Storage */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiDatabase2Line className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="text-card-foreground font-medium">{selectedServer.storage ? `${selectedServer.storage}GB` : '-'}</p>
                  </div>
                </div>

                {/* Bandwidth */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiSpeedLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bandwidth</p>
                    <p className="text-card-foreground font-medium">{selectedServer.banda ? `${selectedServer.banda}TB` : '-'}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <RiGlobalLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-card-foreground font-medium">{selectedServer.location || '-'}</p>
                  </div>
                </div>

                {/* Sistema Operacional */}
                <div className="flex items-start gap-4 bg-card rounded-lg p-4">
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
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-medium text-card-foreground mb-2">Plano Atual</h3>
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
                    // Converter valores para números para comparação
                    const currentCpu = selectedServer?.cpu || 0
                    const currentRam = selectedServer?.ram || 0
                    const currentStorage = selectedServer?.storage || 0
                    
                    const optionCpu = option.vcpu || 0
                    const optionRam = parseFloat(option.ram?.replace(/[^0-9.]/g, '') || '0')
                    const optionStorage = parseFloat(option.nvme?.replace(/[^0-9.]/g, '') || '0')
                    
                    // Retorna true apenas se TODAS as especificações são maiores que as atuais
                    return optionCpu > currentCpu && 
                           optionRam > currentRam && 
                           optionStorage > currentStorage
                  })
                  .sort((a, b) => (a.usd || 0) - (b.usd || 0))
                  .map((option) => (
                    <div 
                      key={option.id}
                      className="bg-card rounded-lg p-6 hover:bg-muted/10 transition-colors cursor-pointer border border-border/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium text-card-foreground">{option.nome || `Plano ${option.tipo}`}</h4>
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
                      <button className="w-full mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center rounded-md bg-card/50 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-card-foreground'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'card'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-card-foreground'
                }`}
              >
                Cards
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-card/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-muted-foreground font-medium">SO</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Nome</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">IP</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Sistema</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">CPU</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">RAM</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">NVMe</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servidores.map((servidor) => (
                      <tr key={servidor.uid} className="border-b border-border/50 hover:bg-muted/5">
                        <td className="p-4">
                          {servidor.sistema?.toLowerCase().includes('ubuntu') && <RiUbuntuFill className="w-6 h-6 text-[#E95420]" />}
                          {servidor.sistema?.toLowerCase().includes('windows') && <RiWindowsFill className="w-6 h-6 text-[#00A4EF]" />}
                          {servidor.sistema?.toLowerCase().includes('centos') && <RiCentosFill className="w-6 h-6 text-[#932279]" />}
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{servidor.nome || '-'}</span>
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
                        <td className="p-4">{servidor.sistema || '-'}</td>
                        <td className="p-4">{servidor.cpu} vCPU</td>
                        <td className="p-4">{servidor.ram} GB</td>
                        <td className="p-4">{servidor.storage} GB</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedServer(servidor)}
                            className="inline-flex items-center justify-center rounded-md bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <RiEyeLine className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servidores.map((servidor) => (
                <div 
                  key={servidor.uid}
                  className="bg-card/50 rounded-lg p-6 hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedServer(servidor)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <RiServerLine className="w-5 h-5 text-primary" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedServer(servidor)
                      }}
                      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <RiEyeLine className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <h3 className="text-lg font-medium text-card-foreground mb-2">
                    {servidor.nome || 'Servidor sem nome'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{servidor.ip}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CPU</p>
                      <p className="text-card-foreground">{servidor.cpu} Cores</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">RAM</p>
                      <p className="text-card-foreground">{servidor.ram} GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Storage</p>
                      <p className="text-card-foreground">{servidor.storage} GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bandwidth</p>
                      <p className="text-card-foreground">{servidor.banda} TB</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
