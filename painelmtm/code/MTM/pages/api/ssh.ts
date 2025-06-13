import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'ssh2';
import { createClient } from '@supabase/supabase-js';

// Tipos para a resposta da API
type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

// Função para executar comando SSH
async function executeSSHCommand(ip: string, user: string, password: string, command: string): Promise<{success: boolean, output?: string, error?: string}> {
  return new Promise((resolve) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';
    
    // Definir timeout para a conexão (15 segundos)
    const connectionTimeout = setTimeout(() => {
      conn.end();
      resolve({
        success: false,
        error: 'Timeout ao tentar conectar ao servidor'
      });
    }, 15000);
    
    conn.on('ready', () => {
      // Limpar o timeout quando a conexão for estabelecida
      clearTimeout(connectionTimeout);
      
      console.log(`Conexão SSH estabelecida com ${ip}`);
      
      // Atualizar o status do servidor para 'login'
      updateServerStatus(ip, 'login');
      
      conn.exec(command, (err: Error | undefined, stream: any) => {
        if (err) {
          conn.end();
          return resolve({
            success: false,
            error: `Erro ao executar comando: ${err.message}`
          });
        }
        
        stream.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        stream.stderr.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });
        
        stream.on('close', () => {
          conn.end();
          
          if (errorOutput && !output) {
            resolve({
              success: false,
              error: errorOutput,
              output: output
            });
          } else {
            resolve({
              success: true,
              output: output
            });
          }
        });
      });
    }).on('error', (err: Error) => {
      // Limpar o timeout em caso de erro
      clearTimeout(connectionTimeout);
      
      resolve({
        success: false,
        error: `Erro de conexão SSH: ${err.message}`
      });
    }).connect({
      host: ip,
      port: 22,
      username: user,
      password: password,
      readyTimeout: 10000,
      keepaliveInterval: 10000,
      // Aceitar chaves de host desconhecidas
      hostVerifier: () => true
    });
  });
}

// Função para atualizar o status do servidor no banco de dados
async function updateServerStatus(ip: string, papel: string) {
  try {
    // Criar cliente Supabase com chaves de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Variáveis de ambiente do Supabase não configuradas');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar o servidor pelo IP
    const { data: servers, error: fetchError } = await supabase
      .from('servidores')
      .select('uid')
      .eq('ip', ip)
      .limit(1);
    
    if (fetchError || !servers || servers.length === 0) {
      console.error('Erro ao buscar servidor:', fetchError);
      return;
    }
    
    // Atualizar o campo papel
    const { error: updateError } = await supabase
      .from('servidores')
      .update({ papel })
      .eq('uid', servers[0].uid);
    
    if (updateError) {
      console.error('Erro ao atualizar status do servidor:', updateError);
    }
  } catch (error) {
    console.error('Erro ao atualizar status do servidor:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Verificar se o método é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { ip, user, password } = req.body;
    
    // Validar dados
    if (!ip || !user || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados de conexão incompletos' 
      });
    }
    
    console.log(`Iniciando conexão SSH com ${ip} (usuário: ${user})`);
    
    // Comando para instalar o agente
    const command = 'sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/MakeToMe/agent/main/install.sh)"';
    
    // Executar o comando via SSH
    const result = await executeSSHCommand(ip, user, password, command);
    
    if (!result.success) {
      console.error(`Falha na execução SSH: ${result.error}`);
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Comando enviado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao processar requisição SSH:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Falha ao processar requisição' 
    });
  }
}
