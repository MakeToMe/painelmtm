import { VMData } from '@/types/vm-data';

export async function getStorageVMData(): Promise<VMData[]> {
  try {
    const res = await fetch('/api/storage-vms', { next: { revalidate: 60 } })
    if (!res.ok) {
      console.error('Erro HTTP /api/storage-vms', res.status)
      return []
    }
    const data: VMData[] = await res.json()
    return data
  } catch (err) {
    console.error('Erro fetch /api/storage-vms', err)
    return []
  }
}
