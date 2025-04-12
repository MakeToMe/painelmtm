import { supabase } from '@/lib/supabase';
import { AppData } from '@/lib/app-data';

export async function getAppList(plano?: 'Basic' | 'IA'): Promise<AppData[]> {
  try {
    console.log('Fetching apps for plan:', plano);
    
    const { data, error } = await supabase
      .from('list_apps')
      .select('*')
      .eq('plano', plano);

    if (error) {
      console.error('Error fetching app list:', error.message);
      return [];
    }

    if (!data) {
      console.log('No data returned from Supabase');
      return [];
    }

    console.log('Apps found:', data.length);
    console.log('Raw data:', data);

    // Converter os dados do Supabase para o formato AppData
    return data.map(app => ({
      id: app.uid,
      uid: app.uid,
      name: app.nome,
      url: app.url || '#',
      docsUrl: app.docs_url || '#',
      logo: app.icone || '',
      nome: app.nome,
      descricao: app.descricao,
      categoria: app.categoria,
      plano: app.plano,
      preco: app.preco,
      ordem: app.ordem,
      icone: app.icone,
      slug: app.slug || app.nome.toLowerCase().replace(/\s+/g, '-')
    }));

  } catch (error) {
    console.error('Exception in getAppList:', error);
    return [];
  }
}
