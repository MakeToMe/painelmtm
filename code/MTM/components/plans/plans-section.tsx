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
    padding: 20px 10px;
  }
  .apps-swiper swiper-slide, .ia-apps-swiper swiper-slide {
    height: 100%;
    border-radius: var(--swiper-material-slide-border-radius);
    overflow: hidden;
    width: 300px !important;
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

export function PlansSection() {
  const [basicApps, setBasicApps] = useState<AppData[]>([]);
  const [iaApps, setIaApps] = useState<AppData[]>([]);

  useEffect(() => {
    register();

    // Buscar apps
    getAppData().then(data => {
      console.log('Todos os apps carregados:', data);
      const basic = data.filter(app => app.plano === 'Basic');
      const ia = data.filter(app => app.plano === 'IA');
      console.log('Apps Basic:', basic);
      console.log('Apps IA:', ia);
      setBasicApps(basic);
      setIaApps(ia);
    });

    // Configuração dos Swipers
    const basicSwiperEl = document.querySelector('.apps-swiper');
    const iaSwiperEl = document.querySelector('.ia-apps-swiper');

    const swiperConfig = {
      slidesPerView: 'auto',
      spaceBetween: 20,
      centeredSlides: true,
      grabCursor: true,
      initialSlide: 1,
      loop: true,
      breakpoints: {
        320: {
          slidesPerView: 1.5,
          spaceBetween: 10
        },
        600: {
          slidesPerView: 2.5,
          spaceBetween: 15
        },
        1024: {
          slidesPerView: 3.5,
          spaceBetween: 20
        }
      }
    };

    if (basicSwiperEl) {
      Object.assign(basicSwiperEl, swiperConfig);
      basicSwiperEl.initialize();
    }

    if (iaSwiperEl) {
      Object.assign(iaSwiperEl, swiperConfig);
      iaSwiperEl.initialize();
    }
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <section id="planos" className="relative py-16 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Apps do Módulo Basic
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore nossa seleção de aplicativos essenciais para o seu negócio. Cada aplicativo foi cuidadosamente escolhido para oferecer o máximo de funcionalidade e eficiência.
            </p>
          </motion.div>
        </div>

        <div className="relative px-2">
          <style>{styles}</style>
          
          <swiper-container className="apps-swiper">
            {basicApps.map((app) => (
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
                              {app.categoria}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <div className="flex justify-center">
                            <Link 
                              href={`/apps/${app.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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

        {/* Seção de Apps de IA */}
        <div className="w-full max-w-[1200px] mx-auto px-4 mt-24 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Apps do Módulo de Inteligência Artificial
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore nossa seleção de aplicativos de IA projetados para otimizar seus processos e impulsionar a inovação em seu negócio. Cada solução foi desenvolvida para trazer mais inteligência e automação para suas operações.
            </p>
          </motion.div>
        </div>

        <div className="relative px-2">
          <swiper-container className="ia-apps-swiper">
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
                              {app.categoria}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <div className="flex justify-center">
                            <Link 
                              href={`/apps/${app.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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