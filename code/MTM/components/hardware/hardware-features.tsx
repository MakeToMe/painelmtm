"use client";

import { motion } from "framer-motion";
import { Cpu, Gauge, Globe, BarChart, Server } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "DESEMPENHO DE ALTO NÍVEL",
    description: "CPUs AMD EPYC de última geração, com servidores Dell EMC e armazenamento NVMe corporativo Samsung."
  },
  {
    icon: Gauge,
    title: "REDE DE BAIXA LATÊNCIA",
    description: "VMs de alto desempenho com rede de 40 GbE e conectividade privada isolada por VLAN e IPv6 roteado."
  },
  {
    icon: Globe,
    title: "DISPONIBILIDADE GLOBAL",
    description: "Implemente em 12 locais em 4 continentes diferentes, com desempenho elevado, previsível e padronizado."
  },
  {
    icon: BarChart,
    title: "GERENCIAMENTO VISUAL",
    description: "Verifique a saúde dos servidores através de dashboard intuitivo com alertas preventivos."
  },
  {
    icon: Server,
    title: "SERVIDORES DE COMPUTAÇÃO E DE ARMAZENAMENTO",
    description: "Disponibilidade imediata de servidores para computação e para armazenamento, projetados para alto desempenho."
  }
];

export function HardwareFeatures() {
  return (
    <div className="space-y-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex gap-6 group"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300">
                <Icon className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-500 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}