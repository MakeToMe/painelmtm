# Guia de Implementação Segura de Autenticação com Next.js e Docker

Este guia descreve como implementar autenticação segura em projetos Next.js usando Docker, especialmente para implantação em plataformas como Portainer. Vamos cobrir todo o processo, desde a configuração do Dockerfile até como as variáveis de ambiente são gerenciadas em diferentes estágios.

## Índice

1. [Princípios de Segurança](#princípios-de-segurança)
2. [Estrutura do Dockerfile](#estrutura-do-dockerfile)
3. [Configuração do Next.js](#configuração-do-nextjs)
4. [Implementação do Cliente de Autenticação](#implementação-do-cliente-de-autenticação)
5. [Processo de Build](#processo-de-build)
6. [Implantação no Portainer](#implantação-no-portainer)
7. [Verificação e Troubleshooting](#verificação-e-troubleshooting)

## Princípios de Segurança

Ao trabalhar com autenticação em aplicações containerizadas, seguimos estes princípios:

1. **Nunca armazenar credenciais no código-fonte ou na imagem Docker**
2. **Separar variáveis de build-time e runtime**
3. **Limitar exposição de variáveis ao cliente (frontend)**
4. **Validar a presença de variáveis obrigatórias**
5. **Usar multi-stage builds para minimizar o tamanho da imagem final**

## Estrutura do Dockerfile

Usamos um Dockerfile com multi-stage build para separar o ambiente de desenvolvimento do ambiente de produção:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

# Copiar arquivos de projeto
COPY . .

# Instalar dependências
RUN npm ci

# Argumentos para build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

# Build da aplicação
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos necessários do builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Variáveis de ambiente em runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# As variáveis de autenticação devem ser injetadas em tempo de execução
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["node", "server.js"]
```

### Pontos importantes no Dockerfile:

1. **Estágio de build (`builder`)**:
   - Usamos `ARG` para receber variáveis durante o build
   - Estas variáveis são necessárias para o Next.js compilar corretamente o código
   - Não são persistidas na imagem final

2. **Estágio de produção**:
   - Apenas copia os arquivos necessários do estágio de build
   - Define variáveis de ambiente básicas com `ENV`
   - Deixa comentários indicando quais variáveis devem ser injetadas em runtime

## Configuração do Next.js

O arquivo `next.config.js` é configurado para gerenciar as variáveis de ambiente:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Outras configurações...
  
  env: {
    // URLs públicas podem ser hardcoded (não são sensíveis)
    NEXT_PUBLIC_SUPABASE_URL: 'https://seu-projeto.supabase.co',
    
    // Chaves sensíveis são referenciadas do ambiente
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Configuração para gerar build standalone (importante para Docker)
  output: 'standalone'
}

module.exports = nextConfig
```

### Pontos importantes no next.config.js:

1. **Configuração `env`**:
   - Define variáveis que serão acessíveis via `process.env` na aplicação
   - URLs públicas podem ser hardcoded (não são sensíveis)
   - Chaves sensíveis são referenciadas do ambiente

2. **Output `standalone`**:
   - Gera um build otimizado para Docker que inclui apenas o necessário
   - Reduz o tamanho da imagem final

## Implementação do Cliente de Autenticação

Exemplo de implementação segura do cliente de autenticação (usando Supabase como exemplo):

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Verificação de variáveis obrigatórias
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configuração do cliente
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    // Opções adicionais de configuração
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
```

### Pontos importantes na implementação do cliente:

1. **Verificação de variáveis**:
   - Valida a presença de variáveis obrigatórias no início
   - Falha rapidamente se estiverem ausentes (fail fast)

2. **Prefixo `NEXT_PUBLIC_`**:
   - Variáveis com este prefixo são acessíveis no cliente (browser)
   - Variáveis sem este prefixo são acessíveis apenas no servidor

3. **Configuração do cliente**:
   - Inicializa o cliente com as variáveis de ambiente
   - Define opções adicionais conforme necessário

## Processo de Build

Para construir a imagem Docker com segurança:

```bash
# Comando para build da imagem
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui \
  -t seu-app:latest .
```

### Pontos importantes no processo de build:

1. **Argumentos de build**:
   - Passados com `--build-arg` para o Docker
   - Correspondem aos `ARG` definidos no Dockerfile
   - Usados apenas durante o build, não persistidos na imagem final

2. **Segurança**:
   - Em pipelines CI/CD, estas variáveis devem ser armazenadas como secrets
   - Nunca devem ser expostas em logs ou histórico de comandos

## Implantação no Portainer

Ao implantar a stack no Portainer:

1. **Selecione a imagem** construída anteriormente
2. **Configure as variáveis de ambiente**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
   ```
3. **Configure as portas** (normalmente 3000:3000)
4. **Implante a stack**

### Como o Next.js acessa as variáveis em runtime:

1. **Variáveis do lado do servidor**:
   - O Node.js acessa diretamente via `process.env`
   - Incluem todas as variáveis, com ou sem prefixo `NEXT_PUBLIC_`

2. **Variáveis do lado do cliente**:
   - Apenas variáveis com prefixo `NEXT_PUBLIC_` são acessíveis
   - Durante o build, o Next.js substitui referências a `process.env.NEXT_PUBLIC_*` por seus valores reais

## Verificação e Troubleshooting

### Verificando se as variáveis estão disponíveis:

```javascript
// Adicione este código temporariamente em uma API route para debug
export async function GET(request) {
  return new Response(JSON.stringify({
    // Nunca exponha chaves sensíveis em produção!
    // Este é apenas para debug em ambiente seguro
    vars: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'definido' : 'não definido',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'definido' : 'não definido',
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### Problemas comuns e soluções:

1. **Variáveis não disponíveis em runtime**:
   - Verifique se foram corretamente definidas na stack do Portainer
   - Verifique se o nome das variáveis está exatamente igual ao esperado pelo código

2. **Erro "Cannot read properties of undefined"**:
   - Provavelmente uma variável de ambiente está faltando
   - Adicione verificações como mostrado no exemplo do cliente

3. **Erro durante o build**:
   - Verifique se os argumentos de build foram passados corretamente
   - Verifique se o Dockerfile está configurado para receber esses argumentos

4. **Problemas de autenticação no cliente**:
   - Verifique se as variáveis com prefixo `NEXT_PUBLIC_` estão disponíveis
   - Use ferramentas de desenvolvimento do navegador para inspecionar o código compilado

## Conclusão

Seguindo este guia, você implementará autenticação de forma segura em projetos Next.js usando Docker, especialmente para implantação em plataformas como Portainer. Esta abordagem:

1. Mantém as credenciais fora do código-fonte e da imagem Docker
2. Separa claramente as variáveis de build-time e runtime
3. Limita a exposição de variáveis sensíveis ao cliente
4. Valida a presença de variáveis obrigatórias
5. Usa multi-stage builds para otimizar a imagem final

Lembre-se de adaptar as configurações específicas (como nomes de variáveis e URLs) de acordo com seu projeto e provedor de autenticação.
