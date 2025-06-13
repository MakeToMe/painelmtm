'use client'

import { useEffect, useState } from "react"
import { RiCpuLine } from "react-icons/ri"
import { Progress } from "@/components/ui/progress"

interface CpuCoreData {
  core: number
  usage: number
}

interface CpuCoresUsageProps {
  cpuCoresData?: CpuCoreData[]
}

export function CpuCoresUsage({ cpuCoresData }: CpuCoresUsageProps) {
  const [lastValidData, setLastValidData] = useState<CpuCoreData[]>([])
  
  // Atualizar lastValidData quando recebermos novos dados válidos
  useEffect(() => {
    if (cpuCoresData && cpuCoresData.length > 0) {
      // Log para depuração
      console.log('CPU Cores Data recebido via props:', JSON.stringify(cpuCoresData))
      setLastValidData(cpuCoresData)
    }
  }, [cpuCoresData])
  
  // Escutar o evento personalizado com os dados de CPU
  useEffect(() => {
    // Função para lidar com o evento
    const handleCpuCoresData = (event: CustomEvent<any>) => {
      const { cores } = event.detail
      if (cores && Array.isArray(cores) && cores.length > 0) {
        console.log('CPU Cores Data recebido via evento:', JSON.stringify(cores))
        setLastValidData(cores)
      }
    }
    
    // Adicionar o listener de evento
    window.addEventListener('cpu-cores-data', handleCpuCoresData as EventListener)
    
    // Remover o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('cpu-cores-data', handleCpuCoresData as EventListener)
    }
  }, [])
  
  // Verificar se temos dados de CPU cores
  const hasCpuCoresData = lastValidData.length > 0
  
  // Formatar os dados para exibição
  const formattedCores = hasCpuCoresData
    ? lastValidData.map(core => ({
        id: core.core,
        value: parseFloat(core.usage.toFixed(1))
      }))
    : []
  
  return (
    <div className="bg-slate-800/50 rounded-lg border from-cyan-500 to-blue-500 border-cyan-500/30 p-4 relative overflow-hidden">
      {/* Efeito de glow */}
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-slate-700/70">
              <RiCpuLine className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-slate-300 text-sm font-medium">CPU Cores por núcleo</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {formattedCores.length > 0 ? (
          formattedCores.map((core) => (
            <div key={core.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Core {core.id}</div>
                <div className="font-medium">{core.value}%</div>
              </div>
              <Progress value={core.value} className="h-2" />
            </div>
          ))
        ) : (
          // Fallback para quando não há dados
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Core {index}</div>
                <div className="font-medium">0%</div>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
