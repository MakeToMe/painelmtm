'use client'

import { useState, useEffect } from 'react'
import { ServerMonitor } from '@/components/dashboard/server-monitor'

interface Servidor {
  uid: string
  ip: string | null
  cpu: number | null
  ram: number | null
  storage: number | null
  nome: string | null
}

interface RealtimeMonitorProps {
  selectedServer: Servidor | null
}

export function RealtimeMonitor({ selectedServer }: RealtimeMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar o componente apenas quando o servidor estiver selecionado
  useEffect(() => {
    if (selectedServer?.ip) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [selectedServer])

  if (!isVisible || !selectedServer?.ip) {
    return (
      <div className="bg-card rounded-lg p-6 card-neomorphic">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Monitoramento em Tempo Real</h3>
          <p className="text-muted-foreground">
            Selecione um servidor para visualizar os dados de monitoramento em tempo real.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="bg-card rounded-lg p-6 card-neomorphic">
        <ServerMonitor 
          serverIp={selectedServer.ip || ''}
          serverCpu={selectedServer.cpu || 0}
          serverRam={selectedServer.ram || 0}
          serverStorage={selectedServer.storage || 0}
        />
      </div>
    </div>
  )
}
