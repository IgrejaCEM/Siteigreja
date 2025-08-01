# Configuração do UptimeRobot para Railway

## Por que usar UptimeRobot?

O Railway pode hibernar serviços gratuitos após inatividade, causando:
- Delays na primeira requisição após hibernação
- Timeouts para usuários
- Experiência ruim no checkout

## Configuração do UptimeRobot

### 1. Criar conta no UptimeRobot
- Acesse: https://uptimerobot.com/
- Crie uma conta gratuita
- Verifique seu email

### 2. Adicionar novo monitor

**Configurações básicas:**
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Site Igreja Backend
- **URL:** https://siteigreja-1.onrender.com/api/health
- **Monitoring Interval:** 5 minutes

**Configurações avançadas:**
- **Alert When Down:** ✓
- **Alert When Up:** ✓
- **Alert After:** 1 failure
- **Alert Contacts:** Seu email

### 3. Criar endpoint de health check

Adicionar no backend:

```javascript
// Em routes/health.js
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 4. Benefícios

✅ **Previne hibernação** - Requisições a cada 5 min
✅ **Monitoramento 24/7** - Alerta se o serviço cair
✅ **Gratuito** - 50 monitors na versão free
✅ **Notificações** - Email/SMS quando cair

### 5. URLs para monitorar

1. **Backend API:** https://siteigreja-1.onrender.com/api/health
2. **Frontend:** https://igrejacemchurch.org
3. **Admin:** https://igrejacemchurch.org/admin

### 6. Configuração adicional

**Para melhor performance:**
- Configure múltiplos pontos de monitoramento
- Use diferentes intervalos (5min, 10min)
- Configure alertas para diferentes cenários

**Exemplo de configuração:**
```
Monitor 1: API Health Check (5min)
Monitor 2: Frontend Homepage (10min)  
Monitor 3: Admin Login (15min)
```

## Implementação

1. Criar endpoint `/api/health` no backend
2. Configurar UptimeRobot
3. Testar monitoramento
4. Configurar alertas

Isso manterá o serviço sempre ativo e alertará sobre problemas! 