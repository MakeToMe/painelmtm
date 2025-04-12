"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChatContainer } from "./chat-container";
import { VisitorStorage } from "@/lib/storage/visitor-storage";
import { sendVisitorMessage } from "@/lib/services/visitor-service";
import { getChatHistory, ChatMessage as DBChatMessage } from "@/lib/supabase/chat";
import { supabase } from "@/lib/supabase";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
  showIdentification?: boolean;
}

export function FAQSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Carregar histórico de mensagens e configurar realtime
  useEffect(() => {
    const loadChatHistory = async () => {
      const visitorStorage = new VisitorStorage();
      const uid = await visitorStorage.getVisitorUID();
      
      if (uid) {
        setCurrentChatId(uid);
        const history = await getChatHistory(uid);
        
        // Conta quantas mensagens são do assistente
        const assistantMessages = history.filter(msg => msg.sender === 'Assistente');
        
        const formattedMessages = history.map(msg => ({
          content: msg.mensagem,
          isUser: msg.sender === 'Visitante',
          timestamp: msg.created_at, // O timestamp já vem formatado do banco
          // Mostra os botões se for a única mensagem do assistente
          showIdentification: msg.sender === 'Assistente' && assistantMessages.length === 1
        }));
        
        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        } else {
          // Mensagem inicial quando não há histórico
          setMessages([{
            content: "Olá! Como posso ajudar você hoje?",
            isUser: false,
            timestamp: new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            showIdentification: false // Não deve mostrar botões quando não há histórico
          }]);
        }

        // Configura o realtime apenas se tiver um chat_id
        const channel = supabase
          .channel('chat_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'mtm',
              table: 'chat_faq',
              filter: `chat_id=eq.${uid}`
            },
            async (payload) => {
              console.log('Realtime update:', payload);
              
              if (payload.eventType === 'INSERT') {
                const newMessage = payload.new as DBChatMessage;
                // Só adiciona se for uma mensagem do assistente (as do visitante já são adicionadas localmente)
                if (newMessage.sender === 'Assistente') {
                  setMessages(prev => [...prev, {
                    content: newMessage.mensagem,
                    isUser: false,
                    timestamp: newMessage.created_at, // O timestamp já vem formatado do banco
                  }]);
                }
              }
            }
          )
          .subscribe();

        // Cleanup function
        return () => {
          channel.unsubscribe();
        };
      } else {
        // Mensagem inicial quando não há histórico
        setMessages([{
          content: "Olá! Como posso ajudar você hoje?",
          isUser: false,
          timestamp: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          showIdentification: false // Não deve mostrar botões quando não há histórico
        }]);
      }
    };

    loadChatHistory();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Adiciona a mensagem do usuário imediatamente
      const newMessage: Message = {
        content,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setMessages(prev => [...prev, newMessage]);

      // Verifica o UID do visitante
      const visitorStorage = new VisitorStorage();
      const uid = await visitorStorage.getVisitorUID();

      // Envia a mensagem para o webhook
      const response = await sendVisitorMessage(content, uid);
      console.log('Resposta do webhook:', response);

      // Trata as diferentes ações da resposta
      if (response.resposta?.mensagem) {
        const assistantMessage: Message = {
          content: response.resposta.mensagem,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          showIdentification: response.acao === "criarVisitante"
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Se for um novo visitante, salva o UID
      if (response.acao === "criarVisitante" && response.uid) {
        await visitorStorage.saveVisitorUID(response.uid);
        console.log('Novo visitante registrado com UID:', response.uid);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setMessages(prev => [...prev, {
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="duvidas" className="py-24 relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/80 via-zinc-900/90 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-emerald-500">
            Dúvidas Frequentes
          </h2>
          <p className="text-gray-400 text-lg mt-4">
            Tire suas dúvidas em tempo real com nosso assistente virtual
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <ChatContainer 
            messages={messages}
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </section>
  );
}