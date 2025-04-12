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

// GET - Buscar subdomínios do usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const titular = searchParams.get('titular');
    const dominio = searchParams.get('dominio');

    console.log('API Subdomínios - GET - Parâmetros:', { titular, dominio });

    if (!titular || !dominio) {
      console.log('API Subdomínios - GET - Erro: parâmetros obrigatórios não fornecidos');
      return NextResponse.json(
        { error: 'Parâmetros titular e dominio são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API Subdomínios - GET - Erro: Variáveis de ambiente do Supabase não configuradas');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    console.log('API Subdomínios - GET - Iniciando consulta ao Supabase');

    // Buscar subdomínios diretamente usando o dominio_id (que agora é o Uid do domínio)
    const { data, error } = await supabaseAdmin
      .from('subdominios')
      .select('*')
      .eq('titular', titular)
      .eq('dominio_id', dominio);

    if (error) {
      console.error('API Subdomínios - GET - Erro ao buscar subdomínios:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar subdomínios', details: error.message },
        { status: 500 }
      );
    }

    console.log(`API Subdomínios - GET - Sucesso: ${data?.length || 0} subdomínios encontrados`);
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API Subdomínios - GET - Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar subdomínio
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const titular = searchParams.get('titular');
    const dominio = searchParams.get('dominio');
    const body = await request.json();

    console.log('API Subdomínios - PUT - Parâmetros:', { titular, dominio, body });

    if (!titular || !dominio || !body.uid) {
      console.log('API Subdomínios - PUT - Erro: parâmetros obrigatórios não fornecidos');
      return NextResponse.json(
        { error: 'Parâmetros titular, dominio e uid são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('API Subdomínios - PUT - Erro: Variáveis de ambiente do Supabase não configuradas');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    // Verificar se o subdomínio pertence ao usuário e domínio
    const { data: existingSubdomain, error: checkError } = await supabaseAdmin
      .from('subdominios')
      .select('*')
      .eq('uid', body.uid)
      .eq('titular', titular)
      .eq('dominio_id', dominio)
      .single();

    if (checkError || !existingSubdomain) {
      console.error('API Subdomínios - PUT - Erro: Subdomínio não encontrado ou sem permissão');
      return NextResponse.json(
        { error: 'Subdomínio não encontrado ou sem permissão para editar' },
        { status: 404 }
      );
    }

    // Atualizar o subdomínio
    const { data, error } = await supabaseAdmin
      .from('subdominios')
      .update({
        nome: body.nome,
        tipo: body.tipo,
        ip: body.ip,
        proxy: body.proxy
      })
      .eq('uid', body.uid)
      .eq('titular', titular)
      .eq('dominio_id', dominio)
      .select()
      .single();

    if (error) {
      console.error('API Subdomínios - PUT - Erro ao atualizar subdomínio:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar subdomínio', details: error.message },
        { status: 500 }
      );
    }

    console.log('API Subdomínios - PUT - Sucesso: Subdomínio atualizado');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Subdomínios - PUT - Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
