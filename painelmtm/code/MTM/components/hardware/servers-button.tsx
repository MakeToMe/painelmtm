"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Server } from "lucide-react";
import dynamic from "next/dynamic";

const ServersModal = dynamic(() => import("./servers-modal"), {
  ssr: false
});

export function ServersButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mt-12"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-6 py-3 rounded-xl transition-colors duration-300 border border-emerald-500/10"
        >
          <Server className="w-5 h-5" />
          <span>SERVIDORES DISPONÍVEIS</span>
        </button>
      </motion.div>

      <ServersModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}