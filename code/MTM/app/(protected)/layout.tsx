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
      <div className="min-h-screen bg-background">
        <Sidebar />
        
        {/* Conteúdo principal */}
        <main className="relative transition-all duration-300 min-h-screen bg-background pl-16 lg:pl-64">
          <div className="max-w-[1400px] mx-auto px-4 py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
