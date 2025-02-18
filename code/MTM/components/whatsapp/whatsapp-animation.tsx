"use client";

import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useIsClient } from "@/hooks/use-is-client";

// Importar o Lottie dinamicamente para evitar problemas de SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function WhatsAppAnimation() {
  const [animationData, setAnimationData] = useState(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    fetch("https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1719279151632x461249609419101440/chatbot-black.json")
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error("Error loading animation:", error));
  }, [isClient]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5 rounded-3xl blur-xl" />
      
      {/* Lottie animation container */}
      <div className="relative bg-zinc-900/30 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/20">
        {isClient && animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            className="w-full h-auto max-w-lg mx-auto"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
              progressiveLoad: true,
              hideOnTransparent: true,
              filterSize: {
                width: '200%',
                height: '200%',
                x: '-50%',
                y: '-50%',
              },
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
          />
        )}
      </div>
    </motion.div>
  );
}