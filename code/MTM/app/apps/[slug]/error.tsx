'use client'

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro na página:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-emerald-500 mb-4">
          Algo deu errado!
        </h2>
        <p className="text-zinc-400 mb-6">
          Não foi possível carregar os detalhes do aplicativo.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
