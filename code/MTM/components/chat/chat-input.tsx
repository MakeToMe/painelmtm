'use client';

import { useState } from 'react';
import { VisitorStorage } from '@/lib/storage/visitor-storage';
import { sendVisitorMessage } from '@/lib/services/visitor-service';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Verifica o UID do visitante
      const visitorStorage = new VisitorStorage();
      const uid = await visitorStorage.getVisitorUID();

      // Envia a mensagem para o webhook
      const response = await sendVisitorMessage(message, uid);

      // Se for primeira visita e receber um novo UID no response, salva
      if (response.uid && !uid) {
        await visitorStorage.saveVisitorUID(response.uid);
      }

      // Limpa o campo de mensagem
      setMessage('');
      
      // Aqui você pode adicionar a lógica para exibir a mensagem no chat
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
        className="w-full px-4 py-2 bg-zinc-800/30 rounded-lg pr-12"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
      >
        <svg 
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 12l20-9L12 12l10 9L2 12z" />
        </svg>
      </button>
    </form>
  );
}
