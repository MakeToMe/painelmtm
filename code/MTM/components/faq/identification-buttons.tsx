interface IdentificationButtonsProps {
  onIdentificationChoice: (choice: 'IDENTIFICADO' | 'ANÔNIMO') => void;
  className?: string;
}

export function IdentificationButtons({ onIdentificationChoice, className = '' }: IdentificationButtonsProps) {
  return (
    <div className={`flex flex-col chat:flex-row gap-2 ${className}`}>
      <button
        onClick={() => onIdentificationChoice('IDENTIFICADO')}
        className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg border border-emerald-500/10 transition-colors duration-200"
      >
        IDENTIFICADO
      </button>
      <button
        onClick={() => onIdentificationChoice('ANÔNIMO')}
        className="flex-1 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 rounded-lg border border-zinc-700/50 transition-colors duration-200"
      >
        ANÔNIMO
      </button>
    </div>
  );
}
