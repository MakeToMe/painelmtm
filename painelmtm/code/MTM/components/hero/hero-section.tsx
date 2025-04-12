"use client";

import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import Link from 'next/link';
import { LoginModal } from '../auth/login-modal';

// Importar o Lottie dinamicamente para evitar problemas de SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function HeroSection() {
  const [animation, setAnimation] = useState<any>(null);
  const isClient = useIsClient();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalState, setModalState] = useState<'login' | 'criarConta'>('criarConta');

  useEffect(() => {
    if (!isClient) return;
    // Carregar o arquivo de animação
    fetch('/deploy-automation.json')
      .then(response => response.json())
      .then(data => setAnimation(data))
      .catch(error => console.error('Error loading animation:', error));
  }, [isClient]);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 min-[1200px]:pt-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Instalar e gerenciar aplicações em nuvem nunca foi tão fácil.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 mb-8"
            >
              Make To Me disponibiliza um painel que simplifica a instalação de aplicações
              que automatizam tarefas e elevam sua produção digital a outro nível.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-400 mb-12"
            >
              Foque no seu negócio, deixe o trabalho de bastidores conosco.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/apps">
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                  Explorar Apps
                </button>
              </Link>
              <button 
                onClick={() => {
                  setModalState('criarConta');
                  setIsLoginModalOpen(true);
                }}
                className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-white font-medium rounded-lg transition-colors"
              >
                Iniciar
              </button>
            </motion.div>
          </div>

          <div className="relative w-full h-[400px] lg:h-[600px]">
            {isClient && animation && (
              <Lottie
                animationData={animation}
                className="w-full h-full"
                loop={true}
              />
            )}
          </div>
        </div>
      </section>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        initialState={modalState}
      />
    </>
  );
}