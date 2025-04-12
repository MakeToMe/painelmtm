'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { RiCloseLine } from 'react-icons/ri'
import { toast } from 'sonner'

interface DominioDetalhesProps {
  dominioId: string
  onClose: () => void
}

interface Dominio {
  dominio_id: string
  uid: string
  dominio_nome: string
  status?: string
  created_at: string
}

export default function DominioDetalhes({ dominioId, onClose }: DominioDetalhesProps) {
  const { profile } = useAuth()
  const [dominio, setDominio] = useState<Dominio | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (dominioId && profile?.uid) {
      fetchDominio(dominioId)
    }
  }, [dominioId, profile])

  const fetchDominio = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dominios/${id}?uid=${profile?.uid}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar detalhes do domínio')
      }
      
      const data = await response.json()
      setDominio(data)
    } catch (error) {
      console.error('Erro ao buscar domínio:', error)
      toast.error(`Erro ao buscar detalhes do domínio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!dominio) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Domínio não encontrado ou você não tem permissão para visualizá-lo.</p>
        <Button 
          onClick={onClose}
          className="mt-4 bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 btn-neomorphic"
        >
          <RiCloseLine className="mr-2 h-4 w-4" />
          Fechar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white">{dominio.dominio_nome}</h3>
          <p className="text-muted-foreground">ID: {dominio.dominio_id}</p>
        </div>
        <div className="flex items-center gap-2">
          {dominio.status === 'ativo' && (
            <div className="flex items-center px-2 py-1 rounded-full bg-green-500/10">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-green-500 text-xs font-medium">Ativo</span>
            </div>
          )}
          {dominio.status === 'expirando' && (
            <div className="flex items-center px-2 py-1 rounded-full bg-amber-500/10">
              <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
              <span className="text-amber-500 text-xs font-medium">Expirando</span>
            </div>
          )}
          {dominio.status === 'expirado' && (
            <div className="flex items-center px-2 py-1 rounded-full bg-red-500/10">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
              <span className="text-red-500 text-xs font-medium">Expirado</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Nome</h4>
          <p className="text-white">{dominio.dominio_nome}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">ID</h4>
          <p className="text-white">{dominio.dominio_id}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
          <p className="text-white">{dominio.status || 'Não informado'}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</h4>
          <p className="text-white">
            {dominio.created_at 
              ? new Date(dominio.created_at).toLocaleDateString('pt-BR') 
              : 'Não informada'}
          </p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          onClick={onClose}
          className="bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 btn-neomorphic"
        >
          <RiCloseLine className="mr-2 h-4 w-4" />
          Fechar
        </Button>
      </div>
    </div>
  )
}
