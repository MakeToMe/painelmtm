import { supabase } from '@/lib/supabase';
import { Proxy } from '@/types/proxy';

export async function getProxies(): Promise<Proxy[]> {
  try {
    const { data, error } = await supabase
      .from('joe-proxys')
      .select('*');

    if (error) {
      console.error('Error fetching proxies:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProxies:', error);
    return [];
  }
}
