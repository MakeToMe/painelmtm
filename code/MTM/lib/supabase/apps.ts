import { supabase } from '@/lib/supabase';
import { AppData } from '@/types/app-data';

interface AppDataResponse {
  apps: AppData[];
  iaApps: AppData[];
}

export async function getAppData(): Promise<AppDataResponse> {
  try {
    console.log('Buscando apps...');
    
    const { data, error } = await supabase
      .from('list_apps')
      .select('*')
      .order('ordem');

    if (error) {
      console.error('Erro ao buscar apps:', error);
      return { apps: [], iaApps: [] };
    }

    if (!data) {
      console.log('Nenhum app encontrado');
      return { apps: [], iaApps: [] };
    }

    console.log('Total de apps encontrados:', data.length);

    // Separar os apps por plano
    const apps = data.filter(app => app.plano === 'Basic');
    const iaApps = data.filter(app => app.plano === 'IA');

    console.log('Apps Basic:', apps.length);
    console.log('Apps IA:', iaApps.length);

    return { apps, iaApps };
  } catch (error) {
    console.error('Erro inesperado ao buscar apps:', error);
    return { apps: [], iaApps: [] };
  }
}

export async function getAppBySlug(slug: string): Promise<AppData | null> {
  const { data, error } = await supabase
    .from('list_apps')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Erro ao buscar app:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Mapear os dados para o formato esperado pelo AppPageClient
  return {
    id: data.uid,
    uid: data.uid,
    name: data.nome,
    url: data.url || '#',
    docsUrl: data.docs_url || '#',
    logo: data.icone || '',
    nome: data.nome,
    descricao: data.descricao,
    categoria: data.categoria,
    plano: data.plano,
    preco: data.preco,
    ordem: data.ordem,
    icone: data.icone,
    slug: data.slug
  };
}