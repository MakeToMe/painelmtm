'use client'

import { FC } from 'react'
import { 
  RiEyeLine, 
  RiFileCopyLine, 
  RiCheckboxCircleFill, 
  RiCloseCircleFill, 
  RiQuestionLine,
  RiCpuLine,
  RiDatabase2Line,
  RiHardDriveLine
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
  status: 'online' | 'offline' | null
  mtm_users: {
    nome: string | null
  } | null
  titular_nome: string | null
  url_prov: string | null
  conta_prov: string | null
  senha_prov: string | null
}

interface MonitorData {
  uid: string
  created_at: string
  titular: string
  ip: string
  mem_total: number
  mem_usada: number
  mem_usada_p: number
  mem_disponivel_p: number
  mem_disponivel: number
  cpu_total: number
  cpu_livre: number
  cpu_usada: number
  disco_total: number
  disco_usado: number
  disco_livre: number
  disco_uso_p: number
  disco_livre_p: number
}

interface ServerCardViewProps {
  servidores: Servidor[]
  monitorDataMap: Record<string, MonitorData>
  monitorLoading: boolean
  onSelectServer: (servidor: Servidor) => void
  handleCopy: (text: string | null) => void
}

export function ServerCardView({ servidores, monitorDataMap, monitorLoading, onSelectServer, handleCopy }: ServerCardViewProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {servidores.map((servidor) => {
        // Obter dados de monitoramento do mapa
        const monitorData = servidor.ip ? monitorDataMap[servidor.ip] : null;
        
        // Calcular valores para os gráficos
        const cpuUsage = monitorData ? monitorData.cpu_usada : 0;
        const ramUsage = monitorData ? monitorData.mem_usada_p : 0;
        const diskUsage = monitorData ? monitorData.disco_uso_p : 0;
        
        return (
          <div 
            key={servidor.uid}
            className="bg-card rounded-lg card-neomorphic overflow-hidden p-5 relative"
          >
            {/* Status do servidor */}
            <div className="absolute top-4 left-4 z-10">
              {servidor.status === 'online' ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                  <RiCheckboxCircleFill className="mr-1" /> Online
                </span>
              ) : servidor.status === 'offline' ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                  <RiCloseCircleFill className="mr-1" /> Offline
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">
                  <RiQuestionLine className="mr-1" /> Desconhecido
                </span>
              )}
            </div>
            
            {/* Botão de visualizar no canto superior direito */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => onSelectServer(servidor)}
                className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-emerald-400 transition-colors"
                title="Visualizar detalhes do servidor"
              >
                <RiEyeLine className="w-4 h-4" />
              </button>
            </div>
            
            {/* Grid de 4 cards dentro do card principal */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {/* Card de Nome e IP */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <h3 className="text-base font-medium text-white mb-1">
                  {servidor.nome || 'Servidor'}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-primary">{servidor.ip}</p>
                  <button 
                    onClick={() => handleCopy(servidor.ip)}
                    className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <RiFileCopyLine className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
              
              {/* CPU */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <RiCpuLine className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-medium text-slate-300">CPU</span>
                    </div>
                    <span className="text-xs font-medium text-cyan-400">{servidor.cpu} Cores</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                      style={{ width: `${monitorLoading ? 0 : cpuUsage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-slate-400">{monitorLoading ? '-' : `${cpuUsage.toFixed(1)}%`}</span>
                  </div>
                </div>
              </div>
              
              {/* RAM */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <RiDatabase2Line className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-slate-300">RAM</span>
                    </div>
                    <span className="text-xs font-medium text-purple-400">{servidor.ram} GB</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                      style={{ width: `${monitorLoading ? 0 : ramUsage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-slate-400">{monitorLoading ? '-' : `${ramUsage.toFixed(1)}%`}</span>
                  </div>
                </div>
              </div>
              
              {/* Storage */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <RiHardDriveLine className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-medium text-slate-300">Storage</span>
                    </div>
                    <span className="text-xs font-medium text-green-400">{servidor.storage} GB</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                      style={{ width: `${monitorLoading ? 0 : diskUsage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-slate-400">{monitorLoading ? '-' : `${diskUsage.toFixed(1)}%`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
