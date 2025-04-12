interface VisitorMessage {
  acao: string;
  user: string;
  mensagem: string;
}

export async function sendVisitorMessage(message: string, uid: string | null): Promise<any> {
  const payload: VisitorMessage = {
    acao: "verificarId",
    user: uid || "não identificado",
    mensagem: message
  };

  const response = await fetch('https://rarwhk.rardevops.com/webhook/visitante', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar mensagem');
  }

  return response.json();
}
