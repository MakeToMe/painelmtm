import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

// Cria um cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'mtm'
    }
  }
)

export async function GET(request: Request) {
  try {
    console.log('Recebida requisição GET /api/auth/profile')
    
    // Obter email da query string
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Se não tiver email na query, verificar token
    if (!email) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        console.log('Token não fornecido no header e email não fornecido na query')
        return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
      }

      const token = authHeader.split(' ')[1]
      
      const payload = await verifyJWT(token)
      
      if (!payload?.email) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      
      // Usar o email do token
      const userEmail = payload.email
      
      // Buscar perfil do usuário
      const { data: profile, error } = await supabaseAdmin
        .from('mtm_users')
        .select('*')
        .eq('email', userEmail)
        .single()

      if (error || !profile) {
        return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
      }

      console.log('Perfil encontrado via token')
      return NextResponse.json(profile)
    }
    
    // Buscar perfil do usuário usando o email da query
    const { data: profile, error } = await supabaseAdmin
      .from('mtm_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    console.log('Perfil encontrado via query parameter')
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
