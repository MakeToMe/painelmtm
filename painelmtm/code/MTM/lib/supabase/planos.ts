import { supabase } from '@/lib/supabase'

export interface Plano {
  uid: string
  nome: string
  descrição: string
  valor: number | null
  created_at: string
}

export async function getPlanos() {
  try {
    console.log('Iniciando busca de planos...');
    
    const { data, error } = await supabase
      .from('planos')
      .select('uid, nome, descrição, valor, created_at');
    
    if (error) {
      console.error('Erro Supabase:', error);
      throw error;
    }
    
    console.log('Planos encontrados:', data);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return [];
  }
}
