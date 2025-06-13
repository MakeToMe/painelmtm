import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Função de log que não registra nada em produção
function secureLog(operation: string, status: string, details?: string) {
  // Em ambiente de produção, não registramos nada
  if (process.env.NODE_ENV === 'production') {
    return; // Não registra nada em produção
  }
  
  // Em desenvolvimento, apenas registra a operação e status sem detalhes
  if (process.env.NODE_ENV === 'development') {
    console.log(`API: ${operation} - ${status}`)
  }
}

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

// Verifica se o usuário é administrador
async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('mtm_users')
      .select('admin')
      .eq('uid', uid)
      .single()
    
    if (error || !data) return false
    return data.admin === true
  } catch (error) {
    // Erro silencioso para não expor informações sobre permissões
    return false
  }
}

// Verifica se o usuário é o titular do servidor
async function isServerOwner(uid: string, serverId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('servidores')
      .select('titular')
      .eq('uid', serverId)
      .single()
    
    if (error || !data) return false
    return data.titular === uid
  } catch (error) {
    // Erro silencioso para não expor informações sobre propriedade
    return false
  }
}

// GET - Buscar servidores do usuário (sem dados sensíveis)
export async function GET(request: Request) {
  try {
    // Extrair o UID do usuário da URL
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const id = searchParams.get('id')
    
    // Log seguro
    secureLog('Listar servidores', 'inicio')
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID do usuário é obrigatório' },
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

    // Verificar a identidade do usuário solicitante
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('mtm_users')
      .select('uid, admin, email')
      .eq('uid', uid)
      .single()
    
    if (authError || !userAuth) {
      console.log('API - Acesso negado: usuário não encontrado')
      return NextResponse.json(
        { error: 'Usuário não autorizado' },
        { status: 401 }
      )
    }
    
    // Verificar se o usuário é administrador
    const isAdmin = userAuth.admin === true
    // Sem log de status de admin

    // Buscar servidores com informações do titular, mas sem expor dados sensíveis
    let query = supabaseAdmin
      .from('servidores')
      .select(`
        uid,
        created_at,
        titular,
        ip,
        nome,
        cpu,
        ram,
        storage,
        banda,
        location,
        sistema,
        tipo,
        status,
        papel,
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
    
    if (error) {
      secureLog('Listar servidores', 'erro', 'falha na consulta')
      return NextResponse.json(
        { error: 'Erro ao buscar servidores', details: error.message },
        { status: 500 }
      )
    }
    
    // Log seguro
    secureLog('Listar servidores', 'sucesso')
    
    // Transformar os dados para incluir o nome do titular diretamente
    const servidoresFormatados = data?.map(servidor => {
      // Extrair dados do servidor sem expor informações sensíveis
      const { mtm_users, ...dadosServidor } = servidor
      
      // Obter o nome do titular de forma segura
      const titularNome = mtm_users && typeof mtm_users === 'object' && 'nome' in mtm_users ? 
        mtm_users.nome : null;
      
      return {
        ...dadosServidor,
        titular_nome: titularNome
      }
    }) || []

    // Erro já tratado acima

    return NextResponse.json(servidoresFormatados)
  } catch (error) {
    // Log seguro
    secureLog('Listar servidores', 'erro', 'erro interno')
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar credenciais de um servidor específico (endpoint seguro)
export async function HEAD(request: Request) {
  try {
    // Extrair parâmetros da URL
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid') // UID do usuário solicitante
    const serverId = searchParams.get('serverId') // ID do servidor
    
    // Log seguro
    secureLog('Obter credenciais', 'inicio')
    
    // Validar parâmetros obrigatórios
    if (!uid || !serverId) {
      return NextResponse.json(
        { error: 'UID do usuário e ID do servidor são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar a identidade do usuário solicitante
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('mtm_users')
      .select('uid, admin')
      .eq('uid', uid)
      .single()
    
    if (authError || !userAuth) {
      secureLog('Obter credenciais', 'acesso-negado', 'usuário inválido')
      return NextResponse.json(
        { error: 'Usuário não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se o usuário é o titular do servidor ou um administrador
    const isOwner = await isServerOwner(uid, serverId)
    const isAdmin = userAuth.admin === true
    
    if (!isOwner && !isAdmin) {
      secureLog('Obter credenciais', 'acesso-negado', 'permissão insuficiente')
      return NextResponse.json(
        { error: 'Sem permissão para acessar este servidor' },
        { status: 403 }
      )
    }

    // Buscar credenciais do servidor (incluindo dados sensíveis)
    const { data, error } = await supabaseAdmin
      .from('servidores')
      .select('senha, senha_prov, conta_prov, url_prov, papel')
      .eq('uid', serverId)
      .single()
    
    if (error) {
      secureLog('Obter credenciais', 'erro', 'falha na consulta')
      return NextResponse.json(
        { error: 'Erro ao buscar credenciais' },
        { status: 500 }
      )
    }
    
    secureLog('Obter credenciais', 'sucesso')

    return NextResponse.json(data)
  } catch (error) {
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
    
    // Log seguro
    secureLog('Criar servidor', 'inicio')
    
    // Validar dados obrigatórios
    if (!data.titular) {
      return NextResponse.json(
        { error: 'titular é obrigatório' },
        { status: 400 }
      )
    }
    
    // Verificar a identidade do usuário solicitante
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('mtm_users')
      .select('uid, admin')
      .eq('uid', data.titular)
      .single()
    
    if (authError || !userAuth) {
      secureLog('Criar servidor', 'acesso-negado', 'usuário inválido')
      return NextResponse.json(
        { error: 'Usuário não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Sanitizar dados para o log (remover informações sensíveis)
    const dadosLog = { ...data }
    delete dadosLog.senha
    delete dadosLog.providerPassword
    delete dadosLog.senha_prov
    
    // Criar novo servidor
    const { data: newServer, error } = await supabaseAdmin
      .from('servidores')
      .insert({
        titular: data.titular,
        nome: data.nome || null,
        ip: data.ip || null,
        senha: data.senha || null,
        user_ssh: data.user_ssh || null, // Adicionado campo user_ssh
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
      .select('uid, nome, ip, tipo, sistema, location, status, titular, papel')
      .single()

    if (error) {
      secureLog('Criar servidor', 'erro', 'falha na operação')
      return NextResponse.json(
        { error: 'Erro ao criar servidor' },
        { status: 500 }
      )
    }
    
    secureLog('Criar servidor', 'sucesso')

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
    
    // Log seguro
    secureLog('Atualizar servidor', 'inicio')
    
    // Validar dados obrigatórios
    if (!data.uid || !data.titular) {
      return NextResponse.json(
        { error: 'uid e titular são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar a identidade do usuário solicitante
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('mtm_users')
      .select('uid, admin')
      .eq('uid', data.titular)
      .single()
    
    if (authError || !userAuth) {
      secureLog('Atualizar servidor', 'acesso-negado', 'usuário inválido')
      return NextResponse.json(
        { error: 'Usuário não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se o servidor existe
    const { data: existingServer, error: checkError } = await supabaseAdmin
      .from('servidores')
      .select('uid, titular')
      .eq('uid', data.uid)
      .single()

    if (checkError || !existingServer) {
      secureLog('Atualizar servidor', 'erro', 'recurso não encontrado')
      return NextResponse.json(
        { error: 'Servidor não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário é o titular do servidor ou um administrador
    const isOwner = existingServer.titular === data.titular
    const isAdmin = userAuth.admin === true
    
    if (!isOwner && !isAdmin) {
      secureLog('Atualizar servidor', 'acesso-negado', 'permissão insuficiente')
      return NextResponse.json(
        { error: 'Sem permissão para atualizar este servidor' },
        { status: 403 }
      )
    }

    // Sanitizar dados para o log (remover informações sensíveis)
    const dadosLog = { ...data }
    delete dadosLog.senha
    delete dadosLog.senha_prov
    delete dadosLog.providerPassword
    
    // Preparar dados para atualização
    const updateData: any = {}
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.ip !== undefined) updateData.ip = data.ip
    if (data.senha !== undefined) updateData.senha = data.senha
    if (data.user_ssh !== undefined) updateData.user_ssh = data.user_ssh
    if (data.cpu !== undefined) updateData.cpu = data.cpu
    if (data.ram !== undefined) updateData.ram = data.ram
    if (data.storage !== undefined) updateData.storage = data.storage
    if (data.banda !== undefined) updateData.banda = data.banda
    if (data.location !== undefined) updateData.location = data.location
    if (data.sistema !== undefined) updateData.sistema = data.sistema
    if (data.tipo !== undefined) updateData.tipo = data.tipo
    if (data.status !== undefined) updateData.status = data.status
    if (data.papel !== undefined) updateData.papel = data.papel
    if (data.providerLoginUrl !== undefined) updateData.url_prov = data.providerLoginUrl
    if (data.providerLogin !== undefined) updateData.conta_prov = data.providerLogin
    if (data.providerPassword !== undefined) updateData.senha_prov = data.providerPassword

    // Atualizar servidor
    const { data: updatedServer, error } = await supabaseAdmin
      .from('servidores')
      .update(updateData)
      .eq('uid', data.uid)
      .select('uid, nome, ip, tipo, sistema, location, status, titular, papel')
      .single()

    if (error) {
      secureLog('Atualizar servidor', 'erro', 'falha na operação')
      return NextResponse.json(
        { error: 'Erro ao atualizar servidor' },
        { status: 500 }
      )
    }
    
    secureLog('Atualizar servidor', 'sucesso')

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
    const uid = searchParams.get('uid') // UID do usuário solicitante
    const serverId = searchParams.get('serverId') // ID do servidor a ser removido
    
    // Log seguro
    secureLog('Remover servidor', 'inicio')
    
    // Validar parâmetros obrigatórios
    if (!uid || !serverId) {
      return NextResponse.json(
        { error: 'UID do usuário e ID do servidor são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar a identidade do usuário solicitante
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('mtm_users')
      .select('uid, admin')
      .eq('uid', uid)
      .single()
    
    if (authError || !userAuth) {
      secureLog('Remover servidor', 'acesso-negado', 'usuário inválido')
      return NextResponse.json(
        { error: 'Usuário não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    // Verificar se o servidor existe
    const { data: existingServer, error: checkError } = await supabaseAdmin
      .from('servidores')
      .select('uid, titular')
      .eq('uid', serverId)
      .single()

    if (checkError || !existingServer) {
      secureLog('Remover servidor', 'erro', 'recurso não encontrado')
      return NextResponse.json(
        { error: 'Servidor não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário é o titular do servidor ou um administrador
    const isOwner = existingServer.titular === uid
    const isAdmin = userAuth.admin === true
    
    if (!isOwner && !isAdmin) {
      secureLog('Remover servidor', 'acesso-negado', 'permissão insuficiente')
      return NextResponse.json(
        { error: 'Sem permissão para remover este servidor' },
        { status: 403 }
      )
    }

    // Remover servidor
    const { error } = await supabaseAdmin
      .from('servidores')
      .delete()
      .eq('uid', serverId)

    if (error) {
      secureLog('Remover servidor', 'erro', 'falha na operação')
      return NextResponse.json(
        { error: 'Erro ao remover servidor' },
        { status: 500 }
      )
    }
    
    secureLog('Remover servidor', 'sucesso')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
