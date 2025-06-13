import { VMData } from '@/types/vm-data'

// Busca dados de VMs via rota backend /api/vms
export async function getVMData(): Promise<VMData[]> {
  try {
    const res = await fetch('/api/vms', { next: { revalidate: 60 } })
    if (!res.ok) {
      console.error('Erro HTTP /api/vms', res.status)
      return []
    }
    const data: VMData[] = await res.json()
    return data.map((vm, idx) => ({ ...vm, uid: vm.uid || `vm-${idx}` }))
  } catch (err) {
    console.error('Erro fetch /api/vms', err)
    return []
  }
}