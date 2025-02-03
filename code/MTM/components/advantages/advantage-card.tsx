"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AdvantageCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export function AdvantageCard({ icon: Icon, title, description, index }: AdvantageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-emerald-500/50 transition-all duration-300"
    >
      <div className="mb-4">
        <Icon className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="text-emerald-500 text-lg font-semibold mb-3">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}