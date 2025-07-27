# 🔑 Configuração das Credenciais do Mercado Pago

## 📋 Credenciais Fornecidas

### Access Token (Chave Secreta)
```
APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728
```

### Public Key (Chave Pública)
```
APP_USR-c478c542-b18d-4ab1-acba-9539754cb167
```

### Client ID
```
7906695833613236
```

### Client Secret
```
QLgIub6c2I9Mj7smuQQIAX4FUpxYrhVj
```

## ⚙️ Configuração no Vercel

### 1. Acessar o Dashboard do Vercel
- Vá para: https://vercel.com/dashboard
- Selecione o projeto **"siteigreja"**

### 2. Configurar Variáveis de Ambiente

#### Para o Backend (Render):
1. Vá em **"Settings"** → **"Environment Variables"**
2. Adicione as seguintes variáveis:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728
MERCADOPAGO_PUBLIC_KEY=APP_USR-c478c542-b18d-4ab1-acba-9539754cb167
MERCADOPAGO_CLIENT_ID=7906695833613236
MERCADOPAGO_CLIENT_SECRET=QLgIub6c2I9Mj7smuQQIAX4FUpxYrhVj
NODE_ENV=production
```

#### Para o Frontend (Vercel):
1. Vá em **"Settings"** → **"Environment Variables"**
2. Adicione:

```
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-c478c542-b18d-4ab1-acba-9539754cb167
```

### 3. Configurar Webhook (Opcional)
- URL do webhook: `https://siteigreja-1.onrender.com/api/payments/webhook`
- Configure no dashboard do Mercado Pago se necessário

## 🔄 Deploy

Após configurar as variáveis:
1. **Backend:** Faça deploy no Render
2. **Frontend:** Faça deploy no Vercel

## 🧪 Teste

1. Acesse: https://igrejacemchurch.org
2. Vá para um evento com pagamento
3. Teste o processo de inscrição
4. Verifique se o Checkout Pro aparece

## 📞 Suporte

Se houver problemas:
1. Verifique os logs no Render
2. Confirme se as variáveis estão configuradas
3. Teste com cartões de teste do Mercado Pago

---

**✅ Após seguir estas instruções, o Checkout Pro do Mercado Pago estará funcionando!** 