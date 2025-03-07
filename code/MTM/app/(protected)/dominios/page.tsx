'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/auth-context'
import { useProfileRefresh } from '@/hooks/use-profile-refresh'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import {
  RiLoader4Line,
  RiAddLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiTableLine,
  RiLayoutGridLine,
  RiRefreshLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiFileCopyLine
} from 'react-icons/ri'
import { Search, RefreshCw } from 'lucide-react'
import { 
  RiGlobalLine, 
  RiPlugLine, 
  RiCloudLine, 
  RiShieldCheckLine,
  RiShieldFlashLine,
  RiEyeLine,
  RiExternalLinkLine
} from 'react-icons/ri'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Dominio {
  Uid: string
  titular: string
  dominio_nome: string
  dominio_id: string
  conta_nome: string
  conta_id: string
  status: 'ativo' | 'inativo' | 'pendente'
  created_at: string
}

interface Subdominio {
  uid: string
  nome: string
  tipo: string
  ip: string
  proxy: boolean
  created_at: string
  dominio_id: string
}

export default function DominiosPage() {
  const { profile } = useAuth()
  const { refreshProfile } = useProfileRefresh()
  const [loading, setLoading] = useState(true)
  const [dominios, setDominios] = useState<Dominio[]>([])
  const [subdominios, setSubdominios] = useState<Subdominio[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [subdomainViewMode, setSubdomainViewMode] = useState<'table' | 'card'>('table')
  const [selectedDominio, setSelectedDominio] = useState<Dominio | null>(null)
  const [selectedSubdominio, setSelectedSubdominio] = useState<Subdominio | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    nome: '',
    tipo: '',
    ip: '',
    proxy: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasCloudflareIntegration, setHasCloudflareIntegration] = useState(false)
  const [isLoadingSubdominios, setIsLoadingSubdominios] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInputValue, setPageInputValue] = useState('1')
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [currentSubdomainPage, setCurrentSubdomainPage] = useState(1)
  const [subdomainPageInputValue, setSubdomainPageInputValue] = useState('1')
  const itemsPerPage = 6

  // Carregar domínios e verificar integração quando o perfil estiver disponível
  useEffect(() => {
    if (profile?.uid) {
      const initializeData = async () => {
        await Promise.all([
          fetchDominios(),
          checkCloudflareIntegration()
        ]);
      };
      
      initializeData();
    }
  }, [profile?.uid]);

  // Carregar subdomínios quando um domínio for selecionado
  useEffect(() => {
    if (selectedDominio && profile?.uid) {
      setCurrentSubdomainPage(1); // Reset para a primeira página
      setSubdomainPageInputValue('1');
      fetchSubdominios(selectedDominio);
    }
  }, [selectedDominio?.Uid, profile?.uid]);

  // Verificar se o usuário já tem integração com Cloudflare configurada
  const checkCloudflareIntegration = async () => {
    if (!profile?.uid) return;

    try {
      const response = await fetch(`/api/cloudflare/check?titular=${encodeURIComponent(profile.uid)}`);
      if (!response.ok) {
        throw new Error('Erro ao verificar integração com Cloudflare');
      }
      const data = await response.json();
      setHasCloudflareIntegration(data.hasIntegration || false);
    } catch (error) {
      console.error('Erro ao verificar integração com Cloudflare:', error);
    }
  };

  // Buscar domínios do usuário
  const fetchDominios = async () => {
    if (!profile?.uid) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/dominios?titular=${encodeURIComponent(profile.uid)}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar domínios');
      }
      const data = await response.json();
      setDominios(data);
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
      toast.error('Erro ao carregar domínios');
    } finally {
      setLoading(false);
    }
  };

  // Buscar subdomínios do usuário
  const fetchSubdominios = async (dominio: Dominio) => {
    if (!profile?.uid) return;
    console.log('Buscando subdomínios para:', dominio);

    setIsLoadingSubdominios(true);
    try {
      const response = await fetch(
        `/api/subdominios?titular=${encodeURIComponent(profile.uid)}&dominio=${encodeURIComponent(dominio.Uid)}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao carregar subdomínios');
      }
      
      const data = await response.json();
      setSubdominios(data);
    } catch (error) {
      console.error('Erro ao carregar subdomínios:', error);
      toast.error('Erro ao carregar subdomínios');
    } finally {
      setIsLoadingSubdominios(false);
    }
  };

  // Função para atualizar os dados
  const handleRefresh = async () => {
    if (!profile?.uid) return;
    
    try {
      await fetchDominios();
      if (selectedDominio) {
        await fetchSubdominios(selectedDominio);
      }
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    }
  };

  // Funções de paginação
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchDominios();
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      fetchDominios();
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInputValue);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        fetchDominios();
      }
    }
  };

  // Funções de paginação para subdomínios
  const goToPreviousSubdomainPage = () => {
    if (currentSubdomainPage > 1) {
      const newPage = currentSubdomainPage - 1;
      setCurrentSubdomainPage(newPage);
      setSubdomainPageInputValue(newPage.toString());
    }
  };

  const goToNextSubdomainPage = () => {
    const totalSubdomainPages = Math.ceil(subdominios.length / itemsPerPage);
    if (currentSubdomainPage < totalSubdomainPages) {
      const newPage = currentSubdomainPage + 1;
      setCurrentSubdomainPage(newPage);
      setSubdomainPageInputValue(newPage.toString());
    }
  };

  const handleSubdomainPageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(subdomainPageInputValue);
      const totalSubdomainPages = Math.ceil(subdominios.length / itemsPerPage);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalSubdomainPages) {
        setCurrentSubdomainPage(newPage);
        setSubdomainPageInputValue(newPage.toString());
      } else {
        // Se o número for inválido, restaura o valor anterior
        setSubdomainPageInputValue(currentSubdomainPage.toString());
      }
    }
  };

  // Função para buscar subdomínios
  const handleViewDominio = async (dominio: any) => {
    setSelectedDominio(dominio);
    setIsLoadingSubdominios(true);
    
    try {
      await fetchSubdominios(dominio);
    } catch (error) {
      console.error('Erro ao carregar subdomínios:', error);
      toast.error('Erro ao carregar subdomínios');
    } finally {
      setIsLoadingSubdominios(false);
    }
  };

  // Função para atualizar o subdomínio
  const handleSaveSubdomain = async () => {
    if (!selectedDominio || !selectedSubdominio || !profile?.uid) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/subdominios?titular=${encodeURIComponent(profile.uid)}&dominio=${encodeURIComponent(selectedDominio.Uid)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: selectedSubdominio.uid,
          ...editFormData
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar subdomínio')
      }

      const updatedSubdomain = await response.json()

      // Atualizar a lista de subdomínios
      setSubdominios(prev => prev.map(sub => 
        sub.uid === updatedSubdomain.uid ? updatedSubdomain : sub
      ))

      setShowEditModal(false)
      toast.success('Subdomínio atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar subdomínio:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar subdomínio')
    } finally {
      setIsSaving(false)
    }
  }

  // Função para abrir o modal de edição
  const handleEditSubdomain = (subdominio: Subdominio) => {
    setSelectedSubdominio(subdominio)
    setEditFormData({
      nome: subdominio.nome,
      tipo: subdominio.tipo,
      ip: subdominio.ip,
      proxy: subdominio.proxy
    })
    setShowEditModal(true)
  }

  // Função para abrir o modal de exclusão
  const handleDeleteSubdomain = (subdominio: Subdominio) => {
    setSelectedSubdominio(subdominio)
    setShowDeleteModal(true)
  }

  // Função para excluir o subdomínio
  const handleConfirmDeleteSubdomain = async () => {
    if (!selectedDominio || !selectedSubdominio || !profile?.uid) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/subdominios?titular=${encodeURIComponent(profile.uid)}&dominio=${encodeURIComponent(selectedDominio.Uid)}&uid=${encodeURIComponent(selectedSubdominio.uid)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir subdomínio')
      }

      // Atualizar a lista de subdomínios
      setSubdominios(prev => prev.filter(sub => sub.uid !== selectedSubdominio.uid))

      setShowDeleteModal(false)
      toast.success('Subdomínio excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir subdomínio:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir subdomínio')
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtrar domínios com base no termo de busca
  const filteredDominios = dominios.filter(dominio => {
    return (
      (dominio.dominio_nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (dominio.dominio_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (dominio.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  })

  // Calcular o total de páginas
  const totalPages = Math.ceil(filteredDominios.length / itemsPerPage)
  const totalSubdomainPages = Math.ceil(subdominios.length / itemsPerPage)
  
  // Obter os domínios da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDominios = filteredDominios.slice(startIndex, endIndex);

  // Obter os subdomínios da página atual
  const subdomainStartIndex = (currentSubdomainPage - 1) * itemsPerPage;
  const subdomainEndIndex = subdomainStartIndex + itemsPerPage;
  const paginatedSubdominios = subdominios.slice(subdomainStartIndex, subdomainEndIndex);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div 
        className={`transition-all duration-500 ease-in-out transform ${
          selectedDominio ? 'scale-95 opacity-0 absolute inset-x-0' : 'scale-100 opacity-100 relative'
        }`}
      >
        {/* Cabeçalho da página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-card rounded-lg py-4 px-5 card-neomorphic">
          <div className="flex items-center gap-2">
            <RiGlobalLine className="text-primary" size={24} />
            <h1 className="text-2xl font-bold text-white">Domínios</h1>
          </div>
        </div>

        {/* Toggle de visualização e busca */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 bg-card rounded-lg py-3 px-4 card-neomorphic gap-3">
          <div className="flex items-center gap-3">
            <div className="switch-container">
              <Button
                data-active={viewMode === 'table'}
                onClick={() => setViewMode('table')}
                className="switch-button p-1.5 rounded-l-md transition-all btn-neomorphic bg-button-dark/10 text-button-dark hover:bg-button-dark/20"
                variant="ghost"
              >
                <RiTableLine className="w-5 h-5" />
              </Button>
              <Button
                data-active={viewMode === 'card'}
                onClick={() => setViewMode('card')}
                className="switch-button p-1.5 rounded-r-md transition-all btn-neomorphic bg-button-dark/10 text-button-dark hover:bg-button-dark/20"
                variant="ghost"
              >
                <RiLayoutGridLine className="w-5 h-5" />
              </Button>
            </div>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon"
              disabled={isPageLoading}
              className="bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner btn-neomorphic"
              title="Atualizar dados"
            >
              {isPageLoading ? (
                <RiLoader4Line className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <RefreshCw className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar domínios..."
                className="pl-10 bg-background border-border"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                  setPageInputValue('1')
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8 bg-card rounded-lg p-6 card-neomorphic">
            <RiLoader4Line className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDominios.length === 0 ? (
          <div className="bg-card rounded-lg p-6 card-neomorphic">
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum domínio encontrado.</p>
              <p className="mt-2">Adicione seu Token de API Cloudflare para gerenciar as zonas de DNS automaticamente.</p>
              
              {!hasCloudflareIntegration && (
                <div className="mt-6">
                  <Link href="/integracoes">
                    <Button 
                      className="bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200 btn-neomorphic"
                    >
                      <RiPlugLine className="mr-2 h-4 w-4" />
                      Configurar Cloudflare
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-6 card-neomorphic">
            {viewMode === 'table' ? (
              <div className={`overflow-x-auto transition-opacity duration-200 ${isPageLoading ? 'opacity-60' : 'opacity-100'}`}>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Data</th>
                      <th className="px-4 py-3">Domínio</th>
                      <th className="px-4 py-3">Conta</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDominios.map((dominio) => (
                      <tr key={dominio.Uid} className="border-b border-border/50 hover:bg-muted/5">
                        <td className="px-4 py-3 text-sm">
                          {dominio.created_at && new Date(dominio.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {dominio.dominio_nome}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {dominio.conta_nome || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {dominio.status ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                dominio.status === 'ativo'
                                  ? 'bg-green-100 text-green-800'
                                  : dominio.status === 'inativo'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {dominio.status}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="btn-neomorphic bg-amber-900/30 text-amber-400 hover:bg-amber-900/40 p-2 h-auto flex items-center gap-2"
                              title="Ver detalhes"
                              onClick={() => handleViewDominio(dominio)}
                            >
                              <RiEyeLine className="h-4 w-4" />
                              Ver detalhes
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isPageLoading ? 'opacity-60' : 'opacity-100'}`}>
                {paginatedDominios.map((dominio) => (
                  <div 
                    key={dominio.Uid}
                    className="bg-card rounded-lg p-6 hover:bg-muted/10 transition-colors cursor-pointer card-neomorphic"
                    onClick={() => handleViewDominio(dominio)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <RiGlobalLine className="text-primary" size={20} />
                        <h3 className="text-lg font-semibold text-white">{dominio.dominio_nome}</h3>
                      </div>
                      {dominio.status && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dominio.status === 'ativo'
                              ? 'bg-green-100 text-green-800'
                              : dominio.status === 'inativo'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {dominio.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Conta:</span>
                        <span className="text-sm">{dominio.conta_nome || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Criado em:</span>
                        <span className="text-sm">
                          {dominio.created_at && new Date(dominio.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-neomorphic bg-amber-900/30 text-amber-400 hover:bg-amber-900/40 p-2 h-auto flex items-center gap-2"
                        title="Ver detalhes"
                        onClick={() => handleViewDominio(dominio)}
                      >
                        <RiEyeLine className="h-4 w-4" />
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação unificada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 pt-6 border-t border-border/50">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <RiArrowLeftLine className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 mx-2">
                  <Input
                    type="text"
                    value={pageInputValue}
                    onChange={(e) => setPageInputValue(e.target.value)}
                    onKeyDown={handlePageInputKeyDown}
                    className="h-8 w-12 text-center"
                  />
                  <span className="text-sm text-muted-foreground">
                    de {totalPages}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8"
                >
                  <RiArrowRightLine className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div 
        className={`transition-all duration-500 ease-in-out transform ${
          selectedDominio ? 'scale-100 opacity-100 relative' : 'scale-95 opacity-0 absolute inset-x-0'
        }`}
      >
        {selectedDominio && (
          <div className="bg-card rounded-lg p-6 card-neomorphic">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <RiGlobalLine className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-white">{selectedDominio.dominio_nome}</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedDominio(null)
                  setSubdominios([])
                }}
                className="hover:bg-muted/10"
              >
                Voltar
              </Button>
            </div>

            <div className="bg-card rounded-lg p-6 card-neomorphic">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RiCloudLine className="text-primary" />
                Subdomínios
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="switch-container">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSubdomainViewMode('table');
                        setCurrentSubdomainPage(1);
                        setSubdomainPageInputValue('1');
                      }}
                      className={`btn-neomorphic ${
                        subdomainViewMode === 'table' ? 'bg-amber-900/30 text-amber-400' : 'bg-muted/20 text-muted-foreground'
                      } hover:bg-amber-900/40 p-2 h-auto`}
                      title="Visualização em tabela"
                    >
                      <RiTableLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSubdomainViewMode('card');
                        setCurrentSubdomainPage(1);
                        setSubdomainPageInputValue('1');
                      }}
                      className={`btn-neomorphic ${
                        subdomainViewMode === 'card' ? 'bg-amber-900/30 text-amber-400' : 'bg-muted/20 text-muted-foreground'
                      } hover:bg-amber-900/40 p-2 h-auto`}
                      title="Visualização em cards"
                    >
                      <RiLayoutGridLine className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => fetchSubdominios(selectedDominio!)}
                    variant="outline"
                    size="icon"
                    disabled={isLoadingSubdominios || !selectedDominio}
                    className="bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner btn-neomorphic"
                    title="Atualizar subdomínios"
                  >
                    {isLoadingSubdominios ? (
                      <RiLoader4Line className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-primary" />
                    )}
                  </Button>
                </div>
              </div>

              {isLoadingSubdominios ? (
                <div className="flex justify-center items-center py-8">
                  <RiLoader4Line className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paginatedSubdominios.length > 0 ? (
                <>
                  {subdomainViewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-border/30">
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Tipo</th>
                            <th className="pb-3 font-medium">Apontamento</th>
                            <th className="pb-3 font-medium">Proxy</th>
                            <th className="pb-3 font-medium text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedSubdominios.map((subdominio) => (
                            <tr key={subdominio.uid} className="border-b border-border/30 last:border-0">
                              <td className="py-3">{subdominio.nome}</td>
                              <td className="py-3">{subdominio.tipo}</td>
                              <td className="py-3">
                                <div className="flex items-center gap-1">
                                  <span>{subdominio.ip}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      navigator.clipboard.writeText(subdominio.ip)
                                      toast.success('Apontamento copiado!')
                                    }}
                                  >
                                    <RiFileCopyLine className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                                  subdominio.proxy ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {subdominio.proxy ? 'Proxy' : 'DNS Only'}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    className="btn-neomorphic bg-amber-900/30 text-amber-400 hover:bg-amber-900/40 p-2 h-auto"
                                    title="Editar"
                                    onClick={() => handleEditSubdomain(subdominio)}
                                  >
                                    <RiEdit2Line className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="btn-neomorphic bg-red-900/30 text-red-400 hover:bg-red-900/50 active:bg-red-900/60 border-red-500/30 p-2 h-auto"
                                    title="Excluir"
                                    onClick={() => handleDeleteSubdomain(subdominio)}
                                  >
                                    <RiDeleteBinLine className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedSubdominios.map((subdominio) => (
                        <div
                          key={subdominio.uid}
                          className="bg-card rounded-lg p-6 card-neomorphic flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{subdominio.nome}</h3>
                              <p className="text-sm text-muted-foreground">{subdominio.tipo}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                              subdominio.proxy ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {subdominio.proxy ? 'Proxy' : 'DNS Only'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-4">
                            <span className="text-sm">{subdominio.ip}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(subdominio.ip)
                                toast.success('Apontamento copiado!')
                              }}
                            >
                              <RiFileCopyLine className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-auto">
                            <Button
                              size="sm"
                              className="btn-neomorphic bg-amber-900/30 text-amber-400 hover:bg-amber-900/40 p-2 h-auto"
                              title="Editar"
                              onClick={() => handleEditSubdomain(subdominio)}
                            >
                              <RiEdit2Line className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="btn-neomorphic bg-red-900/30 text-red-400 hover:bg-red-900/50 active:bg-red-900/60 border-red-500/30 p-2 h-auto"
                              title="Excluir"
                              onClick={() => handleDeleteSubdomain(subdominio)}
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Paginação de Subdomínios */}
                  {subdominios.length > itemsPerPage && (
                    <div className={`flex items-center ${subdomainViewMode === 'table' ? 'justify-between' : 'justify-center'} border-t border-border/30 mt-4 pt-4`}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousSubdomainPage}
                          disabled={currentSubdomainPage === 1}
                          className={`btn-neomorphic p-2 h-auto ${
                            currentSubdomainPage === 1 
                              ? 'bg-muted/20 text-muted-foreground' 
                              : 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/40'
                          }`}
                        >
                          <RiArrowLeftLine className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={subdomainPageInputValue}
                            onChange={(e) => setSubdomainPageInputValue(e.target.value)}
                            onKeyDown={handleSubdomainPageInputKeyDown}
                            className="w-16 text-center bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                          />
                          <span className="text-sm text-muted-foreground">
                            de {totalSubdomainPages}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextSubdomainPage}
                          disabled={currentSubdomainPage === totalSubdomainPages}
                          className={`btn-neomorphic p-2 h-auto ${
                            currentSubdomainPage === totalSubdomainPages 
                              ? 'bg-muted/20 text-muted-foreground' 
                              : 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/40'
                          }`}
                        >
                          <RiArrowRightLine className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum subdomínio encontrado.
                </p>
              )}
            </div>

          </div>
        )}
      </div>

      {showEditModal && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 shadow-inner card-neomorphic">
                    <RiEdit2Line className="text-primary" size={18} />
                  </div>
                  Editar Subdomínio
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditFormData({
                      nome: '',
                      tipo: '',
                      ip: '',
                      proxy: false
                    })
                  }}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                handleSaveSubdomain()
              }} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <Input
                    value={editFormData.nome}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                    placeholder="Nome do subdomínio"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <select
                    value={editFormData.tipo}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full mt-1 bg-card border border-border/30 rounded-md p-2 text-sm hover:bg-muted/10 focus:bg-muted/10 shadow-inner input-neomorphic"
                    disabled={isSaving}
                  >
                    <option value="A">A (IPv4)</option>
                    <option value="CNAME">CNAME (Alias)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    {editFormData.tipo === 'CNAME' ? 'Apontamento (Domínio)' : 'Apontamento (IP)'}
                  </label>
                  <Input
                    value={editFormData.ip}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, ip: e.target.value }))}
                    className="mt-1 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner input-neomorphic"
                    placeholder={editFormData.tipo === 'CNAME' ? 'exemplo.com' : '000.000.000.000'}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Proxy</label>
                  <Switch
                    checked={editFormData.proxy}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, proxy: checked }))}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    type="submit" 
                    variant="outline"
                    className="flex-1 btn-neomorphic bg-button-dark text-white hover:bg-button-dark/90 active:bg-button-dark/80 transition-all duration-200"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditFormData({
                        nome: '',
                        tipo: '',
                        ip: '',
                        proxy: false
                      })
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}

      {showDeleteModal && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <div className="bg-card p-6 rounded-lg shadow-lg card-neomorphic max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/10 shadow-inner card-neomorphic">
                    <RiDeleteBinLine className="text-destructive" size={18} />
                  </div>
                  Excluir Subdomínio
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedSubdominio(null)
                  }}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 shadow-inner card-neomorphic">
                  <p className="text-sm text-destructive">
                    Tem certeza que deseja excluir o subdomínio <strong>{selectedSubdominio?.nome}</strong>?
                    Esta ação não pode ser desfeita.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 btn-neomorphic bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/30 transition-all duration-200"
                    onClick={handleConfirmDeleteSubdomain}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      'Excluir'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 btn-neomorphic bg-muted/20 text-muted-foreground hover:bg-muted/30 active:bg-muted/40 transition-all duration-200"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedSubdominio(null)
                    }}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
