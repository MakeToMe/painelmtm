-- Primeiro, vamos atualizar a ordem dos apps do plano Basic
UPDATE mtm.list_apps
SET ordem = CASE nome
    WHEN 'Supabase' THEN 1
    WHEN 'n8n' THEN 2
    WHEN 'RabbitMQ' THEN 3
    WHEN 'MinIO' THEN 4
    WHEN 'Uptime Kuma' THEN 5
    ELSE ordem
END
WHERE plano = 'Basic';

-- Agora, vamos atualizar a ordem dos apps do plano IA
UPDATE mtm.list_apps
SET ordem = CASE nome
    WHEN 'Flowise' THEN 1
    WHEN 'Zep Memory' THEN 2
    WHEN 'PgVector' THEN 3
    WHEN 'Typebot' THEN 4
    WHEN 'RAG' THEN 5
    ELSE ordem
END
WHERE plano = 'IA';
