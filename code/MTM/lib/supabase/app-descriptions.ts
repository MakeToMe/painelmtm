import { supabase } from '@/lib/supabase';
import { AppDescription } from '@/types/app-description';

// Cache local para evitar refreshes desnecessários
let appDescriptionCache: { [key: string]: AppDescription } = {};

const FIXED_UID = '3050e4e4-6e8f-4037-af94-711c42be7c9f';

export async function getAppDescription(uid: string): Promise<AppDescription | null> {
  if (!uid) {
    console.error('UID is required');
    return null;
  }

  // Primeiro tenta usar o cache
  if (appDescriptionCache[uid]) {
    return appDescriptionCache[uid];
  }

  console.log('\n=== Starting getAppDescription ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('UID:', uid);

  try {
    const { data, error } = await supabase
      .from('list_apps')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error) {
      console.error('Error fetching app description:', error.message);
      return null;
    }

    if (!data) {
      console.log('No data found for UID:', uid);
      return null;
    }

    // Atualiza o cache
    appDescriptionCache[uid] = data;
    console.log('Data fetched and cached:', data);
    return data;

  } catch (error) {
    const err = error as Error;
    console.error('Exception in getAppDescription:', err.message);
    return null;
  }
}

// Configurar realtime para a tabela list_apps
supabase
  .channel('list_apps_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'mtm',
      table: 'list_apps'
    },
    (payload) => {
      const record = payload.new as AppDescription;
      if (record && record.uid) {
        // Atualiza o cache local apenas se os dados forem diferentes
        if (JSON.stringify(appDescriptionCache[record.uid]) !== JSON.stringify(record)) {
          appDescriptionCache[record.uid] = record;
          console.log('Cache atualizado para:', record.uid);
        }
      }
    }
  )
  .subscribe();

// Cache para 1 hora por padrão
export async function getAppDescriptionCached(uid: string): Promise<AppDescription | null> {
  return getAppDescription(uid);
}
