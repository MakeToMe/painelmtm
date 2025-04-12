'use client';

import { useEffect } from 'react';
import { register } from 'swiper/element/bundle';
import { ServerIcon } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import '/swipper/slider-material/dist/effect-material.css';

const styles = `
  swiper-container {
    padding: 20px 0;
  }
`;

export function ServersSection() {
  useEffect(() => {
    register();
    
    // Registrar o efeito material
    if (typeof window !== 'undefined' && window.SwiperElementRegisterParams) {
      window.SwiperElementRegisterParams(['materialEffect']);
    }
  }, []);

  return (
    <section className="w-full py-16 bg-zinc-950">
      <div className="container mx-auto">
        <style>{styles}</style>
        <h2 className="text-4xl font-bold text-center mb-12 text-white">Nossos Servidores</h2>
        
        <swiper-container
          effect="material"
          slides-per-view="4.5"
          centered-slides="true"
          material-effect-slide-split-ratio="0.25"
          space-between="24"
          grab-cursor="true"
          loop="true"
          initial-slide="1"
          breakpoints='{
            "320": {
              "slidesPerView": 1.5,
              "spaceBetween": 16
            },
            "600": {
              "slidesPerView": 2.5,
              "spaceBetween": 20
            },
            "1024": {
              "slidesPerView": 4.5,
              "spaceBetween": 24
            }
          }'
          class="w-full max-w-[1200px] mx-auto"
        >
          <swiper-slide>
            <div className="rounded-2xl overflow-hidden h-[600px] bg-[#87CEEB]">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt="Mulher de óculos"
                className="w-full h-full object-cover"
              />
            </div>
          </swiper-slide>

          <swiper-slide>
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50 bg-muted">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/30 dark:bg-emerald-900/30">
                  <ServerIcon className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
            </div>
          </swiper-slide>

          <swiper-slide>
            <div className="rounded-2xl overflow-hidden h-[600px] bg-[#FFA500]">
              <img 
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
                alt="Mulher com chapéu preto"
                className="w-full h-full object-cover"
              />
            </div>
          </swiper-slide>

          <swiper-slide>
            <div className="rounded-2xl overflow-hidden h-[600px] bg-[#800080]">
              <img 
                src="https://images.unsplash.com/photo-1542740348-39501cd6e2b4"
                alt="Mulher com óculos roxos"
                className="w-full h-full object-cover"
              />
            </div>
          </swiper-slide>

          <swiper-slide>
            <div className="rounded-2xl overflow-hidden h-[600px] bg-[#FF0000]">
              <img 
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b"
                alt="Mulher com jaqueta vermelha"
                className="w-full h-full object-cover"
              />
            </div>
          </swiper-slide>
        </swiper-container>
      </div>
    </section>
  );
}
