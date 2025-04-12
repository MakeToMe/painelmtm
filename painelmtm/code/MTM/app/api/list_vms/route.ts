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

// GET - Buscar opções de VMs por tipo
export async function GET(request: Request) {
  try {
    // Extrair o tipo da URL
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    
    if (!tipo) {
      return NextResponse.json(
        { error: 'Tipo é obrigatório' },
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

    // Buscar opções de VMs
    const { data, error } = await supabaseAdmin
      .from('list_vms')
      .select('*')
      .eq('tipo', tipo)

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar opções de VMs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
