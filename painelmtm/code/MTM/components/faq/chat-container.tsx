"use client";

import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { IdentificationButtons } from "./identification-buttons";
import { useVisitorId } from "@/hooks/useVisitorId";
import { User } from "lucide-react";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
  showIdentification?: boolean;
}

interface ChatContainerProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatContainer({ messages, onSend, isLoading = false }: ChatContainerProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { visitorState, saveVisitorData } = useVisitorId();
  const [awaitingIdentification, setAwaitingIdentification] = useState(false);

  // Verifica se há alguma mensagem mostrando os botões de identificação
  const showingIdentificationButtons = messages.some(msg => msg.showIdentification);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Atualiza o estado quando os botões são mostrados
    setAwaitingIdentification(showingIdentificationButtons);
  }, [showingIdentificationButtons]);

  const handleIdentificationChoice = async (choice: 'IDENTIFICADO' | 'ANÔNIMO') => {
    try {
      const response = await fetch('https://rarwhk.rardevops.com/webhook/visitante', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'verificarId',
          user: choice
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao verificar identificação');
      }

      const data = await response.json();
      
      if (data.uid) {
        await saveVisitorData(data.uid, choice === 'IDENTIFICADO');
        setAwaitingIdentification(false);
      }
    } catch (error) {
      console.error('Error handling identification:', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 overflow-hidden">
      <ChatHeader />
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-1 space-y-4 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 scrollbar-corner-zinc-800"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 ${
              message.isUser ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {!message.isUser ? (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <video
                  src="https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1734894816871x723590672066902500/avatar_mtm.mp4"
                  className="w-full h-full object-cover"
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  playsInline={true}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-500" />
              </div>
            )}
            <div
              className={`p-3 relative ${
                message.isUser
                  ? "bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 rounded-l-lg rounded-br-lg"
                  : "bg-zinc-800/20 backdrop-blur-sm text-gray-100 rounded-r-lg rounded-bl-lg"
              } max-w-[80%]`}
            >
              <p className="whitespace-pre-line">{message.content.replace(/\\n/g, '\n')}</p>
              {!message.isUser && message.showIdentification && (
                <IdentificationButtons 
                  onIdentificationChoice={handleIdentificationChoice}
                  className="mt-4"
                />
              )}
              <p className={`text-xs mt-1 ${
                message.isUser ? "text-emerald-100" : "text-gray-400"
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      <ChatInput onSend={onSend} isLoading={isLoading || awaitingIdentification} />
    </div>
  );
}