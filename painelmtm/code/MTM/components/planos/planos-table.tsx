'use client';

import { motion } from "framer-motion";
import { Plano } from '@/lib/supabase/planos';
import { Cloud, CircuitBoard, Brain, Settings } from 'lucide-react';

interface PlanosTableProps {
  planos: Plano[];
}

export function PlanosTable({ planos }: PlanosTableProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Sob consulta';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getIcon = (nome: string) => {
    const iconProps = { size: 24, className: "text-emerald-500" };
    
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

  // Extrair todas as features únicas dos planos
  const features = planosOrdenados.reduce((acc: string[], plano) => {
    if (!plano.descrição) return acc;
    const planoFeatures = plano.descrição.split('-').map(f => f.trim()).filter(Boolean);
    planoFeatures.forEach(feature => {
      if (!acc.includes(feature)) {
        acc.push(feature);
      }
    });
    return acc;
  }, []);

  return (
    <div className="w-full overflow-x-auto relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr>
            <th className="p-4 border-b border-zinc-800"></th>
            {planosOrdenados.map((plano) => (
              <th key={plano.uid} className="p-4 border-b border-zinc-800">
                <div className="flex flex-col items-center gap-2">
                  {getIcon(plano.nome)}
                  <span className="text-lg font-semibold text-white">{plano.nome}</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(plano.valor)}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-zinc-800/20' : ''}>
              <td className="p-4 border-b border-zinc-800/50 font-medium text-zinc-300">
                {feature}
              </td>
              {planosOrdenados.map((plano) => {
                const planoFeatures = plano.descrição?.split('-').map(f => f.trim()) || [];
                const hasFeature = planoFeatures.includes(feature);
                
                return (
                  <td key={plano.uid} className="p-4 border-b border-zinc-800/50 text-center">
                    {hasFeature ? (
                      <span className="text-emerald-500">✓</span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
