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
NEXT_PUBLIC_SUPABASE_URL=https://studio.rardevops.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM0ODM2NDAwLAogICJleHAiOiAxODkyNjAyODAwCn0.a1mpboOHE9IMJbhsGquPv72W0iaDnM3kHYRKaZ2t3kA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MzQ4MzY0MDAsCiAgImV4cCI6IDE4OTI2MDI4MDAKfQ.VmlSWOEpE77ZfOcQSjoP-1Ty4eWUgybz_K9AUvdsY70
```

### Configuração Supabase
- **Schema**: DEVE ser SEMPRE 'mtm' - NUNCA alterar
- **Variáveis**: Gerenciadas via stack em produção
- **Desenvolvimento**: Usar `.env.example` como template
- **Segurança**: Nunca commitar arquivos `.env`

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
# Build da imagem (com variáveis de ambiente necessárias)
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=sua_chave_service \
  -t fmguardia/painelmtm:v0.2 .

# Execução local
docker run -p 3000:3000 fmguardia/painelmtm:v0.2

# Deploy de atualizações
docker push fmguardia/painelmtm:v0.2
```

### Notas Importantes sobre Build
1. **Variáveis de Ambiente**:
   - Todas as variáveis Supabase são necessárias durante o build
   - NÃO criar arquivo .env.production (está no .gitignore)
   - Passar variáveis via --build-arg no comando docker build
   
2. **Ordem de Build**:
   - Confirmar todas as variáveis antes do build
   - Verificar se build completou com sucesso
   - Testar imagem localmente antes do push

## Guidelines de Desenvolvimento

### 1. Setup de Ambiente
- Usar `.env.example` como template
- Desenvolvimento local usa `.env.development`
- Produção usa variáveis da stack

### 2. Desenvolvimento Docker
- Build sempre requer três ARGs do Supabase:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ```
- Passar ARGs via linha de comando (não usar .env em produção)
- Usar multi-stage build para imagens menores
- Testar localmente antes de push
- Seguir práticas de segurança

### 3. Processo de Deploy
1. Build da imagem Docker localmente com todas as variáveis necessárias
2. Teste completo da nova imagem
3. Push para Docker Hub com a tag correta
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
