'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Make To Me</title>
        <meta name="description" content="Painel administrativo Make To Me" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <AuthProvider>
            {children}
            <Toaster richColors />
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}