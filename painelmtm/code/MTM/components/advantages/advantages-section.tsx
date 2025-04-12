"use client";

import { motion } from "framer-motion";
import { advantages } from "./advantages-data";
import { AdvantageCard } from "./advantage-card";

export function AdvantagesSection() {
  return (
    <section id="vantagens" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-emerald-500">
            Principais vantagens
          </h2>
          <p className="text-gray-400 text-lg mt-4">
          Descubra por que nossa plataforma é a escolha ideal para o seu negócio, com soluções rápidas, seguras e de fácil implementação.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <AdvantageCard
              key={advantage.title}
              icon={advantage.icon}
              title={advantage.title}
              description={advantage.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}