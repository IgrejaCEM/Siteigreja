# 🔧 Guia de Configuração do MercadoPago no Render.com

## ❌ **Problema Identificado:**
O PaymentGateway funciona perfeitamente localmente, mas não gera `payment_url` em produção porque as credenciais do MercadoPago não estão configuradas no Render.com.

## ✅ **Solução:**

### 1. **Acessar o Render.com Dashboard**
- Vá para: https://dashboard.render.com
- Faça login na sua conta
- Encontre o serviço `siteigreja-backend`

### 2. **Configurar Variáveis de Ambiente**
No dashboard do Render.com, vá em:
- **Environment** → **Environment Variables**
- Adicione as seguintes variáveis:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-790669583361...
MERCADOPAGO_PUBLIC_KEY=APP_USR-c478c542-b18...
MERCADOPAGO_CLIENT_ID=seu_client_id_aqui
MERCADOPAGO_CLIENT_SECRET=seu_client_secret_aqui
PAYMENT_FAKE_MODE=false
```

### 3. **Obter Credenciais do MercadoPago**
Se você não tem as credenciais:
1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login na sua conta
3. Vá em **Minhas Aplicações**
4. Crie uma nova aplicação ou use uma existente
5. Copie as credenciais:
   - **Access Token**
   - **Public Key**
   - **Client ID**
   - **Client Secret**

### 4. **Verificar Configuração**
Após configurar, aguarde alguns minutos e teste:

```bash
node test_local_vs_production.js
```

### 5. **Teste Final**
Se tudo estiver configurado corretamente, o teste deve mostrar:
- ✅ **Local**: Payment URL gerada
- ✅ **Produção**: Payment URL gerada

## 🚨 **Importante:**
- As credenciais devem ser as mesmas que estão funcionando localmente
- Não compartilhe as credenciais em código público
- Use o modo de produção do MercadoPago para testes reais

## 📞 **Suporte:**
Se precisar de ajuda para obter as credenciais do MercadoPago, entre em contato com o suporte deles. 