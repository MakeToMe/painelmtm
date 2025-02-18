import { supabase } from '@/lib/supabase';
import { AppData } from '@/types/app-data';

export async function getAppData(): Promise<AppData[]> {
  const { data, error } = await supabase
    .from('list_apps')
    .select('*')
    .order('ordem');

  if (error) {
    console.error('Erro ao buscar apps:', error);
    return [];
  }

  return data || [];
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
    icone: data.icone
  };
}