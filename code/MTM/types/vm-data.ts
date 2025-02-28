export interface VMData {
  uid: string;
  nome: string;
  categoria: string;
  icone: string;
  vcpu: number;
  ram: string;
  nvme: string;
  banda?: string;
  core?: string;
  usd: number;
  tipo: string;
}

// Função para converter string de preço em número
export function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
}
