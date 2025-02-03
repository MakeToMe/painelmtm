import { Suspense } from 'react';
import { AppPageClient } from './app-page-client';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { AppData } from '@/lib/app-data';
import { generateSlug } from '@/lib/utils';

interface AppPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAppBySlug(slug: string): Promise<AppData | null> {
  if (!slug) {
    console.error('Slug is required');
    return null;
  }

  console.log('Fetching app with slug:', slug);

  try {
    const { data, error } = await supabase
      .schema('mtm')
      .from('list_apps')
      .select('*')
      .or(`slug.eq.${slug},slug.eq.${generateSlug(slug)}`)
      .single();

    if (error) {
      console.error('Erro ao buscar app:', error);
      return null;
    }

    if (!data) {
      console.log('No app found with slug:', slug);
      return null;
    }

    console.log('App data found:', data);

    return {
      id: data.uid,
      uid: data.uid,
      name: data.nome,
      url: data.url || '#',
      docsUrl: data.docs_url || '#',
      logo: data.icone || '',
      slug: data.slug || generateSlug(data.nome),
      faq: data.faq || ''
    };
  } catch (error) {
    console.error('Erro ao buscar app:', error);
    return null;
  }
}

export async function generateMetadata({ params }: AppPageProps) {
  const app = await getAppBySlug(params.slug);
  return {
    title: app?.nome ? `${app.nome} - Make To Me` : 'Make To Me',
  };
}

export default async function AppPage({ params }: AppPageProps) {
  const slug = await Promise.resolve(params.slug);
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-emerald-500">Carregando...</div>
        </div>
      }
    >
      <AppPageClient app={app} />
    </Suspense>
  );
}
