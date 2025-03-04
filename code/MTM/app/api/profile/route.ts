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

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    console.log('Dados recebidos na API:', data)
    
    // Valida se tem uid
    if (!data.uid) {
      console.error('UID não fornecido na requisição')
      return NextResponse.json(
        { error: 'UID é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    console.log('Tentando atualizar usuário com UID:', data.uid)

    // Atualiza o perfil usando a chave de serviço
    const { data: updatedUser, error } = await supabaseAdmin
      .from('mtm_users')
      .update({
        nome: data.nome || '',
        documento: data.documento || '',
        whatsapp: data.whatsapp || '',
        cep: data.cep || '',
        rua: data.rua || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        uf: data.uf || ''
      })
      .eq('uid', data.uid)
      .select()
      .single()

    if (error) {
      console.error('Erro detalhado ao atualizar perfil:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil', details: error.message },
        { status: 500 }
      )
    }

    console.log('Perfil atualizado com sucesso:', updatedUser)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
