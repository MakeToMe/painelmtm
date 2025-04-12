import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cria um cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'mtm'
    }
  }
)

// Tipos para os planos de servidor
interface ServerPlan {
  id: string
  name: string
  cpu: number
  ram: number
  storage: number
  bandwidth: number
  price: number
  location: string
  type: string
}

// Tipo para localizações de servidor
interface ServerLocation {
  id: string
  name: string
  country: string
  flag: string
  continent: string
  serversAvailable: number
}

// Dados de localizações de servidor
const serverLocations: ServerLocation[] = [
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Holanda',
    flag: '🇳🇱',
    continent: 'Europa',
    serversAvailable: 128
  },
  {
    id: 'stockholm',
    name: 'Estocolmo',
    country: 'Suécia',
    flag: '🇸🇪',
    continent: 'Europa',
    serversAvailable: 96
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'América do Norte',
    serversAvailable: 156
  },
  {
    id: 'chicago',
    name: 'Chicago',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'América do Norte',
    serversAvailable: 112
  },
  {
    id: 'new-york',
    name: 'Nova York',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'América do Norte',
    serversAvailable: 184
  },
  {
    id: 'vienna',
    name: 'Viena',
    country: 'Áustria',
    flag: '🇦🇹',
    continent: 'Europa',
    serversAvailable: 76
  },
  {
    id: 'oslo',
    name: 'Oslo',
    country: 'Noruega',
    flag: '🇳🇴',
    continent: 'Europa',
    serversAvailable: 64
  },
  {
    id: 'zurich',
    name: 'Zurique',
    country: 'Suíça',
    flag: '🇨🇭',
    continent: 'Europa',
    serversAvailable: 92
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    country: 'Hong Kong',
    flag: '🇭🇰',
    continent: 'Ásia',
    serversAvailable: 108
  },
  {
    id: 'singapore',
    name: 'Singapura',
    country: 'Singapura',
    flag: '🇸🇬',
    continent: 'Ásia',
    serversAvailable: 124
  },
  {
    id: 'tokyo',
    name: 'Tóquio',
    country: 'Japão',
    flag: '🇯🇵',
    continent: 'Ásia',
    serversAvailable: 148
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Austrália',
    flag: '🇦🇺',
    continent: 'Oceania',
    serversAvailable: 86
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    country: 'Brasil',
    flag: '🇧🇷',
    continent: 'América do Sul',
    serversAvailable: 132
  },
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country: 'Brasil',
    flag: '🇧🇷',
    continent: 'América do Sul',
    serversAvailable: 94
  }
]

// Dados simulados para planos de servidor
const serverPlans: ServerPlan[] = [
  {
    id: 'basic-vps',
    name: 'VPS Básico',
    cpu: 2,
    ram: 4,
    storage: 80,
    bandwidth: 2000,
    price: 29.90,
    location: 'Brasil',
    type: 'vps'
  },
  {
    id: 'standard-vps',
    name: 'VPS Padrão',
    cpu: 4,
    ram: 8,
    storage: 160,
    bandwidth: 4000,
    price: 59.90,
    location: 'Brasil',
    type: 'vps'
  },
  {
    id: 'premium-vps',
    name: 'VPS Premium',
    cpu: 8,
    ram: 16,
    storage: 320,
    bandwidth: 8000,
    price: 119.90,
    location: 'Brasil',
    type: 'vps'
  },
  {
    id: 'basic-dedicated',
    name: 'Servidor Dedicado Básico',
    cpu: 8,
    ram: 32,
    storage: 1000,
    bandwidth: 10000,
    price: 299.90,
    location: 'Brasil',
    type: 'dedicated'
  },
  {
    id: 'standard-dedicated',
    name: 'Servidor Dedicado Padrão',
    cpu: 16,
    ram: 64,
    storage: 2000,
    bandwidth: 20000,
    price: 599.90,
    location: 'Brasil',
    type: 'dedicated'
  },
  {
    id: 'premium-dedicated',
    name: 'Servidor Dedicado Premium',
    cpu: 32,
    ram: 128,
    storage: 4000,
    bandwidth: 50000,
    price: 1199.90,
    location: 'Brasil',
    type: 'dedicated'
  }
]

// Função para verificar a chave API
function verifyApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey || apiKey !== process.env.SERVER_MANAGER_API_KEY) {
    return false
  }
  
  return true
}

// GET - Buscar planos de servidor disponíveis ou localizações
export async function GET(request: Request) {
  try {
    // Extrair filtros da URL
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const resource = searchParams.get('resource')
    
    // Verificar se o cliente Supabase foi inicializado corretamente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }
    
    // Buscar regiões da tabela regioes
    const { data, error } = await supabaseAdmin
      .from('regioes')
      .select('*')
      .order('pais', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar regiões:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar regiões' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro interno do servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Solicitar contratação de servidor
export async function POST(request: Request) {
  try {
    // Verificar a chave API
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Validar dados obrigatórios
    if (!data.planId || !data.userId || !data.locationId) {
      return NextResponse.json(
        { error: 'ID do plano, ID do usuário e localização são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const selectedPlan = serverPlans.find(plan => plan.id === data.planId)
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se a localização existe
    const selectedLocation = serverLocations.find(location => location.id === data.locationId)
    if (!selectedLocation) {
      return NextResponse.json(
        { error: 'Localização não encontrada' },
        { status: 404 }
      )
    }

    // Simular processamento de contratação
    // Em um ambiente real, aqui seria feita a integração com o sistema de pagamento
    // e provisionamento do servidor

    // Resposta simulada de sucesso
    return NextResponse.json({
      success: true,
      message: 'Solicitação de contratação recebida com sucesso',
      orderId: `ORD-${Date.now()}`,
      plan: selectedPlan,
      location: selectedLocation,
      userId: data.userId,
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 3600000).toISOString() // 1 hora a partir de agora
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
