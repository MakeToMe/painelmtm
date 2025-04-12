// Usando SHA-256 para hash
export async function hashPassword(password: string): Promise<string> {
  // Converter a senha para bytes usando TextEncoder
  const msgBuffer = new TextEncoder().encode(password);
  
  // Criar hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Converter para array de bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Converter para string hexadecimal
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export async function generateToken(identifier: string): Promise<string> {
  const now = Date.now().toString();
  const data = identifier + now;
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
