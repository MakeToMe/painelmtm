'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { RiPlayFill, RiPauseFill, RiEyeLine, RiArrowUpLine, RiArrowDownLine, RiArrowLeftLine, RiArrowRightLine, RiArrowUpDownLine } from 'react-icons/ri'

interface DockerContainer {
  ID: string
  Name: string
  PIDs: string
  CPUPerc: string
  MemPerc: string
  MemUsage: string
  NetIO: string
  BlockIO: string
  Status: string
  NetIO_RX_Bytes: number
  NetIO_TX_Bytes: number
}

interface DockerContainerTableProps {
  serverIp: string
  refreshInterval?: number
}

type SortField = 'name' | 'pids' | 'cpu' | 'memory' | null
type SortDirection = 'asc' | 'desc'

export function DockerContainerTable({ serverIp, refreshInterval = 10000 }: DockerContainerTableProps) {
  const [containers, setContainers] = useState<DockerContainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Função para simplificar o nome do container
  const getSimplifiedName = (fullName: string) => {
    // Extrair o nome antes do primeiro ponto ou usar o nome completo
    const nameParts = fullName.split('.')
    return nameParts[0]
  }
  
  // Função para ordenar os containers
  const sortContainers = (containers: DockerContainer[]) => {
    if (!sortField) return containers
    
    return [...containers].sort((a, b) => {
      let valueA: string | number = '';
      let valueB: string | number = '';
      
      switch (sortField) {
        case 'name':
          valueA = getSimplifiedName(a.Name).toLowerCase();
          valueB = getSimplifiedName(b.Name).toLowerCase();
          break;
        case 'pids':
          valueA = parseInt(a.PIDs) || 0;
          valueB = parseInt(b.PIDs) || 0;
          break;
        case 'cpu':
          valueA = parseFloat(a.CPUPerc.replace('%', '')) || 0;
          valueB = parseFloat(b.CPUPerc.replace('%', '')) || 0;
          break;
        case 'memory':
          valueA = parseFloat(a.MemPerc.replace('%', '')) || 0;
          valueB = parseFloat(b.MemPerc.replace('%', '')) || 0;
          break;
        default:
          return 0;
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  }
  
  // Função para alternar a ordenação ao clicar em uma coluna
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }
  
  // Função para obter o ícone de ordenação
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <RiArrowUpDownLine className="ml-1 inline-block text-slate-600 opacity-50" />;
    
    return sortDirection === 'asc' 
      ? <RiArrowUpLine className="ml-1 inline-block text-primary" /> 
      : <RiArrowDownLine className="ml-1 inline-block text-primary" />;
  }
  
  // Função para abrir a visualização detalhada do container em uma nova aba
  const openContainerDetails = (containerId: string) => {
    window.open(`/container/${serverIp}/${containerId}`, '_blank');
  }

  // Função para buscar dados dos containers
  const fetchContainerData = async () => {
    if (!serverIp) return

    try {
      setLoading(true)
      const response = await fetch(`/api/docker-stats?ip=${serverIp}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados dos containers')
      }
      
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        // Adicionar status "running" para todos os containers
        const containersWithStatus = data.map(container => ({
          ...container,
          Status: 'running'
        }))
        
        setContainers(containersWithStatus)
        
        // Atualizar horário da última atualização
        const now = new Date()
        setLastUpdate(
          now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })
        )
      }
      
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar dados dos containers:', err)
      setError('Não foi possível carregar os dados dos containers')
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar dados iniciais e configurar atualização periódica
  useEffect(() => {
    fetchContainerData()
    
    const interval = setInterval(() => {
      fetchContainerData()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [serverIp, refreshInterval])

  if (loading && containers.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Containers Docker</h3>
        </div>
        <div className="h-60 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2 text-muted-foreground">Carregando containers...</span>
        </div>
      </div>
    )
  }

  if (error && containers.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 card-neomorphic">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Containers Docker</h3>
        </div>
        <div className="h-60 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchContainerData}
              className="mt-2 px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calcular o número total de páginas
  const totalPages = Math.ceil(containers.length / itemsPerPage);
  
  // Obter os containers da página atual
  const getCurrentPageItems = () => {
    const sortedContainers = sortContainers(containers);
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedContainers.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // Função para navegar para a próxima página
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Função para navegar para a página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Função para navegar para uma página específica
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Gerar array de páginas para exibição
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // Mostrar todas as páginas se o total for menor que o máximo de botões
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica para mostrar páginas ao redor da página atual
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = startPage + maxPageButtons - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="bg-card rounded-lg p-4 card-neomorphic">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">Containers Docker</h3>
        <div className="text-xs text-muted-foreground">
          Última atualização: {lastUpdate}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th 
                className="py-2 px-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors group"
                onClick={() => toggleSort('pids')}
                title="Clique para ordenar por PID"
              >
                <div className="flex items-center">
                  <span>PID</span>
                  <span className="ml-1">{getSortIcon('pids')}</span>
                </div>
              </th>
              <th 
                className="py-2 px-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors group"
                onClick={() => toggleSort('name')}
                title="Clique para ordenar por nome do container"
              >
                <div className="flex items-center">
                  <span>Container</span>
                  <span className="ml-1">{getSortIcon('name')}</span>
                </div>
              </th>
              <th 
                className="py-2 px-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors group"
                onClick={() => toggleSort('cpu')}
                title="Clique para ordenar por uso de CPU"
              >
                <div className="flex items-center">
                  <span>CPU</span>
                  <span className="ml-1">{getSortIcon('cpu')}</span>
                </div>
              </th>
              <th 
                className="py-2 px-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors group"
                onClick={() => toggleSort('memory')}
                title="Clique para ordenar por uso de memória"
              >
                <div className="flex items-center">
                  <span>Memory</span>
                  <span className="ml-1">{getSortIcon('memory')}</span>
                </div>
              </th>
              <th className="py-2 px-3 text-left text-xs font-medium text-slate-400">
                Status
              </th>
              <th className="py-2 px-3 text-center text-xs font-medium text-slate-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageItems().map((container) => (
              <tr 
                key={container.ID} 
                className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-2 px-3 text-sm text-slate-300">{container.PIDs}</td>
                <td className="py-2 px-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-200">{getSimplifiedName(container.Name)}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{container.ID}</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className="text-cyan-400 font-medium">{container.CPUPerc}</span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex flex-col">
                    <span className="text-purple-400 font-medium">{container.MemPerc}</span>
                    <span className="text-xs text-slate-500">{container.MemUsage}</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                    <RiPlayFill className="mr-1" /> {container.Status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => openContainerDetails(container.ID)}
                    className="p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-emerald-400 transition-colors"
                    title="Visualizar estatísticas detalhadas"
                  >
                    <RiEyeLine className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Paginação estilo Supabase */}
        {totalPages > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-xs text-slate-400">
                Exibindo {containers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, containers.length)} de {containers.length} containers
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-md ${currentPage === 1 ? 'text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <RiArrowLeftLine className="w-4 h-4" />
                </button>
                
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= totalPages) {
                        setCurrentPage(value);
                      } else if (e.target.value === '') {
                        // Permitir campo vazio durante a digitação
                        e.target.value = '';
                      }
                    }}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        if (!isNaN(value) && value >= 1 && value <= totalPages) {
                          goToPage(value);
                        }
                      }
                    }}
                    className="w-10 bg-slate-800 border border-slate-700 rounded-md text-center text-xs text-slate-300 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-xs text-slate-500 px-1">de {totalPages}</span>
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 rounded-md ${currentPage === totalPages ? 'text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <RiArrowRightLine className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Itens por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Resetar para a primeira página ao mudar o número de itens
                }}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
