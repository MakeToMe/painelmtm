'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { 
  RiGlobalLine,
  RiRefreshLine,
  RiLoader4Line,
  RiArrowRightLine
} from 'react-icons/ri'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Flag from 'react-world-flags'

// Tipo para as regiões
interface Regiao {
  uid: string
  pais: string
  local: string
  bandeira: string
  created_at: string
}

export default function ContratarServidorPage() {
  const { profile } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [regioes, setRegioes] = useState<Regiao[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Função para buscar as regiões
  const fetchRegioes = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const response = await fetch('/api/server-manager')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar regiões')
      }
      
      const data = await response.json()
      setRegioes(data || [])
    } catch (error) {
      console.error('Erro ao buscar regiões:', error)
      toast.error('Erro ao carregar as regiões de servidores')
    } finally {
      if (showLoading) {
        setIsLoading(false)
      } else {
        setIsRefreshing(false)
        toast.success('Dados atualizados com sucesso!')
      }
    }
  }

  // Função para atualizar os dados
  const handleRefresh = () => {
    fetchRegioes(false)
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (profile?.uid) {
      fetchRegioes()
    }
  }, [profile])

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Contratar Servidor</h1>
      </div>

      {/* Header com controles */}
      <div className="flex items-center justify-between mb-4 bg-card rounded-lg py-3 px-4 card-neomorphic">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            disabled={isRefreshing}
            className="bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner btn-neomorphic"
            title="Atualizar dados"
          >
            {isRefreshing ? (
              <RiLoader4Line className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <RefreshCw className="h-5 w-5 text-primary" />
            )}
          </Button>
          
          <div className="flex items-center">
            <RiGlobalLine className="mr-2 h-5 w-5 text-primary" />
            <span className="text-white font-medium">Selecione a localização do servidor</span>
          </div>
        </div>
      </div>

      {/* Conteúdo principal - Grid de regiões */}
      <div className="bg-card rounded-lg p-6 mb-6 card-neomorphic">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <RiLoader4Line className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : regioes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Nenhuma região de servidor disponível
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {regioes.map((regiao) => (
              <div 
                key={regiao.uid}
                className="bg-card/50 rounded-lg p-4 hover:bg-card/80 transition-all duration-200 cursor-pointer card-neomorphic"
                onClick={() => toast.info(`Selecionado: ${regiao.local}, ${regiao.pais}`)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-6 overflow-hidden rounded shadow-sm flex items-center justify-center bg-muted/30">
                    <Flag code={regiao.bandeira} className="h-full w-auto object-cover" />
                  </div>
                  <h3 className="font-medium text-white">{regiao.local}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{regiao.pais}</span>
                  <RiArrowRightLine className="h-5 w-5 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
