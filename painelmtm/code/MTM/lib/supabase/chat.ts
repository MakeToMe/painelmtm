import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  uid: string;
  created_at: string;
  mensagem: string;
  sender: 'Visitante' | 'Assistente';
  chat_id: string;
}

// Função para formatar a data para PT-BR (-3h)
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Buscar histórico de mensagens de um chat específico
export async function getChatHistory(chatId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_faq')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    return [];
  }

  return data?.map(message => ({
    ...message,
    created_at: formatDateTime(message.created_at)
  })) || [];
}

// Função auxiliar para verificar se uma mensagem já existe
async function messageExists(uid: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('chat_faq')
    .select('uid')
    .eq('uid', uid)
    .single();

  if (error || !data) return false;
  return true;
}

// Adicionar nova mensagem ao chat
export async function addChatMessage(message: Omit<ChatMessage, 'uid' | 'created_at'>): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_faq')
    .insert([message])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar mensagem:', error);
    return null;
  }

  return data ? {
    ...data,
    created_at: formatDateTime(data.created_at)
  } : null;
}

// Atualizar uma mensagem existente
export async function updateChatMessage(uid: string, updates: Partial<ChatMessage>): Promise<boolean> {
  const { error } = await supabase
    .from('chat_faq')
    .update(updates)
    .eq('uid', uid);

  if (error) {
    console.error('Erro ao atualizar mensagem:', error);
    return false;
  }

  return true;
}

// Deletar uma mensagem
export async function deleteChatMessage(uid: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_faq')
    .delete()
    .eq('uid', uid);

  if (error) {
    console.error('Erro ao deletar mensagem:', error);
    return false;
  }

  return true;
}
