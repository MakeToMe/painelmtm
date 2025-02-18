'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  RiServerLine, 
  RiEyeLine, 
  RiArrowLeftLine, 
  RiShieldLine, 
  RiDatabase2Line,
  RiHardDriveLine,
  RiCpuLine,
  RiGlobalLine,
  RiSpeedLine,
  RiFileCopyLine,
  RiUbuntuFill,
  RiWindowsFill,
  RiTerminalBoxFill,
  RiCentosFill
} from 'react-icons/ri'

interface Servidor {
  uid: string
  created_at: string
  titular: string
  ip: string
  senha: string
  cpu: number
  ram: number
  nome: string
  storage: number
  banda: number
  location: string
  imagem: string
  sistema: string
}

export default function ServidorPage() {
  const { profile } = useAuth()
  const [servidores, setServidores] = useState<Servidor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedServer, setSelectedServer] = useState<Servidor | null>(null)

  const handleCopy = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    async function carregarServidores() {
      if (!profile?.uid) return

      try {
        const { data, error } = await supabase
          .from('servidores')
          .select('*')
          .eq('titular', profile.uid)

        if (error) {
          console.error('Erro ao carregar servidores:', error)
          return
        }

        setServidores(data || [])
      } catch (error) {
        console.error('Erro ao carregar servidores:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarServidores()
  }, [profile?.uid])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-gray-800 dark:bg-zinc-950 rounded-lg p-6">
          <p className="text-gray-300">Carregando servidores...</p>
        </div>
      </div>
    )
  }

  if (servidores.length === 0) {
    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="bg-gray-800 dark:bg-zinc-950 rounded-lg shadow-[0_2px_8px_0_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.3)] p-8 text-center max-w-md w-full mx-4">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
              <RiServerLine className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-white">
            Nenhum servidor registrado
          </h3>
          <p className="mb-8 mt-2 text-center text-gray-300">
            Você ainda não tem nenhum servidor registrado no sistema.
          </p>
          <button className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            Registrar Servidor
          </button>
        </div>
      </div>
    )
  }

  if (selectedServer) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Menu Superior */}
        <div className="flex items-center justify-between mb-8 bg-gray-800 dark:bg-zinc-950 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedServer(null)}
              className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30 hover:bg-emerald-100/40 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <RiArrowLeftLine className="w-5 h-5 text-emerald-500" />
            </button>
            <h2 className="text-xl font-semibold text-white">{selectedServer.nome || 'Servidor sem nome'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              <RiShieldLine className="w-4 h-4" />
              Segurança
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              <RiDatabase2Line className="w-4 h-4" />
              Backup
            </button>
          </div>
        </div>

        {/* Quadro Informativo */}
        <div className="bg-gray-800 dark:bg-zinc-950 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hostname */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50">
              <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                <RiServerLine className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">HOSTNAME</p>
                <p className="text-white font-medium">{selectedServer.nome || '-'}</p>
              </div>
            </div>

            {/* Root Password */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50">
              <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                <RiShieldLine className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">ROOT PASSWORD</p>
                  <button 
                    onClick={() => handleCopy(selectedServer.senha)}
                    className="p-1.5 rounded-full hover:bg-emerald-100/10 transition-colors"
                  >
                    <RiFileCopyLine className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
                <p className="text-white font-medium mt-1">••••••••</p>
              </div>
            </div>

            {/* IP Address */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50">
              <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                <RiGlobalLine className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">PRIMARY IP ADDRESS</p>
                  <button 
                    onClick={() => handleCopy(selectedServer.ip)}
                    className="p-1.5 rounded-full hover:bg-emerald-100/10 transition-colors"
                  >
                    <RiFileCopyLine className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
                <p className="text-white font-medium mt-1">{selectedServer.ip || '-'}</p>
              </div>
            </div>

            {/* CPU */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50">
              <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                <RiCpuLine className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">CPU Cores</p>
                <p className="text-white font-medium">{selectedServer.cpu || '-'}</p>
              </div>
            </div>

            {/* RAM */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50">
              <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                <RiHardDriveLine className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">RAM</p>
                <p className="text-white font-medium">{selectedServer.ram ? `${selectedServer.ram} GB` : '-'}</p>
              </div>
            </div>

            {/* Bandwidth */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50">
              <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                <RiSpeedLine className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Bandwidth</p>
                <p className="text-white font-medium">{selectedServer.banda ? `${selectedServer.banda} TB` : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Meus Servidores</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
          Adicionar Servidor
        </button>
      </div>

      {/* Grid */}
      <div className="bg-gray-800 dark:bg-zinc-950 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Endereço IP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Senha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  CPU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  RAM
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {servidores.map((servidor) => {
                // Determine which OS icon to show based on sistema field
                let OsIcon = RiTerminalBoxFill; // Default icon
                const sistema = servidor.sistema?.toLowerCase() || '';
                
                if (sistema.includes('ubuntu')) {
                  OsIcon = RiUbuntuFill;
                } else if (sistema.includes('windows')) {
                  OsIcon = RiWindowsFill;
                } else if (sistema.includes('centos')) {
                  OsIcon = RiCentosFill;
                } else if (sistema.includes('debian')) {
                  OsIcon = RiUbuntuFill; // Usando o ícone do Ubuntu para Debian já que são similares
                }

                return (
                  <tr key={servidor.uid} className="border-b border-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                          <OsIcon className="w-5 h-5 text-emerald-500" title={servidor.sistema || 'Sistema Operacional'} />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-white">{servidor.nome || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <span className="text-white">{servidor.ip || '-'}</span>
                        <button 
                          onClick={() => handleCopy(servidor.ip)}
                          className="p-1.5 rounded-full hover:bg-emerald-100/10 transition-colors ml-2"
                          title="Copiar IP"
                        >
                          <RiFileCopyLine className="w-4 h-4 text-emerald-500" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <span className="text-white">••••••••</span>
                        <button 
                          onClick={() => handleCopy(servidor.senha)}
                          className="p-1.5 rounded-full hover:bg-emerald-100/10 transition-colors ml-2"
                          title="Copiar senha"
                        >
                          <RiFileCopyLine className="w-4 h-4 text-emerald-500" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{servidor.cpu || '-'} vCPU</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{servidor.ram || '-'} GB</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedServer(servidor)}
                        className="text-emerald-500 hover:text-emerald-400 transition-colors"
                        title="Ver detalhes"
                      >
                        <RiEyeLine className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
