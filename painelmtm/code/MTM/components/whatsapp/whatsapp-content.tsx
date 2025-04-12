"use client";

import { motion } from "framer-motion";

export function WhatsAppContent() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-4xl font-bold">
          <span className="text-emerald-500">Superbônus</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            API de WhatsApp
          </span>
        </h2>
        <p className="text-xl text-gray-300 leading-relaxed">
          Aproveite o poder do maior mensageiro do mundo e transforme a forma como você se comunica com seus clientes e equipe.
        </p>
      </div>

      <div className="space-y-6">
        <p className="text-gray-400 leading-relaxed">
          Com a API de WhatsApp da Make To Me, você tem uma ferramenta robusta e flexível que pode levar seu negócio a um novo nível de eficiência e alcance.
        </p>

        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
          <p className="text-gray-300">
            A Make To Me oferece{" "}
            <span className="text-emerald-400 font-semibold">gratuitamente</span>{" "}
            em todos os planos contratados uma poderosa API de WhatsApp com capacidade para até{" "}
            <span className="text-emerald-400 font-semibold">50 conexões simultâneas</span>{" "}
            e{" "}
            <span className="text-emerald-400 font-semibold">disparos ilimitados</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}