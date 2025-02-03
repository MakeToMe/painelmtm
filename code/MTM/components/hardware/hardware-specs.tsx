"use client";

import { motion } from "framer-motion";

export function HardwareSpecs() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 rounded-xl" />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-emerald-500/20"
      >
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-emerald-500 mb-4">
              Especificações Técnicas
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Servidores a partir de 1 núcleos e 2 GB de RAM
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                CPU dedicada em conjunto com CPU compartilhada
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Memória RAM DDR4 em todas as VMS
              </li>
            </ul>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-emerald-500 mb-4">
              Recursos Adicionais
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Provisionamento em 60 segundos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Upgrade com um clique
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Dashboard de monitoramento em tempo real
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}