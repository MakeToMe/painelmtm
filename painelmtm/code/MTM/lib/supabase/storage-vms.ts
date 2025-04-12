import { supabase } from '@/lib/supabase';
import { VMData } from '@/types/vm-data';

export async function getStorageVMData(): Promise<VMData[]> {
  try {
    console.log('getStorageVMData: Iniciando busca...');
    const { data, error } = await supabase
      .from('list_vms')
      .select('*')
      .eq('tipo', 'storage')
      .order('usd', { ascending: true });

    if (error) {
      console.error('getStorageVMData: Erro ao buscar dados:', error);
      throw error;
    }

    console.log('getStorageVMData: Dados brutos:', data);

    const vmsWithUid = data.map((vm: any) => ({
      ...vm,
      uid: vm.uid || `storage-${Math.random().toString(36).substr(2, 9)}`
    }));

    console.log('getStorageVMData: Dados processados:', vmsWithUid);
    return vmsWithUid;
  } catch (error) {
    console.error('getStorageVMData: Erro:', error);
    throw error;
  }
}
