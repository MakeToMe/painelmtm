import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { signJWT } from '@/lib/jwt'
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { email, password, userData } = await request.json()
    console.log('Dados recebidos:', { email, userData })
    
    // Hash da senha
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex')

    // Verificar se usuário já existe
    const { data: users, error: checkError } = await supabase
      .from('mtm_users')
      .select()
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

    // Criar novo usuário
    const { error: createError } = await supabase
      .from('mtm_users')
      .insert({
        email,
        password: hashedPassword,
        email_valid: true,
        nome: userData.nome,
        whatsapp: userData.whatsapp,
      })

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Gerar token JWT
    const token = await signJWT({ 
      email,
      nome: userData.nome
    })

    // Retornar token e dados do usuário
    return NextResponse.json({
      token,
      user: {
        email,
        nome: userData.nome
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
