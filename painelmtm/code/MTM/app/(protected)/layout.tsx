'use client'

import { Sidebar } from '@/components/navigation/sidebar'
import { DashboardNavbar } from '@/components/navigation/dashboard-navbar'
import { ThemeProvider } from '@/contexts/theme-context'
import { PageTransition } from '@/components/transitions/page-transition'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <DashboardNavbar />
        
        {/* Conteúdo principal */}
        <main className="relative transition-all duration-300 min-h-screen bg-background pl-16 lg:pl-64 pt-16">
          <div className="max-w-[1400px] mx-auto px-4 py-6 lg:px-6">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
