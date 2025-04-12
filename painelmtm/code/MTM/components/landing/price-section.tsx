'use client';

import { motion } from "framer-motion";
import { Cloud, Check } from 'lucide-react';
import Link from 'next/link';

export function PriceSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/0 via-emerald-500/5 to-zinc-900/0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4"
          >
            Comece gratuitamente
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto"
          >
            Experimente o poder da automação sem custos. Sem cartão de crédito, sem compromissos.
          </motion.p>
        </div>

        {/* Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[128px] rounded-full pointer-events-none" />
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Cloud size={32} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">Cloud Self-Service</h3>
                  <p className="text-emerald-400 font-medium">Gratuito para sempre</p>
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300">Acesso ao painel de controle</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300">Automação de processos básicos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300">Integração com sistemas populares</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300">Suporte da comunidade</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300">Documentação completa</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300">Atualizações gratuitas</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link 
                  href="/backend"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-medium rounded-xl transition-colors duration-200"
                >
                  Começar agora
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
