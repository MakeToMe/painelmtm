'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { PlanosSection } from './planos-section';
import { PlanosTable } from './planos-table';
import { Plano } from '@/lib/supabase/planos';
import { LayoutGrid, Table } from 'lucide-react';

interface PlanosToggleProps {
  planos: Plano[];
}

export function PlanosToggle({ planos }: PlanosToggleProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  return (
    <section className="py-20 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Nossos Planos
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Escolha o plano ideal para o seu negócio
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <LayoutGrid size={20} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <Table size={20} />
              <span>Tabela</span>
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'cards' ? (
            <PlanosSection planos={planos} />
          ) : (
            <div className="w-full max-w-[1800px] mx-auto px-4">
              <PlanosTable planos={planos} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
