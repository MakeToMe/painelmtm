import { supabase } from '@/lib/supabase';
import { VMData } from '@/types/vm-data';

export async function getVMData(): Promise<VMData[]> {
  try {
    console.log('getVMData: Iniciando busca...');
    const { data, error } = await supabase
      .from('list_vms')
      .select('*')
      .eq('tipo', 'compute')
      .order('usd', { ascending: true });

    if (error) {
      console.error('Erro ao buscar VMs:', error.message);
      return [];
    }

    console.log('getVMData: Dados brutos:', data);

    // Garantir que cada VM tenha um uid único
    const vmsWithUid = (data || []).map((vm, index) => ({
      ...vm,
      uid: vm.uid || `vm-${index}`
    }));

    console.log('getVMData: Dados processados:', vmsWithUid);
    return vmsWithUid;
  } catch (error) {
    console.error('Erro ao buscar VMs:', error);
    return [];
  }
}