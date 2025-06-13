import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// GET /api/vms – retorna lista de VMs compute ordenadas por custo USD crescente
export async function GET() {
  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('list_vms')
      .select('*')
      .eq('tipo', 'compute')
      .order('usd', { ascending: true })

    if (error) {
      console.error('Erro Supabase /api/vms:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Erro inesperado /api/vms:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
