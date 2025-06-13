import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { signJWT } from '@/lib/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { email, password, loginMethod } = await request.json()
    console.log('Recebido request de login:', { email, loginMethod })
    
    const supabase = createSupabaseServer()

    // Hash da senha
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex')
    console.log('Senha hasheada')

    // Verificar usuário
    const query = supabase
      .from('mtm_users')
      .select('*')
      .eq('password', hashedPassword)

    // Adiciona a condição correta baseada no método de login
    if (loginMethod === 'whatsapp') {
      query.eq('whatsapp', email)
    } else {
      query.eq('email', email)
    }

    console.log('Buscando usuário no Supabase')
    const { data: user, error: checkError } = await query.maybeSingle()
    console.log('Resultado da busca:', { user, error: checkError })

    if (checkError) {
      console.error('Erro ao verificar usuário:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 400 })
    }

    if (!user) {
      const errorMessage = loginMethod === 'whatsapp' 
        ? 'WhatsApp ou senha inválidos' 
        : 'Email ou senha inválidos'
      console.log('Usuário não encontrado:', errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 401 })
    }

    console.log('Usuário encontrado, gerando token')
    // Gerar token JWT
    const token = await signJWT({ 
      email: user.email,
      nome: user.nome
    })

    const responseData = {
      token,
      user: {
        email: user.email,
        nome: user.nome,
        whatsapp: user.whatsapp
      }
    }
    console.log('Retornando resposta:', responseData)

    // Retornar token e dados do usuário
    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
