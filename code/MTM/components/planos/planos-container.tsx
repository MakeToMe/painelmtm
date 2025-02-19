'use client';

import { useEffect, useState } from 'react';
import { Plano, getPlanos } from '@/lib/supabase/planos';
import { PlanosToggle } from './planos-toggle';

export function PlanosContainer() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlanos = async () => {
      try {
        const data = await getPlanos();
        setPlanos(data);
      } catch (err) {
        console.error('Erro ao carregar planos:', err);
        setError('Erro ao carregar planos');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanos();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full py-20">
        <div className="text-center">
          <p className="text-gray-400">Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return <PlanosToggle planos={planos} />;
}
