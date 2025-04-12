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

// GET - Buscar domínios do usuário
export async function GET(request: Request) {
  try {
    // Extrair o UID do usuário da URL
    const { searchParams } = new URL(request.url)
    const titular = searchParams.get('titular')
    const id = searchParams.get('id')
    
    console.log('API Domínios - GET - Parâmetros:', { titular, id })
    
    if (!titular) {
      console.log('API Domínios - GET - Erro: titular não fornecido')
      return NextResponse.json(
        { error: 'Titular é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API Domínios - GET - Erro: Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    console.log('API Domínios - GET - Iniciando consulta ao Supabase')
    
    // Buscar domínios do usuário
    let query = supabaseAdmin
      .from('dominios')
      .select('*')
      .eq('titular', titular)
    
    // Se um ID específico for fornecido, filtrar por ele também
    if (id) {
      query = query.eq('Uid', id) // Usando Uid (com U maiúsculo) que é a chave primária
    }

    console.log('API Domínios - GET - Query construída:', query)

    const { data, error } = await query

    if (error) {
      console.error('API Domínios - GET - Erro ao buscar domínios:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao buscar domínios', details: error.message },
        { status: 500 }
      )
    }

    // Log detalhado da estrutura dos dados
    if (data && data.length > 0) {
      console.log('API Domínios - GET - Estrutura do primeiro domínio:', JSON.stringify(data[0]))
      console.log('API Domínios - GET - Campos disponíveis:', Object.keys(data[0]).join(', '))
    }

    console.log(`API Domínios - GET - Sucesso: ${data?.length || 0} domínios encontrados`)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Domínios - GET - Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// POST - Criar novo domínio
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validar dados obrigatórios
    if (!data.titular) {
      console.log('API Domínios - POST - Erro: titular não fornecido')
      return NextResponse.json(
        { error: 'titular é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API Domínios - POST - Erro: Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    console.log('API Domínios - POST - Iniciando criação de domínio')
    
    // Criar novo domínio
    const { data: newDominio, error } = await supabaseAdmin
      .from('dominios')
      .insert({
        titular: data.titular,
        nome: data.nome || 'Novo Domínio',
        zona: data.zona || '',
        registrador: data.registrador || 'Desconhecido',
        dns_primario: data.dns_primario || '',
        dns_secundario: data.dns_secundario || '',
        data_expiracao: data.data_expiracao || null,
        status: data.status || 'ativo'
      })
      .select()
      .single()

    if (error) {
      console.error('API Domínios - POST - Erro ao criar domínio:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao criar domínio', details: error.message },
        { status: 500 }
      )
    }

    console.log(`API Domínios - POST - Sucesso: domínio criado com ID ${newDominio.Uid}`)
    return NextResponse.json(newDominio)
  } catch (error) {
    console.error('API Domínios - POST - Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar domínio existente
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Validar dados obrigatórios
    if (!data.titular) {
      console.log('API Domínios - PUT - Erro: titular não fornecido')
      return NextResponse.json(
        { error: 'titular é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API Domínios - PUT - Erro: Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    console.log('API Domínios - PUT - Iniciando atualização de domínio')
    
    // Verificar se o domínio pertence ao usuário
    const { data: existingDominio, error: checkError } = await supabaseAdmin
      .from('dominios')
      .select('Uid')
      .eq('Uid', data.titular)
      .eq('titular', data.titular)
      .single()

    if (checkError || !existingDominio) {
      console.log('API Domínios - PUT - Erro: domínio não encontrado ou não pertence ao usuário')
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

    console.log('API Domínios - PUT - Dados para atualização:', updateData)
    
    // Atualizar domínio
    const { data: updatedDominio, error } = await supabaseAdmin
      .from('dominios')
      .update(updateData)
      .eq('Uid', data.titular)
      .eq('titular', data.titular)
      .select()
      .single()

    if (error) {
      console.error('API Domínios - PUT - Erro ao atualizar domínio:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao atualizar domínio', details: error.message },
        { status: 500 }
      )
    }

    console.log(`API Domínios - PUT - Sucesso: domínio atualizado com ID ${updatedDominio.Uid}`)
    return NextResponse.json(updatedDominio)
  } catch (error) {
    console.error('API Domínios - PUT - Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// DELETE - Remover domínio
export async function DELETE(request: Request) {
  try {
    // Extrair o UID do usuário e ID do domínio da URL
    const { searchParams } = new URL(request.url)
    const titular = searchParams.get('titular')
    const id = searchParams.get('id')
    
    console.log('API Domínios - DELETE - Parâmetros:', { titular, id })
    
    if (!titular || !id) {
      console.log('API Domínios - DELETE - Erro: titular e ID não fornecidos')
      return NextResponse.json(
        { error: 'Titular e ID são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API Domínios - DELETE - Erro: Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    console.log('API Domínios - DELETE - Iniciando remoção de domínio')
    
    // Verificar se o domínio pertence ao usuário
    const { data: existingDominio, error: checkError } = await supabaseAdmin
      .from('dominios')
      .select('Uid')
      .eq('Uid', id)
      .eq('titular', titular)
      .single()

    if (checkError || !existingDominio) {
      console.log('API Domínios - DELETE - Erro: domínio não encontrado ou não pertence ao usuário')
      return NextResponse.json(
        { error: 'Domínio não encontrado ou não pertence ao usuário' },
        { status: 403 }
      )
    }

    // Remover domínio
    const { error } = await supabaseAdmin
      .from('dominios')
      .delete()
      .eq('Uid', id)
      .eq('titular', titular)

    if (error) {
      console.error('API Domínios - DELETE - Erro ao excluir domínio:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao excluir domínio', details: error.message },
        { status: 500 }
      )
    }

    console.log(`API Domínios - DELETE - Sucesso: domínio removido com ID ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Domínios - DELETE - Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
