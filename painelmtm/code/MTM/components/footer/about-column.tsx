"use client";

import { motion } from "framer-motion";

export function AboutColumn() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-emerald-500">Sobre Nós</h3>
      <div className="space-y-4 text-gray-400">
        <p>
          A Make To Me é uma plataforma inovadora que simplifica a implantação e gerenciamento 
          de aplicações em nuvem, permitindo que empresas foquem no que realmente importa: 
          seu crescimento e sucesso.
        </p>
        <p>
          Nossa missão é democratizar o acesso à tecnologia de ponta, oferecendo soluções 
          que combinam facilidade de uso com poder e flexibilidade.
        </p>
      </div>
    </motion.div>
  );
}