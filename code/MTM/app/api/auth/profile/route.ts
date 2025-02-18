import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: Request) {
  try {
    console.log('Recebida requisição GET /api/auth/profile')
    
    // Verificar token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Token não fornecido no header')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token recebido:', token.substring(0, 10) + '...')
    
    const payload = await verifyJWT(token)
    console.log('Payload do token:', payload)
    
    if (!payload?.email) {
      console.log('Token inválido - email não encontrado no payload')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Buscar perfil do usuário
    console.log('Buscando perfil para email:', payload.email)
    const { data: profile, error } = await supabase
      .from('mtm_users')
      .select('*')
      .eq('email', payload.email)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
    }

    if (!profile) {
      console.log('Perfil não encontrado para o email:', payload.email)
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    console.log('Perfil encontrado:', profile)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
