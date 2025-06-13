'use client'

import { useState, useEffect } from 'react'
import { RiShieldLine, RiLoader4Line } from 'react-icons/ri'

interface BannedIpsCounterProps {
  serverIp: string
  refreshInterval?: number
}

export function BannedIpsCounter({ serverIp, refreshInterval = 60000 }: BannedIpsCounterProps) {
  const [bannedCount, setBannedCount] = useState<number>(0)
  const [recentBans, setRecentBans] = useState<{ip: string, created_at: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Função para buscar dados de IPs banidos
  const fetchBannedIpsData = async () => {
    if (!serverIp) return

    try {
      setLoading(true)
      
      const response = await fetch(`/api/banned-ips?ip=${serverIp}`)
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de IPs banidos')
      }
      
      const data = await response.json()
      
      if (data) {
        setBannedCount(data.count || 0)
        setRecentBans(data.recent || [])
      }
      
      // Atualizar horário da última atualização
      const now = new Date()
      setLastUpdate(
        now.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })
      )
      
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar dados de IPs banidos:', err)
      setError('Não foi possível carregar os dados de IPs banidos')
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar dados iniciais e configurar atualização periódica
  useEffect(() => {
    fetchBannedIpsData()
    
    const interval = setInterval(() => {
      fetchBannedIpsData()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [serverIp, refreshInterval])

  // Função para formatar a data de criação
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border from-red-500 to-orange-500 border-red-500/30 p-4 relative overflow-hidden">
      {/* Efeito de glow */}
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-red-500 to-orange-500"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-slate-700/70">
            <RiShieldLine className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-slate-300 text-sm font-medium">IPs Banidos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {lastUpdate}
          </span>
          {loading && <RiLoader4Line className="w-4 h-4 animate-spin text-primary" />}
        </div>
      </div>
      
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent from-red-400 to-orange-300">
            {bannedCount}
          </div>
          
          <div className="text-xs text-slate-400">
            Total de IPs bloqueados
          </div>
          
          {recentBans.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 mb-2">Banimentos recentes:</div>
              <div className="space-y-1.5">
                {recentBans.slice(0, 2).map((ban, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-mono">{ban.ip}</span>
                    <span className="text-slate-500">{formatDate(ban.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
