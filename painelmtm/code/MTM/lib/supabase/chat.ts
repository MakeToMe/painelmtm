// Funções de chat agora usam API backend, sem Supabase no client

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
  try {
    const res = await fetch(`/api/chat/history?chatId=${encodeURIComponent(chatId)}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.map((m: any) => ({ ...m, created_at: formatDateTime(m.created_at) }))
  } catch {
    return []
  }
}

// Função auxiliar para verificar se uma mensagem já existe
async function messageExists(uid: string): Promise<boolean> {
  // Implementação não alterada
  // Você pode querer alterar isso para usar a API backend também
  return false;
}

// Adicionar nova mensagem ao chat
export async function addChatMessage(message: Omit<ChatMessage, 'uid' | 'created_at'>): Promise<ChatMessage | null> {
  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
    if (!res.ok) return null
    const data = await res.json()
    return { ...data, created_at: formatDateTime(data.created_at) }
  } catch {
    return null
  }
}

// Atualizar uma mensagem existente
export async function updateChatMessage(uid: string, updates: Partial<ChatMessage>): Promise<boolean> {
  const res = await fetch('/api/chat/message', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, updates })
  })
  return res.ok
}

// Deletar uma mensagem
export async function deleteChatMessage(uid: string): Promise<boolean> {
  const res = await fetch('/api/chat/message', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
  })
  return res.ok
}
