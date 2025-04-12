'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/auth-context'
import { useProfileRefresh } from '@/hooks/use-profile-refresh'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { RiLoader4Line, RiAddLine, RiDeleteBinLine, RiEdit2Line, RiTableLine, RiLayoutGridLine, RiRefreshLine, RiLinkM, RiPlugLine } from 'react-icons/ri'
import { AlertTriangle, Link2, PlusCircle, X, Eye, Edit2, Trash2, RefreshCw } from "lucide-react"

interface Integracao {
  uid: string
  titular: string
  nome: string
  chave: string
  secret: string
  url: string
  origem: string
  created_at: string
}

export default function IntegracoesPage() {
  const { profile } = useAuth()
  // Usar o hook para atualizar o perfil ao montar o componente
  const { refreshProfile } = useProfileRefresh()
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [showModal, setShowModal] = useState(false)
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIntegracao, setSelectedIntegracao] = useState<string | null>(null)
  const [selectedIntegracaoNome, setSelectedIntegracaoNome] = useState<string>('')
  const [novaIntegracao, setNovaIntegracao] = useState({
    nome: '',
    chave: '',
    secret: '',
    url: '',
    origem: ''
  })

  useEffect(() => {
    if (profile?.uid) {
      fetchIntegracoes()
    }
  }, [profile])

  const fetchIntegracoes = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    
    try {
      const response = await fetch(`/api/integracoes?uid=${profile?.uid}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar integrações')
      }
      
      const data = await response.json()
      setIntegracoes(data || [])
      
      if (!showLoading) {
        toast.success('Dados atualizados com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao buscar integrações:', error)
      toast.error(`Erro ao buscar integrações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validação diferente para Cloudflare e integração genérica
      if (novaIntegracao.nome === 'Cloudflare') {
        if (!novaIntegracao.chave) {
          toast.error('Preencha o Token API do Cloudflare')
          setIsSubmitting(false)
          return
        }
      } else {
        if (!novaIntegracao.nome || !novaIntegracao.chave) {
          toast.error('Preencha os campos obrigatórios (Nome e Chave)')
          setIsSubmitting(false)
          return
        }
      }

      let response

      if (isEditing && selectedIntegracao) {
        const updateData = {
          uid: selectedIntegracao,
          titular: profile?.uid,
          nome: novaIntegracao.nome,
          chave: novaIntegracao.chave,
          secret: novaIntegracao.nome === 'Cloudflare' ? null : novaIntegracao.secret,
          url: novaIntegracao.nome === 'Cloudflare' ? 'https://api.cloudflare.com' : novaIntegracao.url,
          origem: novaIntegracao.nome === 'Cloudflare' ? 'https://cloudflare.com/pt-br' : (novaIntegracao.origem || 'desconhecida')
        };
        
        console.log('Enviando dados para atualização:', updateData);
        
        response = await fetch('/api/integracoes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })
      } else {
        response = await fetch('/api/integracoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            titular: profile?.uid,
            nome: novaIntegracao.nome,
            chave: novaIntegracao.chave,
            secret: novaIntegracao.nome === 'Cloudflare' ? null : novaIntegracao.secret,
            url: novaIntegracao.nome === 'Cloudflare' ? 'https://api.cloudflare.com' : novaIntegracao.url,
            origem: novaIntegracao.nome === 'Cloudflare' ? 'https://cloudflare.com/pt-br' : (novaIntegracao.origem || 'desconhecida')
          })
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar integração')
      }

      // Se for uma integração Cloudflare, enviar webhook
      if (novaIntegracao.nome === 'Cloudflare') {
        try {
          // Enviar webhook sem esperar resposta
          fetch('https://rarwhk.rardevops.com/webhook/cloudflare_counts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_nome: 'Cloudflare',
              token: novaIntegracao.chave,
              userUid: profile?.uid
            })
          }).catch(webhookError => {
            console.error('Erro ao enviar webhook (não crítico):', webhookError);
            // Não exibir erro para o usuário, pois o salvamento principal já foi bem-sucedido
          });
        } catch (webhookError) {
          console.error('Erro ao enviar webhook (não crítico):', webhookError);
          // Não exibir erro para o usuário, pois o salvamento principal já foi bem-sucedido
        }
      }

      await fetchIntegracoes(false)
      
      toast.success(isEditing ? 'Integração atualizada com sucesso!' : 'Integração criada com sucesso!')
      
      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao salvar integração:', error)
      toast.error(`Erro ao salvar integração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedIntegracao) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/integracoes?id=${selectedIntegracao}&uid=${profile?.uid}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir integração')
      }

      await fetchIntegracoes(false)
      
      toast.success('Integração excluída com sucesso!')
      
      setShowDeleteModal(false)
      setSelectedIntegracao(null)
    } catch (error) {
      console.error('Erro ao excluir integração:', error)
      toast.error(`Erro ao excluir integração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditIntegracao = (id: string) => {
    const integracao = integracoes.find(item => item.uid === id)
    if (integracao) {
      setNovaIntegracao({
        nome: integracao.nome,
        chave: integracao.chave,
        secret: integracao.secret,
        url: integracao.url,
        origem: integracao.origem
      })
      setSelectedIntegracao(id)
      setIsEditing(true)
      setShowModal(true)
    }
  }

  const handleViewIntegracao = (id: string) => {
    const integracao = integracoes.find(item => item.uid === id)
    if (integracao) {
      setNovaIntegracao({
        nome: integracao.nome,
        chave: integracao.chave,
        secret: integracao.secret,
        url: integracao.url,
        origem: integracao.origem
      })
      setSelectedIntegracao(id)
      setIsEditing(false) // Modo visualização
      setShowModal(true)
    }
  }

  const resetForm = () => {
    setNovaIntegracao({
      nome: '',
      chave: '',
      secret: '',
      url: '',
      origem: ''
    });
    setIsEditing(false);
    setSelectedIntegracao(null);
  };

  const openDeleteModal = (id: string) => {
    const integracao = integracoes.find(item => item.uid === id)
    if (integracao) {
      setSelectedIntegracao(id)
      setSelectedIntegracaoNome(integracao.nome)
      setShowDeleteModal(true)
    }
  }

  const hasCloudflareIntegration = () => {
    return integracoes.some(integracao => integracao.nome === 'Cloudflare');
  }

  const openNewIntegrationModal = () => {
    resetForm();
    
    if (hasCloudflareIntegration()) {
      setShowModal(true);
    } else {
      setShowTypeSelectionModal(true);
    }
  }

  const setupCloudflareIntegration = () => {
    setNovaIntegracao({
      nome: 'Cloudflare',
      chave: '',
      secret: '',
      url: 'https://api.cloudflare.com',
      origem: 'https://cloudflare.com/pt-br'
    });
    setShowTypeSelectionModal(false);
    setShowModal(true);
  }

  const setupGenericIntegration = () => {
    resetForm();
    setShowTypeSelectionModal(false);
    setShowModal(true);
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-card rounded-lg py-4 px-5 card-neomorphic">
        <div className="flex items-center gap-2">
          <RiPlugLine className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-white">Integrações</h1>
        </div>
      </div>

      {/* Toggle de visualização */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 bg-card rounded-lg py-3 px-4 card-neomorphic gap-3">
        <div className="flex items-center">
          <div className="switch-container">
            <Button
              data-active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              className="switch-button p-1.5 rounded-l-md transition-all"
              variant="ghost"
            >
              <RiTableLine className="w-5 h-5" />
            </Button>
            <Button
              data-active={viewMode === 'card'}
              onClick={() => setViewMode('card')}
              className="switch-button p-1.5 rounded-r-md transition-all"
              variant="ghost"
            >
              <RiLayoutGridLine className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={openNewIntegrationModal}
          className="w-full sm:w-auto bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 btn-neomorphic"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8 bg-card rounded-lg p-6 card-neomorphic">
          <RiLoader4Line className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : integracoes.length === 0 ? (
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <div className="bg-muted/10 rounded-md p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Você ainda não possui integrações cadastradas.</p>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-card rounded-lg p-6 card-neomorphic">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-4 text-muted-foreground font-medium">Nome</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Chave</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Secret</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">URL Base</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Origem</th>
                  <th className="text-center p-4 text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {integracoes.map((integracao) => (
                  <tr key={integracao.uid} className="border-b border-border/40 hover:bg-muted/5">
                    <td className="p-4 text-white">{integracao.nome}</td>
                    <td className="p-4 text-muted-foreground">{integracao.chave}</td>
                    <td className="p-4 text-muted-foreground">
                      {integracao.secret ? '••••••••' : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {integracao.url || '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">{integracao.origem}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditIntegracao(integracao.uid)}
                          className="btn-neomorphic bg-amber-900/30 text-amber-400 hover:bg-amber-900/40"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(integracao.uid)}
                          className="btn-neomorphic bg-red-900/30 text-red-400 hover:bg-red-900/50 active:bg-red-900/60 border-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {integracoes.map((integracao) => (
            <div 
              key={integracao.uid}
              className="bg-card rounded-lg shadow-md p-5 card-neomorphic flex flex-col min-h-[280px]"
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">{integracao.nome}</h3>
                  <div className="p-1.5 rounded-full bg-primary/10 shadow-inner card-neomorphic">
                    <Link2 className="text-primary" size={16} />
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Chave</p>
                    <p className="text-sm text-white truncate">{integracao.chave}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Secret</p>
                    <p className="text-sm text-white">••••••••••</p>
                  </div>
                  
                  {integracao.url && (
                    <div>
                      <p className="text-xs text-muted-foreground">URL</p>
                      <p className="text-sm text-white truncate">{integracao.url}</p>
                    </div>
                  )}
                  
                  {integracao.origem && (
                    <div>
                      <p className="text-xs text-muted-foreground">Origem</p>
                      <p className="text-sm text-white">{integracao.origem}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer-divider">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/40 btn-neomorphic p-2 h-auto"
                    onClick={() => handleEditIntegracao(integracao.uid)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-red-900/30 text-red-400 hover:bg-red-900/50 active:bg-red-900/60 border-red-500/30 btn-neomorphic p-2 h-auto"
                    onClick={() => openDeleteModal(integracao.uid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && createPortal(
        <>
          <div className="modal-overlay"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 shadow-inner card-neomorphic">
                    <Link2 className="text-primary" size={18} />
                  </div>
                  {!isEditing && selectedIntegracao ? 'Visualizar Integração' : isEditing ? 'Editar Integração' : 'Nova Integração'}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <form 
                onSubmit={handleSubmit}
                autoComplete="off"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nome</label>
                    <Input
                      value={novaIntegracao.nome}
                      onChange={(e) => setNovaIntegracao(prev => ({ ...prev, nome: e.target.value }))}
                      className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                      placeholder="Nome da integração"
                      autoComplete="off"
                      disabled={(!isEditing && selectedIntegracao !== null) || novaIntegracao.nome === 'Cloudflare'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{novaIntegracao.nome === 'Cloudflare' ? 'Token API' : 'Chave'}</label>
                    <Input
                      value={novaIntegracao.chave}
                      onChange={(e) => setNovaIntegracao(prev => ({ ...prev, chave: e.target.value }))}
                      className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                      placeholder={novaIntegracao.nome === 'Cloudflare' ? 'Token API do Cloudflare' : 'Chave de API'}
                      autoComplete="off"
                      disabled={!isEditing && selectedIntegracao !== null}
                    />
                  </div>
                  {novaIntegracao.nome !== 'Cloudflare' && (
                    <div>
                      <label className="text-sm text-muted-foreground">Secret</label>
                      <Input
                        type="password"
                        value={novaIntegracao.secret}
                        onChange={(e) => setNovaIntegracao(prev => ({ ...prev, secret: e.target.value }))}
                        className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                        placeholder="Secret (opcional)"
                        autoComplete="new-password"
                        disabled={!isEditing && selectedIntegracao !== null}
                      />
                    </div>
                  )}
                  {novaIntegracao.nome !== 'Cloudflare' && (
                    <div>
                      <label className="text-sm text-muted-foreground">URL</label>
                      <Input
                        value={novaIntegracao.url}
                        onChange={(e) => setNovaIntegracao(prev => ({ ...prev, url: e.target.value }))}
                        className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                        placeholder="URL da API (opcional)"
                        autoComplete="off"
                        disabled={!isEditing && selectedIntegracao !== null}
                      />
                    </div>
                  )}
                  {novaIntegracao.nome !== 'Cloudflare' && (
                    <div>
                      <label className="text-sm text-muted-foreground">Origem</label>
                      <Input
                        value={novaIntegracao.origem}
                        onChange={(e) => setNovaIntegracao(prev => ({ ...prev, origem: e.target.value }))}
                        className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                        placeholder="Origem da integração"
                        autoComplete="off"
                        disabled={!isEditing && selectedIntegracao !== null}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  {(isEditing || !selectedIntegracao) && (
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="flex-1 btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? 'Salvando...' : 'Criando...'}
                        </>
                      ) : (
                        isEditing ? 'Salvar' : 'Criar'
                      )}
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                  >
                    {!isEditing && selectedIntegracao ? 'Fechar' : 'Cancelar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}

      {showTypeSelectionModal && createPortal(
        <>
          <div className="modal-overlay"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 shadow-inner card-neomorphic">
                    <Link2 className="text-primary" size={18} />
                  </div>
                  Selecione o tipo de integração
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTypeSelectionModal(false)}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Escolha o tipo de integração que deseja configurar:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 py-6 h-auto flex flex-col gap-2"
                  onClick={setupCloudflareIntegration}
                >
                  <div className="p-2 rounded-full bg-primary/10 shadow-inner card-neomorphic">
                    <RiPlugLine className="text-primary" size={24} />
                  </div>
                  <span>Cloudflare</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 py-6 h-auto flex flex-col gap-2"
                  onClick={setupGenericIntegration}
                >
                  <div className="p-2 rounded-full bg-primary/10 shadow-inner card-neomorphic">
                    <RiLinkM className="text-primary" size={24} />
                  </div>
                  <span>Genérica</span>
                </Button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showDeleteModal && createPortal(
        <>
          <div className="modal-overlay"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 shadow-inner card-neomorphic">
                    <Link2 className="text-primary" size={18} />
                  </div>
                  Excluir Integração
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Tem certeza que deseja excluir a integração <strong>{selectedIntegracaoNome}</strong>?
                </p>
                <div className="flex items-center gap-2 mt-2 p-3 bg-red-500/10 rounded-md border border-red-500/30">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <p className="text-sm text-red-400">
                    Esta ação é irreversível e não poderá ser desfeita.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 btn-neomorphic bg-red-900/30 text-red-400 hover:bg-red-900/50 active:bg-red-900/60 border-red-500/30"
                  onClick={handleDelete}
                >
                  Excluir
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
