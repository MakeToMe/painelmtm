"use client";

import { motion } from "framer-motion";
import { ComparisonTable } from "./comparison-table";

export function BackendSection() {
  return (
    <section id="backend" className="py-24 relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-emerald-950/30" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-emerald-500">
            Backend para NoCode
          </h2>
          <p className="text-gray-400 text-lg mt-4">
            Compare nossos recursos e descubra a melhor solução para seu projeto
          </p>
        </motion.div>

        <div className="relative w-full">
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[768px] w-full">
              <ComparisonTable />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}