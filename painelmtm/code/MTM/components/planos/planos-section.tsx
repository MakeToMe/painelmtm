'use client';

import { motion } from "framer-motion";
import { Plano } from '@/lib/supabase/planos';
import { Cloud, CircuitBoard, Brain, Settings } from 'lucide-react';

interface PlanosSectionProps {
  planos: Plano[];
}

export function PlanosSection({ planos }: PlanosSectionProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Sob consulta';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getIcon = (nome: string) => {
    const iconProps = { size: 32, className: "text-emerald-500" };
    
    switch (nome.toLowerCase()) {
      case 'cloud self-service':
        return <Cloud {...iconProps} />;
      case 'basic':
        return <CircuitBoard {...iconProps} />;
      case 'inteligência artificial':
        return <Brain {...iconProps} />;
      case 'personalizado':
        return <Settings {...iconProps} />;
      default:
        return <CircuitBoard {...iconProps} />;
    }
  };

  const formatDescription = (description: string) => {
    if (!description) return '';
    return description.split('-').map((item, index) => {
      const text = item.trim();
      if (!text) return null;
      if (index === 0) return <span key={index} className="block mb-2">{text}</span>;
      return <span key={index} className="block mb-2">-{text}</span>;
    });
  };

  // Ordenar planos
  const planosOrdenados = [...planos].sort((a, b) => {
    const ordem = [
      'Cloud Self-Service',
      'Basic',
      'Inteligência Artificial',
      'Personalizado'
    ];
    return ordem.indexOf(a.nome) - ordem.indexOf(b.nome);
  });

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-center gap-8">
        {planosOrdenados.map((plano) => (
          <motion.div
            key={plano.uid}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] min-w-[300px] max-w-[340px]"
          >
            <div className="h-full flex flex-col bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group">
              <div className="flex flex-col h-full p-6">
                <div className="flex-1">
                  <div className="flex flex-col items-center gap-4 mb-6 pt-2">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        {getIcon(plano.nome)}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white">{plano.nome}</h3>
                    </div>
                  </div>

                  <div className="flex justify-center mb-6">
                    <span className="text-3xl font-bold text-emerald-400">
                      {formatCurrency(plano.valor)}
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="text-zinc-400 text-left space-y-2">
                      {formatDescription(plano.descrição)}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                    Selecionar plano
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
