import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { signJWT } from '@/lib/jwt'
import { createClient } from '@supabase/supabase-js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    // Obter dados da requisição
    const body = await request.json()
    const { email, password, nome, whatsapp } = body
    console.log('Dados recebidos:', { email, nome, whatsapp })
    
    // Verificar se os dados obrigatórios estão presentes
    if (!email || !password || !nome) {
      console.error('Dados incompletos:', { email, nome, whatsapp })
      return NextResponse.json({ error: 'Dados incompletos. Email, senha e nome são obrigatórios.' }, { status: 400 })
    }
    
    // Hash da senha
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex')

    // Inicializar cliente Supabase com schema mtm
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: {
          schema: 'mtm'
        }
      }
    )
    
    // Verificar se usuário já existe
    const { data: users, error: checkError } = await supabase
      .from('mtm_users')
      .select('*')
      .eq('email', email)

    if (checkError) {
      console.error('Erro ao verificar usuário:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 400 })
    }

    const existingUser = users?.[0]

    if (existingUser) {
      // Não permitir registro com email já existente
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 409 }
      )
    }
    
    console.log('Dados para inserção:', { email, nome, whatsapp })

    // Criar novo usuário
    const { error: createError } = await supabase
      .from('mtm_users')
      .insert({
        email,
        password: hashedPassword,
        email_valid: true,
        nome,
        whatsapp,
      })

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Gerar token JWT
    const token = await signJWT({ 
      email,
      nome
    })

    // Retornar token e dados do usuário
    return NextResponse.json({
      token,
      user: {
        email,
        nome,
        whatsapp
      }
    })
  } catch (error: any) {
    console.error('Erro no signup:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
