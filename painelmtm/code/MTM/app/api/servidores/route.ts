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

// GET - Buscar servidores do usuário
export async function GET(request: Request) {
  try {
    // Extrair o UID do usuário da URL
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const id = searchParams.get('id')
    let isAdmin = searchParams.get('isAdmin') === 'true'
    
    console.log('API - Parâmetros:', { uid, id, isAdmin })
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se o usuário realmente é admin
    if (isAdmin) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('mtm_users')
        .select('admin')
        .eq('uid', uid)
        .single()
      
      console.log('API - Verificação de admin:', userData)
      
      // Se houver erro ou o usuário não for admin, ignoramos o parâmetro isAdmin
      if (userError || userData?.admin !== true) {
        console.log('API - Usuário não é admin, aplicando filtro por titular')
        isAdmin = false
      }
    }

    // Buscar servidores com informações do titular
    let query = supabaseAdmin
      .from('servidores')
      .select(`
        *,
        mtm_users!titular(nome)
      `)
    
    // Se o usuário não for admin, filtrar apenas pelos servidores dele
    if (!isAdmin) {
      query = query.eq('titular', uid)
    }
    
    // Se um ID específico for fornecido, filtrar por ele também
    if (id) {
      query = query.eq('uid', id)
    }

    const { data, error } = await query
    
    console.log('API - Servidores encontrados:', data?.length || 0)
    console.log('API - Dados brutos:', JSON.stringify(data, null, 2))
    
    // Transformar os dados para incluir o nome do titular diretamente
    const servidoresFormatados = data?.map(servidor => ({
      ...servidor,
      titular_nome: servidor.mtm_users?.nome || null
    })) || []

    if (error) {
      console.log('API - Erro na consulta:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar servidores', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(servidoresFormatados)
  } catch (error) {
    console.log('API - Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo servidor
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validar dados obrigatórios
    if (!data.titular) {
      return NextResponse.json(
        { error: 'titular é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Criar novo servidor
    const { data: newServer, error } = await supabaseAdmin
      .from('servidores')
      .insert({
        titular: data.titular,
        nome: data.nome || null,
        ip: data.ip || null,
        senha: data.senha || null,
        cpu: data.cpu || null,
        ram: data.ram || null,
        storage: data.storage || null,
        banda: data.banda || null,
        location: data.location || null,
        sistema: data.sistema || null,
        tipo: data.tipo || null,
        status: data.status || 'online',
        // Campos do provedor
        url_prov: data.providerLoginUrl || null,
        conta_prov: data.providerLogin || null,
        senha_prov: data.providerPassword || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar servidor', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(newServer)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar servidor existente
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Validar dados obrigatórios
    if (!data.uid || !data.titular) {
      return NextResponse.json(
        { error: 'uid e titular são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se o servidor pertence ao usuário
    const { data: existingServer, error: checkError } = await supabaseAdmin
      .from('servidores')
      .select('uid')
      .eq('uid', data.uid)
      .eq('titular', data.titular)
      .single()

    if (checkError || !existingServer) {
      return NextResponse.json(
        { error: 'Servidor não encontrado ou não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.ip !== undefined) updateData.ip = data.ip
    if (data.senha !== undefined) updateData.senha = data.senha
    if (data.cpu !== undefined) updateData.cpu = data.cpu
    if (data.ram !== undefined) updateData.ram = data.ram
    if (data.storage !== undefined) updateData.storage = data.storage
    if (data.banda !== undefined) updateData.banda = data.banda
    if (data.location !== undefined) updateData.location = data.location
    if (data.sistema !== undefined) updateData.sistema = data.sistema
    if (data.tipo !== undefined) updateData.tipo = data.tipo
    if (data.status !== undefined) updateData.status = data.status

    // Atualizar servidor
    const { data: updatedServer, error } = await supabaseAdmin
      .from('servidores')
      .update(updateData)
      .eq('uid', data.uid)
      .eq('titular', data.titular)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar servidor', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedServer)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover servidor
export async function DELETE(request: Request) {
  try {
    // Extrair parâmetros da URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const uid = searchParams.get('uid')
    const isAdmin = searchParams.get('isAdmin') === 'true'
    
    if (!id || !uid) {
      return NextResponse.json(
        { error: 'id e uid são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se o servidor pertence ao usuário
    if (!isAdmin) {
      const { data: existingServer, error: checkError } = await supabaseAdmin
        .from('servidores')
        .select('uid')
        .eq('uid', id)
        .eq('titular', uid)
        .single()

      if (checkError || !existingServer) {
        return NextResponse.json(
          { error: 'Servidor não encontrado ou não pertence ao usuário' },
          { status: 403 }
        )
      }
    }

    // Remover servidor
    const { error } = await supabaseAdmin
      .from('servidores')
      .delete()
      .eq('uid', id)

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao remover servidor', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
