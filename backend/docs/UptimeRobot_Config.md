# Configuração do UptimeRobot para Prevenir Hibernação

## Problema
O banco de dados do Railway (usado pelo Render.com) pode hibernar na versão gratuita após períodos de inatividade, causando:
- Primeira requisição lenta
- Timeouts
- Dados temporariamente indisponíveis

## Solução: UptimeRobot

### 1. Criar conta no UptimeRobot
- Acesse: https://uptimerobot.com/
- Crie uma conta gratuita

### 2. Configurar Monitor
1. **Tipo de Monitor**: HTTP(s)
2. **URL**: `https://siteigreja.onrender.com/api/health`
3. **Nome**: "Igreja Backend Health Check"
4. **Intervalo**: 5 minutos
5. **Timeout**: 30 segundos
6. **Alertas**: Email (opcional)

### 3. Endpoints de Health Check
O backend já possui endpoints configurados:

#### Health Check Básico
```
GET https://siteigreja.onrender.com/api/health
```
Resposta:
```json
{
  "status": "ok",
  "timestamp": "2025-08-03T21:05:00.000Z",
  "uptime": "2h 30m"
}
```

#### Health Check Detalhado
```
GET https://siteigreja.onrender.com/api/health/detailed
```
Resposta:
```json
{
  "status": "ok",
  "database": "connected",
  "tables": {
    "store_products": 7,
    "events": 2,
    "registrations": 15
  },
  "timestamp": "2025-08-03T21:05:00.000Z"
}
```

### 4. Configuração Alternativa: Ping
Se preferir, pode usar um ping simples:
- **URL**: `https://siteigreja.onrender.com/`
- **Intervalo**: 5 minutos

### 5. Benefícios
- ✅ Mantém o serviço ativo
- ✅ Previne hibernação do banco
- ✅ Monitora a saúde do sistema
- ✅ Alertas em caso de problemas

### 6. Configuração Automática
O backend já está configurado para responder aos health checks. Apenas configure o UptimeRobot com as URLs acima.

## Status Atual
- ✅ Health check endpoints implementados
- ✅ Banco de produção populado com 7 produtos
- ✅ Serviço funcionando corretamente
- ⏳ Aguardando configuração do UptimeRobot 