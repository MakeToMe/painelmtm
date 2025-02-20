# MTM (Make To Me) - Guia do Projeto

## Visão Geral
- **Nome**: MTM (Make To Me)
- **Tipo**: Aplicação Web
- **Stack**: Next.js, Supabase, Docker
- **Repositório**: MakeToMe/painelmtm

## Arquitetura

### 1. Configuração Docker
- Multi-stage build para otimização
- Variáveis injetadas via stack em runtime
- Sem chaves sensíveis no Dockerfile
- Output standalone do Next.js

### 2. Variáveis de Ambiente
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
- Gerenciadas via stack em produção
- Usar `.env.example` como template
- Nunca commitar arquivos `.env`

### 3. Otimizações de Performance
- Middleware de compressão Traefik
- Build multi-stage do Docker
- Output standalone Next.js
- Limites de recursos na stack

### 4. Práticas de Segurança
- Sem segredos hardcoded
- Variáveis de ambiente para dados sensíveis
- `.gitignore` configurado corretamente
- Rotas API protegidas

### 5. Estrutura de Arquivos
```
/app           # Páginas e rotas API Next.js
/components    # Componentes React
/lib          # Funções utilitárias e cliente Supabase
/docs         # Documentação
```

## Comandos Importantes

### Docker
```bash
# Build da imagem
docker build -t fmguardia/painelmtm:v0.2 .

# Execução local
docker run -p 3000:3000 fmguardia/painelmtm:v0.2

# Deploy de atualizações
docker push fmguardia/painelmtm:v0.2
```

## Guidelines de Desenvolvimento

### 1. Setup de Ambiente
- Usar `.env.example` como template
- Desenvolvimento local usa `.env.development`
- Produção usa variáveis da stack

### 2. Desenvolvimento Docker
- Build com ARGs necessários para chaves Supabase
- Usar multi-stage build para imagens menores
- Testar localmente antes de push
- Seguir práticas de segurança

### 3. Processo de Deploy
1. Build da imagem Docker localmente
2. Teste completo
3. Push para Docker Hub
4. Atualização da stack se necessário

### 4. Checklist de Segurança
- [ ] Sem segredos no Dockerfile
- [ ] Usar variáveis de ambiente
- [ ] `.gitignore` atualizado
- [ ] Controles de acesso apropriados

### 5. Considerações de Performance
- Output standalone Next.js
- Compressão no Traefik
- Monitoramento de recursos
- Otimização de tamanho das imagens
