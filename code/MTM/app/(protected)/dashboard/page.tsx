'use client'

import { useAuth } from '@/contexts/auth-context'

export default function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="max-w-7xl mx-auto">
      {/* Card de boas-vindas */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
        <div className="flex items-center gap-4">
          <img
            src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
            alt="Foto de perfil"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bem-vindo, {profile?.nome || 'Usuário'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Este é seu painel de controle MTM
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
