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

// GET - Buscar integrações do usuário
export async function GET(request: Request) {
  try {
    // Extrair o UID do usuário da URL
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const id = searchParams.get('id')
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Buscar integrações do usuário
    let query = supabaseAdmin
      .from('integracoes')
      .select('*')
      .eq('titular', uid)
    
    // Se um ID específico for fornecido, filtrar por ele também
    if (id) {
      query = query.eq('uid', id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar integrações:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao buscar integrações', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova integração
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
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Criar nova integração
    const { data: newIntegracao, error } = await supabaseAdmin
      .from('integracoes')
      .insert({
        titular: data.titular,
        nome: data.nome || 'Nova Integração',
        chave: data.chave || '',
        secret: data.secret || '',
        url: data.url || '',
        origem: data.origem || 'cloudflare'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar integração:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao criar integração', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(newIntegracao)
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar integração existente
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    console.log('Dados recebidos na API PUT:', data)
    
    // Validar dados obrigatórios
    if (!data.uid || !data.titular) {
      console.log('Erro: uid ou titular não fornecidos')
      return NextResponse.json(
        { error: 'uid e titular são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se a integração pertence ao usuário
    const { data: existingIntegracao, error: checkError } = await supabaseAdmin
      .from('integracoes')
      .select('uid')
      .eq('uid', data.uid)
      .eq('titular', data.titular)
      .single()

    if (checkError || !existingIntegracao) {
      return NextResponse.json(
        { error: 'Integração não encontrada ou não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Atualizar integração
    const updateData: any = {}
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.chave !== undefined) updateData.chave = data.chave
    if (data.secret !== undefined) updateData.secret = data.secret
    if (data.url !== undefined) updateData.url = data.url
    if (data.origem !== undefined) updateData.origem = data.origem
    if (data.config !== undefined) updateData.config = data.config
    if (data.status !== undefined) updateData.status = data.status
    if (data.tipo !== undefined) updateData.tipo = data.tipo
    
    console.log('Dados a serem atualizados:', updateData)

    const { data: updatedIntegracao, error } = await supabaseAdmin
      .from('integracoes')
      .update(updateData)
      .eq('uid', data.uid)
      .eq('titular', data.titular)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar integração:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao atualizar integração', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedIntegracao)
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover integração
export async function DELETE(request: Request) {
  try {
    // Extrair parâmetros da URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const uid = searchParams.get('uid')
    
    if (!id || !uid) {
      return NextResponse.json(
        { error: 'id e uid são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se a integração pertence ao usuário
    const { data: existingIntegracao, error: checkError } = await supabaseAdmin
      .from('integracoes')
      .select('uid')
      .eq('uid', id)
      .eq('titular', uid)
      .single()

    if (checkError || !existingIntegracao) {
      return NextResponse.json(
        { error: 'Integração não encontrada ou não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Remover integração
    const { error } = await supabaseAdmin
      .from('integracoes')
      .delete()
      .eq('uid', id)
      .eq('titular', uid)

    if (error) {
      console.error('Erro ao remover integração:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao remover integração', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
