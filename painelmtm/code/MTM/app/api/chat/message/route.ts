import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const msg = await request.json()
  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase.from('chat_faq').insert([msg]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { uid, updates } = await request.json()
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })
  try {
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('chat_faq').update(updates).eq('uid', uid)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { uid } = await request.json()
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })
  try {
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('chat_faq').delete().eq('uid', uid)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
