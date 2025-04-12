"use client";

import { motion } from "framer-motion";

const features = [
  { name: "Largura de banda", xano: "100 GB", makeToMe: "2000 GB" },
  { name: "Database SSD Storage", xano: "10 GB", makeToMe: "25 GB" },
  { name: "File Storage", xano: "50 GB", makeToMe: "1 TB" },
  { name: "File Upload Limit", xano: "2 GB", makeToMe: "50 GB" },
  { name: "Automação de Tarefas", xano: "Lambdas (Javascript)", makeToMe: "Edge Functions (Deno)" },
  { name: "Microserviços Docker", xano: "Apenas Enterprise", makeToMe: "Sim" },
  { name: "Realtime", xano: "Necessita SDK", makeToMe: "Nativo" },
  { name: "Investimento", xano: "USD 225", makeToMe: "USD 90" },
];

export function ComparisonTable() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <table className="w-full border-collapse bg-zinc-800/50 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-zinc-700/50">
            <th className="p-6 text-left text-lg font-semibold text-white border-b border-zinc-600 whitespace-nowrap">
              RECURSOS
            </th>
            <th className="p-6 text-center border-b border-zinc-600 whitespace-nowrap">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex flex-col items-center">
                  <img
                    src="https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1717966095724x588310802094912400/logo-xano.png"
                    alt="Xano"
                    className="h-8 object-contain mb-2"
                  />
                  <p className="text-sm text-gray-400">
                    <s>FASTEST</s> NO CODE BACKEND DEV PLATAFORM
                  </p>
                  <span className="text-white font-medium mt-1">XANO SCALE 1X</span>
                </div>
              </div>
            </th>
            <th className="p-6 text-center border-b border-zinc-600 whitespace-nowrap">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src="https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1695688753750x538353941999947460/logo-mtm-engrenagem.png"
                    alt="Make To Me"
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-2xl text-amber-500 font-bold">Make To Me</span>
                </div>
                <span className="text-white font-medium">MAKE TO ME BASIC</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={feature.name}
              className={index % 2 === 0 ? "bg-zinc-800/30" : "bg-zinc-800/50"}
            >
              <td className="p-6 text-left text-white border-b border-zinc-700 whitespace-nowrap">
                {feature.name}
              </td>
              <td className="p-6 text-center text-gray-300 border-b border-zinc-700 whitespace-nowrap">
                {feature.xano}
              </td>
              <td className="p-6 text-center text-gray-300 border-b border-zinc-700 whitespace-nowrap">
                {feature.makeToMe}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}