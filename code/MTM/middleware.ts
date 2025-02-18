import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/jwt'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Pegar o token do cookie ou header
  const token = req.cookies.get('mtm_token')?.value || 
                req.headers.get('authorization')?.replace('Bearer ', '')

  // Se não estiver autenticado e tentar acessar rotas protegidas
  if (!token && (req.nextUrl.pathname.startsWith('/dashboard') || 
                 req.nextUrl.pathname.startsWith('/perfil'))) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/perfil/:path*'],
}
