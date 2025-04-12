"use client";

import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800/50">
      <div className="flex flex-col chat:flex-row gap-2 chat:gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isLoading ? "Aguardando escolha..." : "Digite sua mensagem..."}
          className={`flex-1 border rounded-xl px-4 py-3 text-gray-200 transition-colors ${
            isLoading 
              ? 'bg-zinc-800/20 border-zinc-800/50 placeholder-gray-600 cursor-not-allowed' 
              : 'bg-zinc-800/50 border-zinc-700/50 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50'
          }`}
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`${
            isLoading 
              ? 'bg-emerald-500/5 text-emerald-500/50 cursor-not-allowed' 
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
          } py-3 px-4 rounded-xl transition-colors duration-300 border border-emerald-500/10 flex items-center justify-center gap-2`}
          disabled={isLoading}
        >
          <span className="chat:hidden">Enviar</span>
          <Send className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </form>
  );
}