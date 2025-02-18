'use client'

import { Sidebar } from '@/components/navigation/sidebar'
import { ThemeProvider } from '@/contexts/theme-context'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Sidebar />
        
        {/* Conteúdo principal */}
        <main className="pl-16 lg:pl-64 min-h-screen bg-gray-100 dark:bg-zinc-800">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
