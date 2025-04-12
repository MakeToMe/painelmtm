import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
    console.log('Recebida requisição GET /api/users')
    
    // Obter parâmetros da query string
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const isAdmin = searchParams.get('isAdmin') === 'true'
    
    console.log('UID do usuário:', uid)
    console.log('É administrador?', isAdmin)
    
    if (!uid) {
      console.log('UID não fornecido na query')
      return NextResponse.json({ error: 'UID é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário existe e é administrador (se necessário)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('mtm_users')
      .select('admin')
      .eq('uid', uid)
      .single()

    if (userError || !userData) {
      console.log('Usuário não encontrado:', userError)
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Se o parâmetro isAdmin for true, verificar se o usuário realmente é admin
    if (isAdmin && userData.admin !== true) {
      console.log('Usuário não é administrador')
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar todos os usuários
    const { data, error } = await supabaseAdmin
      .from('mtm_users')
      .select('uid, nome, email')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Usuários encontrados:', data?.length || 0)
    return NextResponse.json({ users: data })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
