import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// GET /api/storage-vms – retorna lista de VMs storage ordenadas por custo USD crescente
export async function GET() {
  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('list_vms')
      .select('*')
      .eq('tipo', 'storage')
      .order('usd', { ascending: true })

    if (error) {
      console.error('Erro Supabase /api/storage-vms:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Erro inesperado /api/storage-vms:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
