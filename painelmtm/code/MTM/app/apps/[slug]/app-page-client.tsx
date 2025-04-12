"use client";

import { AppData } from "@/lib/app-data";
import { AppDescription } from "@/types/app-description";
import { useEffect, useState } from "react";
import { getAppDescription } from "@/lib/supabase/app-descriptions";
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AtomicOrbital } from '@/components/ui/atomic-orbital';
import Image from 'next/image';
import { FAQSection } from '@/components/apps/faq-section';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AppPageClientProps {
  app: AppData;
}

export function AppPageClient({ app }: AppPageClientProps) {
  const [description, setDescription] = useState<AppDescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!app?.uid) {
      console.error('No app UID available');
      setIsLoading(false);
      return;
    }

    async function loadDescription(showLoading = true) {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      try {
        console.log('Loading description for app:', app);
        const desc = await getAppDescription(app.uid);
        console.log('Description loaded:', desc);
        
        if (!desc) {
          console.error('No description found for app:', app.uid);
          setIsLoading(false);
          return;
        }
        
        setDescription(desc);
      } catch (error) {
        console.error('Error loading description:', error);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    }

    loadDescription();
  }, [app]);

  const handleRefresh = () => {
    loadDescription(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    );
  }

  if (!description) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">App não encontrado</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-x-hidden">
      <AtomicOrbital />
      
      <main className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Container principal usando flexbox */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Coluna da esquerda - Logo e Resumo */}
            <div className="flex-1 min-w-0 lg:max-w-xl">
              {/* Cabeçalho com logo e título */}
              <div className="mb-8">
                <div className="flex items-start gap-6">
                  {description.icone && (
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-800/50 flex items-center justify-center">
                      <img 
                        src={description.icone} 
                        alt={description.nome}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{description.nome}</h1>
                    <p className="text-zinc-400">
                      Totalmente gerenciado por Make To Me
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumo */}
              {description.resumo && (
                <div className="mb-6">
                  <p className="text-zinc-300 text-lg leading-relaxed">
                    {description.resumo}
                  </p>
                </div>
              )}

              {/* Categoria */}
              {description.categoria && (
                <div className="mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Categoria:</span>
                    <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-zinc-300">
                      {description.categoria}
                    </span>
                  </div>
                </div>
              )}

              {/* Call to action */}
              <div className="flex gap-4 mb-8">
                <Link 
                  href={app.url || '#'}
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  Implantar {description.nome}
                </Link>
                {app.faq && (
                  <button
                    onClick={() => {
                      const faqSection = document.getElementById('faq');
                      if (faqSection) {
                        faqSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                  >
                    FAQ
                  </button>
                )}
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="icon"
                  disabled={isRefreshing}
                  className="bg-card border-border/30 hover:bg-muted/10 focus:bg-muted/10 rounded-md shadow-inner btn-neomorphic"
                  title="Atualizar dados"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-primary" />
                  )}
                </Button>
              </div>
            </div>

            {/* Coluna da direita - Imagem */}
            <div className="lg:flex-1">
              <div className="rounded-lg overflow-hidden">
                {description.imagem ? (
                  <img 
                    src={description.imagem} 
                    alt={description.nome}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    <span className="text-zinc-600">Sem imagem</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Descrição detalhada */}
          {description.descricao && (
            <div className="mt-12">
              <div className="bg-zinc-800/50 rounded-lg p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Descrição</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-zinc-300 text-lg whitespace-pre-wrap break-words">
                    {description.descricao}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {app.faq && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              id="faq"
              className="mt-16"
            >
              {console.log('FAQ content being passed:', app.faq)}
              <FAQSection faqText={app.faq} />
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
