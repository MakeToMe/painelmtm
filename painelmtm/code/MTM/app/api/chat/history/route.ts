import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// GET /api/chat/history?chatId=xxx -> retorna mensagens ordenadas
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chatId')
  if (!chatId) return NextResponse.json({ error: 'chatId param required' }, { status: 400 })

  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('chat_faq')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('chat history error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
