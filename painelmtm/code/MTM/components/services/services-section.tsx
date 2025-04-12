"use client";

import { motion } from "framer-motion";
import { APIFeatures } from "@/components/advantages/api-features";

export function ServicesSection() {
  return (
    <section id="servicos" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-emerald-500">
            Principais serviços
          </h2>
          <p className="text-gray-400 text-lg mt-4">
          Gerencie suas VPSs de forma completa e simplificada através de um painel de controle intuitivo. Instale e gerencie aplicativos com facilidade, realizando deploys e configurações sem complicação.
          </p>
        </motion.div>

        <APIFeatures />
      </div>
    </section>
  );
}