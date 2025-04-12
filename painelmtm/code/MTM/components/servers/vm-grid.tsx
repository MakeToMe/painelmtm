'use client';

import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useEffect, useState } from 'react';
import { register } from 'swiper/element/bundle';
import { VMData } from '@/types/vm-data';
import { getVMData } from '@/lib/supabase/vms';
import { Server } from 'lucide-react';

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
  .vms-swiper {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    height: 420px;
    padding: 20px 10px;
  }
  .vms-swiper swiper-slide {
    height: 100%;
    border-radius: var(--swiper-material-slide-border-radius);
    overflow: hidden;
    width: 300px !important;
  }
  .vms-swiper .swiper-material-wrapper {
    width: 100%;
    height: 100%;
  }
  .vms-swiper .swiper-material-content {
    width: 100%;
    height: 100%;
  }
`;

export function VMGrid() {
  const [vms, setVMs] = useState<VMData[]>([]);

  useEffect(() => {
    register();

    // Buscar VMs
    getVMData().then(data => {
      console.log('VMs carregadas:', data);
      setVMs(data);
    });

    // Configuração do Swiper
    const swiperEl = document.querySelector('.vms-swiper');
    if (swiperEl) {
      Object.assign(swiperEl, {
        slidesPerView: 4.5,
        spaceBetween: 16,
        centeredSlides: true,
        grabCursor: true,
        initialSlide: 1,
        loop: false, // Desativando o loop para evitar o aviso
        breakpoints: {
          320: {
            slidesPerView: 1.5,
            spaceBetween: 12
          },
          600: {
            slidesPerView: 2.5,
            spaceBetween: 14
          },
          1024: {
            slidesPerView: 3.5, // Reduzindo para evitar slides vazios
            spaceBetween: 16
          }
        }
      });
      swiperEl.initialize();
    }
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative py-8 overflow-hidden" id="plano-vms">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <p className="text-zinc-400 max-w-2xl">
              Explore nossa seleção de máquinas virtuais otimizadas para diferentes cargas de trabalho. Cada VM foi configurada para oferecer o melhor desempenho e custo-benefício.
            </p>
          </motion.div>

          <div className="relative px-2">
            <style>{styles}</style>
            
            <swiper-container 
              class="vms-swiper"
              slides-per-view="auto"
              space-between="16"
              grab-cursor="true"
              loop="false"
              initial-slide="0"
              breakpoints='{
                "320": {
                  "slidesPerView": "auto",
                  "spaceBetween": 12
                },
                "600": {
                  "slidesPerView": "auto",
                  "spaceBetween": 14
                },
                "1024": {
                  "slidesPerView": "auto",
                  "spaceBetween": 16
                }
              }'
            >
              {vms.map((vm, index) => (
                <swiper-slide key={vm.uid || `vm-${index}`}>
                  <div className="swiper-material-wrapper">
                    <div className="swiper-material-content">
                      <div className="h-full w-[300px] flex flex-col p-6 bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-xl font-semibold text-white">{vm.nome}</h3>
                          </div>

                          <div className="space-y-2 text-zinc-400">
                            <div className="flex items-center justify-between">
                              <span>vCPU</span>
                              <span className="font-medium">{vm.vcpu}</span>
                            </div>
                            {vm.core && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="max-[850px]:hidden">OBS</span>
                                <span className="font-medium text-zinc-500">{vm.core}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span>RAM</span>
                              <span className="font-medium">{vm.ram}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>NVMe</span>
                              <span className="font-medium">{vm.nvme}</span>
                            </div>
                            {vm.banda && (
                              <div className="flex items-center justify-between">
                                <span>Banda</span>
                                <span className="font-medium">{vm.banda}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2">
                            <div className="flex items-baseline gap-1 text-2xl font-bold text-emerald-500">
                              ${vm.usd.toFixed(2)}
                            </div>
                          </div>

                          <button className="mt-4 w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors duration-200">
                            Selecionar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </swiper-slide>
              ))}
            </swiper-container>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
