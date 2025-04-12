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

// GET - Buscar um domínio específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Extrair o UID do usuário da URL
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    
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

    // Buscar o domínio específico
    const { data, error } = await supabaseAdmin
      .from('dominios')
      .select('*')
      .eq('dominio_id', id)
      .eq('uid', uid)
      .single()

    if (error) {
      console.error('Erro ao buscar domínio:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Domínio não encontrado', details: error.message },
        { status: 404 }
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

// PUT - Atualizar um domínio específico
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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

    // Verificar se o domínio pertence ao usuário
    const { data: existingDominio, error: checkError } = await supabaseAdmin
      .from('dominios')
      .select('dominio_id')
      .eq('dominio_id', id)
      .eq('uid', data.titular)
      .single()

    if (checkError || !existingDominio) {
      return NextResponse.json(
        { error: 'Domínio não encontrado ou não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.zona !== undefined) updateData.zona = data.zona
    if (data.registrador !== undefined) updateData.registrador = data.registrador
    if (data.dns_primario !== undefined) updateData.dns_primario = data.dns_primario
    if (data.dns_secundario !== undefined) updateData.dns_secundario = data.dns_secundario
    if (data.data_expiracao !== undefined) updateData.data_expiracao = data.data_expiracao
    if (data.status !== undefined) updateData.status = data.status

    // Atualizar domínio
    const { data: updatedDominio, error } = await supabaseAdmin
      .from('dominios')
      .update(updateData)
      .eq('dominio_id', id)
      .eq('uid', data.titular)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar domínio:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao atualizar domínio', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedDominio)
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover um domínio específico
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Extrair o UID do usuário da URL
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    
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

    // Verificar se o domínio pertence ao usuário
    const { data: existingDominio, error: checkError } = await supabaseAdmin
      .from('dominios')
      .select('dominio_id')
      .eq('dominio_id', id)
      .eq('uid', uid)
      .single()

    if (checkError || !existingDominio) {
      return NextResponse.json(
        { error: 'Domínio não encontrado ou não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Remover domínio
    const { error } = await supabaseAdmin
      .from('dominios')
      .delete()
      .eq('dominio_id', id)
      .eq('uid', uid)

    if (error) {
      console.error('Erro ao excluir domínio:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao excluir domínio', details: error.message },
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
