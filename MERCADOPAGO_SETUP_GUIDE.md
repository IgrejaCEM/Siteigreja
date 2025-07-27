# 🚀 Guia de Configuração do Mercado Pago Real

## 📋 Pré-requisitos

1. **Conta no Mercado Pago** (pessoal ou empresarial)
2. **Acesso ao Dashboard** do Vercel
3. **Credenciais** do Mercado Pago

## 🔑 Passo 1: Obter Credenciais do Mercado Pago

### 1.1 Acessar o Dashboard
- Vá para: https://www.mercadopago.com.br
- Faça login na sua conta
- Acesse **"Desenvolvedores"** → **"Credenciais"**

### 1.2 Copiar Credenciais
Você precisará de duas credenciais:

#### **Access Token (Chave Secreta)**
- Clique em **"Gerar token de produção"**
- Copie o token gerado
- **Exemplo:** `APP_USR-1234567890abcdef-123456-abcdef`

#### **Public Key (Chave Pública)**
- Copie a **Public Key** exibida
- **Exemplo:** `APP_USR-1234567890abcdef-123456-abcdef`

### 1.3 Configurar Webhooks (Opcional)
- Vá em **"Webhooks"**
- Adicione a URL: `https://siteigreja-1.onrender.com/api/payments/webhook`

## ⚙️ Passo 2: Configurar Variáveis no Vercel

### 2.1 Acessar o Dashboard do Vercel
- Vá para: https://vercel.com/dashboard
- Selecione o projeto **"siteigreja"**

### 2.2 Adicionar Variáveis de Ambiente
1. Vá em **"Settings"** → **"Environment Variables"**
2. Adicione as seguintes variáveis:

#### **Para o Frontend:**
```
MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
```

#### **Para o Backend:**
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-seu-access-token-aqui
MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
MERCADOPAGO_WEBHOOK_URL=https://siteigreja-1.onrender.com/api/payments/webhook
NODE_ENV=production
```

### 2.3 Configurar Domínios
Certifique-se de que as variáveis estão configuradas para:
- **Production** ✅
- **Preview** ✅

## 🔧 Passo 3: Atualizar Configuração Local

### 3.1 Criar arquivo .env (opcional para testes locais)
```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-seu-access-token-aqui
MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
MERCADOPAGO_WEBHOOK_URL=https://siteigreja-1.onrender.com/api/payments/webhook

# Ambiente
NODE_ENV=production
```

## 🧪 Passo 4: Testar a Configuração

### 4.1 Teste em Sandbox (Recomendado)
1. Use credenciais de **teste** primeiro
2. Faça uma inscrição de teste
3. Use cartões de teste do Mercado Pago

### 4.2 Cartões de Teste
- **Visa:** 4509 9535 6623 3704
- **Mastercard:** 5031 4332 1540 6351
- **CVV:** 123
- **Data:** Qualquer data futura

### 4.3 Teste em Produção
1. Configure credenciais de **produção**
2. Faça um teste com valor baixo
3. Verifique se o pagamento é processado

## 🔍 Passo 5: Verificar Logs

### 5.1 Logs do Backend
Verifique os logs no Vercel para confirmar:
```
🔗 Iniciando criação de pagamento no Mercado Pago...
📊 Dados do pagamento: {...}
✅ Retorno Mercado Pago: {...}
```

### 5.2 Logs do Mercado Pago
- Acesse o dashboard do Mercado Pago
- Vá em **"Atividade"** → **"Pagamentos"**
- Verifique se os pagamentos estão sendo criados

## 🚨 Solução de Problemas

### Problema: "Erro de credenciais"
**Solução:** Verifique se as variáveis estão configuradas corretamente no Vercel

### Problema: "Webhook não recebido"
**Solução:** Configure o webhook no dashboard do Mercado Pago

### Problema: "Pagamento não aprovado"
**Solução:** Verifique se está usando credenciais de produção

## 📞 Suporte

- **Mercado Pago:** https://www.mercadopago.com.br/developers
- **Documentação:** https://www.mercadopago.com.br/developers/docs

## ✅ Checklist de Configuração

- [ ] Conta no Mercado Pago criada
- [ ] Credenciais obtidas
- [ ] Variáveis configuradas no Vercel
- [ ] Webhook configurado
- [ ] Teste em sandbox realizado
- [ ] Teste em produção realizado
- [ ] Logs verificados

---

**🎉 Após seguir este guia, o checkout do Mercado Pago estará funcionando completamente!** 