"use client";

import { motion } from "framer-motion";
import { Globe, Box, Server, RefreshCcw, MessageSquare, AlertCircle } from "lucide-react";

const features = [
  {
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    title: "Gerenciamento das zonas de DNS por API",
    description: (
      <span>
        Crie, edite, defina parâmetros e demais detalhes dos subdomínios
        <sup className="text-amber-400 ml-1">1</sup>
      </span>
    )
  },
  {
    icon: <Box className="w-6 h-6 text-emerald-400" />,
    title: "Deploy simplificado na sua VPS",
    description: (
      <span>
        Suba seus aplicativos preferidos facilmente. Escolha o App, preencha as variáveis realize deploy com um clique
        <sup className="text-amber-400 ml-1">2</sup>
      </span>
    )
  },
  {
    icon: <Server className="w-6 h-6 text-emerald-400" />,
    title: "Gerenciamento remoto de recursos",
    description: (
      <span>
        Gerencie os recursos do seu servidor programaticamente, e realize a manutenção necessária de forma facilitada
        <sup className="text-amber-400 ml-1">3</sup>
      </span>
    )
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-emerald-400" />,
    title: "Atualizações via API",
    description: "Atualize seus aplicativos já instalados alterando as variáveis de ambiente e realizando deploy por meio de chamadas de API"
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
    title: "Gestão de WhatsApp",
    description: "Crie e gerencie instâncias e sessões de WhatsApp, monitore o estado de sincronização e realize a gestão completa por meio de um dashboard simplificado"
  },
  {
    icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
    title: "Informações Importantes",
    description: (
      <div className="space-y-2">
        <p>1. Para gerenciar as zonas de DNS pelo dashboard é necessário ter um domínio ativo na Cloudflare.</p>
        <p>2. Alguns aplicativos exigem configurações extras e que dependem dos serviços de terceiros, tais como chaves de API que devem ser informadas pelo usuário.</p>
        <p>3. Todo gerenciamento remoto de servidores, incluindo deploy de aplicativos, é realizado por meio de um agente que fica instalado no servidor.</p>
      </div>
    )
  }
];

export function APIFeatures() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-emerald-500/50 transition-all duration-300 ${
                index === features.length - 1 ? 'w-full' : 'w-full md:w-[calc(50%-12px)]'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-zinc-700/50 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-white">
                  {feature.title}
                </h3>
              </div>
              <div className="text-gray-400 leading-relaxed">
                {feature.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}