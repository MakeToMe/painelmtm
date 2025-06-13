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

# Build da aplicação com output standalone
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

# As variáveis do Supabase devem ser injetadas em tempo de execução
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["node", "server.js"]
