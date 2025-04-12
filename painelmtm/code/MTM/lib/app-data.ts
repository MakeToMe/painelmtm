import { generateSlug } from './utils';

// Exportar interface AppData
export interface AppData {
  id: string;
  uid: string;
  name: string;
  url: string;
  docsUrl: string;
  logo: string;
  nome?: string;
  descricao?: string;
  categoria?: string;
  plano?: string;
  preco?: number;
  ordem?: number;
  icone?: string;
  slug?: string;
  faq?: string;
}

const apps: AppData[] = [
  {
    id: 'supabase',
    uid: '3050e4e4-6e8f-4037-af94-711c42be7c9f',
    name: 'Supabase',
    url: 'https://supabase.com',
    docsUrl: 'https://supabase.com/docs',
    logo: 'https://raw.githubusercontent.com/supabase/supabase/master/packages/config/logos/supabase-logo.svg'
  },
  {
    id: 'n8n',
    uid: '01a14221-e146-4737-88a4-41fca8e7a79a',
    name: 'n8n',
    url: 'https://n8n.io',
    docsUrl: 'https://docs.n8n.io',
    logo: 'https://n8n.io/favicon.ico'
  },
  {
    id: 'rabbitmq',
    uid: '150acd3a-aba0-4f83-96f6-075da3226cca',
    name: 'RabbitMQ',
    url: 'https://www.rabbitmq.com',
    docsUrl: 'https://www.rabbitmq.com/documentation.html',
    logo: 'https://www.rabbitmq.com/img/logo-rabbitmq.svg'
  },
  {
    id: 'metabase',
    uid: '286f31db-45ef-4c2e-92f8-2d47de57f37d',
    name: 'Metabase',
    url: 'https://www.metabase.com',
    docsUrl: 'https://www.metabase.com/docs',
    logo: 'https://www.metabase.com/images/logo.svg'
  },
  {
    id: 'minio-s3',
    uid: 'c57884be-17e5-42d6-adb7-2db96b271647',
    name: 'Minio S3',
    url: 'https://min.io',
    docsUrl: 'https://min.io/docs/minio/linux/reference/minio-cli.html',
    logo: 'https://min.io/resources/img/logo/MINIO_wordmark.png'
  },
  {
    id: 'uptime-kuma',
    uid: '2aa4b5f7-a52b-41eb-86ce-7fb5deebe840',
    name: 'Uptime Kuma',
    url: 'https://github.com/louislam/uptime-kuma',
    docsUrl: 'https://github.com/louislam/uptime-kuma/wiki',
    logo: 'https://raw.githubusercontent.com/louislam/uptime-kuma/master/public/icon.svg'
  }
];

const aiApps: AppData[] = [
  {
    id: 'flowise',
    uid: '245a482a-af57-4aac-b25c-0cf5f876452d',
    name: 'Flowise',
    url: 'https://flowise.com',
    docsUrl: 'https://flowise.com/docs',
    logo: 'https://docs.flowiseai.com/img/flowise.png'
  },
  {
    id: 'zep-memory',
    uid: 'd391982c-d416-4f4a-b190-bb72030f18d8',
    name: 'ZEP Memory',
    url: 'https://zep.com/memory',
    docsUrl: 'https://zep.com/memory/docs',
    logo: 'https://zep.ai/images/zep-dark.svg'
  },
  {
    id: 'pgvector',
    uid: '62572824-a32d-4832-b096-a7de735c473c',
    name: 'PgVector',
    url: 'https://pgvector.com',
    docsUrl: 'https://pgvector.com/docs',
    logo: 'https://github.com/pgvector/pgvector/raw/master/docs/logo.png'
  },
  {
    id: 'typebot',
    uid: '3180c1ee-2b09-4b06-9830-81319ed2a96b',
    name: 'Typebot',
    url: 'https://typebot.io',
    docsUrl: 'https://typebot.io/docs',
    logo: 'https://docs.typebot.io/img/logo.svg'
  },
  {
    id: 'rag',
    uid: '549de903-9b4a-423c-8a52-387db6274087',
    name: 'RAG',
    url: 'https://rag.com',
    docsUrl: 'https://rag.com/docs',
    logo: 'https://raw.githubusercontent.com/langchain-ai/langchain/master/docs/static/img/langchain_rag_light.png'
  }
];

// Exportar as listas de apps
export { apps, aiApps };

export function getAppData(idOrUid: string): AppData | null {
  const allApps = [...apps, ...aiApps];
  const app = allApps.find(app => app.id === idOrUid || app.uid === idOrUid);
  return app || null;
}

export function getAppDataBySlug(slug: string): AppData | undefined {
  // Procura em apps
  const app = apps.find(app => generateSlug(app.name) === slug);
  if (app) return app;

  // Procura em aiApps
  const aiApp = aiApps.find(app => generateSlug(app.name) === slug);
  if (aiApp) return aiApp;

  return undefined;
}
