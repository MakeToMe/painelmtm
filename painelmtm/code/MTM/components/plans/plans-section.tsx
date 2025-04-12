'use client';

import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useEffect, useState } from 'react';
import { register } from 'swiper/element/bundle';
import { AppData } from '@/types/app-data';
import { getAppData } from '@/lib/supabase/apps';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';

// Declare tipos para o Swiper Elements
declare global {
  interface Window {
    SwiperElementRegisterParams?: (params: string[]) => void;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    'swiper-container': any;
    'swiper-slide': any;
  }
}

const styles = `
  .apps-swiper, .ia-apps-swiper {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    height: 323px;
    padding: 20px 0;
    overflow: visible;
  }

  .apps-swiper swiper-slide, .ia-apps-swiper swiper-slide {
    height: 100%;
    border-radius: var(--swiper-material-slide-border-radius);
    overflow: hidden;
    width: 280px !important;
  }

  .apps-swiper .swiper-material-wrapper, .ia-apps-swiper .swiper-material-wrapper {
    width: 100%;
    height: 100%;
  }

  .apps-swiper .swiper-material-content, .ia-apps-swiper .swiper-material-content {
    width: 100%;
    height: 100%;
  }
`;

export function ModulesSection() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [iaApps, setIaApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    register();

    const loadApps = async () => {
      try {
        const data = await getAppData();
        console.log('Dados recebidos:', data);
        setApps(data.apps);
        setIaApps(data.iaApps);
      } catch (error) {
        console.error('Erro ao carregar apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, []);

  const handleSwiperLoad = (event: any) => {
    const swiper = event.target;
    // Força a atualização do Swiper após o carregamento
    setTimeout(() => {
      swiper.swiper?.update();
    }, 100);
  };

  if (isLoading) {
    return (
      <section id="modulos" className="py-20 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-4 mb-16">
          <div className="text-center">
            <p className="text-gray-400">Carregando módulos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <style>{styles}</style>
      <section id="modulos" className="py-20 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Módulos Disponíveis
            </h2>
            <p className="text-xl text-gray-400">
              Explore nossa biblioteca de módulos prontos para uso
            </p>
          </motion.div>
        </div>

        <div className="apps-container">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Módulos Base
          </h3>
          <swiper-container
            class="apps-swiper"
            slides-per-view="auto"
            centered-slides="true"
            space-between="24"
            navigation="true"
            initial-slide="0"
            onLoad={handleSwiperLoad}
          >
            {apps.map((app) => (
              <swiper-slide key={app.uid}>
                <div className="swiper-material-wrapper">
                  <div className="swiper-material-content">
                    <div className="h-full w-[280px] flex flex-col bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group">
                      <div className="flex flex-col h-full p-6 pb-10">
                        <div className="flex-1">
                          <div className="flex flex-col items-center gap-4 mb-6 pt-2">
                            <div className="w-16 h-16 flex items-center justify-center">
                              {app.icone && (
                                <img 
                                  src={app.icone} 
                                  alt={`Ícone do ${app.nome}`}
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-white">{app.nome}</h3>
                            </div>
                          </div>

                          <div className="flex justify-center mb-6">
                            <span className="px-4 py-2 bg-zinc-800/50 text-emerald-400 text-sm font-medium rounded-full">
                              BASIC
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <div className="flex justify-center">
                            <Link 
                              href={`/apps/${app.slug}`}
                              className="w-full"
                            >
                              <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                                Detalhes
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </swiper-slide>
            ))}
          </swiper-container>

          <h3 className="text-2xl font-bold text-white mb-8 mt-16 text-center">
            Módulos IA
          </h3>
          
          <swiper-container
            class="ia-apps-swiper"
            slides-per-view="auto"
            centered-slides="true"
            space-between="24"
            navigation="true"
            initial-slide="0"
            onLoad={handleSwiperLoad}
          >
            {iaApps.map((app) => (
              <swiper-slide key={app.uid}>
                <div className="swiper-material-wrapper">
                  <div className="swiper-material-content">
                    <div className="h-full w-[280px] flex flex-col bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group">
                      <div className="flex flex-col h-full p-6 pb-10">
                        <div className="flex-1">
                          <div className="flex flex-col items-center gap-4 mb-6 pt-2">
                            <div className="w-16 h-16 flex items-center justify-center">
                              {app.icone && (
                                <img 
                                  src={app.icone} 
                                  alt={`Ícone do ${app.nome}`}
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-white">{app.nome}</h3>
                            </div>
                          </div>

                          <div className="flex justify-center mb-6">
                            <span className="px-4 py-2 bg-zinc-800/50 text-emerald-400 text-sm font-medium rounded-full">
                              IA
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <div className="flex justify-center">
                            <Link 
                              href={`/apps/${app.slug}`}
                              className="w-full"
                            >
                              <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                                Detalhes
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </swiper-slide>
            ))}
          </swiper-container>
        </div>
      </section>
    </LazyMotion>
  );
}