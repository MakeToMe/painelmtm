'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { 
  RiServerLine, 
  RiCpuLine, 
  RiDatabase2Line,
  RiGlobalLine,
  RiSpeedLine,
  RiRefreshLine,
  RiLoader4Line,
  RiCheckboxCircleFill,
  RiMoneyDollarCircleLine,
  RiArrowRightLine,
  RiMapPinLine
} from 'react-icons/ri'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

// Tipos para os planos de servidor
interface ServerPlan {
  id: string
  name: string
  cpu: number
  ram: number
  storage: number
  bandwidth: number
  price: number
  location: string
  type: string
}

// Tipo para localizações de servidor
interface ServerLocation {
  id: string
  name: string
  country: string
  flag: string
  continent: string
  serversAvailable: number
}

export default function ContratarServidorPage() {
  const { profile } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Função para simular atualização de dados
  const handleRefresh = () => {
    setIsRefreshing(true)
    
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Dados atualizados com sucesso!')
    }, 1000)
  }

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
        </div>
      </div>

      {/* Etapa de seleção de localização */}
      <div className="bg-card rounded-lg p-6 mb-6 card-neomorphic">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <RiGlobalLine className="mr-2 h-5 w-5 text-primary" />
          Selecione a localização do servidor
        </h2>
        
        {/* Conteúdo será adicionado posteriormente com dados do Supabase */}
        <div className="text-center py-10 text-muted-foreground">
          Aguardando dados do Supabase para renderização...
        </div>
      </div>
    </div>
  )
}
