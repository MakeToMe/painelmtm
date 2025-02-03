import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { Proxy } from '@/types/proxy';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
