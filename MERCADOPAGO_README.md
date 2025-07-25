# Configuração do Mercado Pago

## Visão Geral
O sistema foi atualizado para usar o Mercado Pago como gateway de pagamento principal, mantendo o Acabate Pay em standby. Esta implementação usa o Checkout Transparente do Mercado Pago, que permite uma experiência de pagamento totalmente personalizada sem redirecionamentos.

## Requisitos
1. Conta no Mercado Pago
2. Credenciais de acesso:
   - Access Token (Chave Secreta)
   - Public Key (Chave Pública)
3. Configuração de Webhook
4. Certificação PCI DSS (para pagamentos com cartão)

## Configuração

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Credenciais do Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui

# URLs de Notificação
MERCADOPAGO_WEBHOOK_URL=sua_url_de_webhook
MERCADOPAGO_IPN_URL=sua_url_de_ipn

# Ambiente
NODE_ENV=development # ou production
```

### 2. Métodos de Pagamento Suportados

#### Cartão de Crédito
- Tokenização de cartão
- Processamento em modo agregador ou gateway
- Suporte a parcelamento (até 12x)
- 3D Secure 2.0 (quando aplicável)

#### PIX
- QR Code dinâmico
- Expiração em 24 horas
- Confirmação instantânea

#### Boleto Bancário
- Emissão via Bradesco
- Vencimento em 3 dias
- URL para impressão/visualização

### 3. Status de Pagamento
- `pending`: Aguardando pagamento
- `approved`: Pagamento aprovado
- `authorized`: Pagamento autorizado
- `in_process`: Pagamento em análise
- `in_mediation`: Pagamento em disputa
- `rejected`: Pagamento rejeitado
- `cancelled`: Pagamento cancelado
- `refunded`: Pagamento devolvido
- `charged_back`: Pagamento estornado

### 4. Notificações
O sistema está configurado para receber notificações do Mercado Pago através de dois canais:

#### Webhook
```
POST /api/payments/webhook
```
- Notificações assíncronas
- Atualizações em tempo real
- Retry automático em caso de falha

#### IPN (Instant Payment Notification)
```
POST /api/payments/ipn
```
- Notificações síncronas
- Confirmação imediata
- Backup para webhooks

## Testes

### Ambiente de Sandbox
1. Use as credenciais de teste do Mercado Pago
2. Configure `NODE_ENV=development`
3. Use os cartões de teste fornecidos:
   ```
   Cartão de teste VISA: 4235647728025682
   CVV: 123
   Data de validade: qualquer data futura
   ```

### Fluxo de Teste
1. Criar pagamento
2. Verificar notificações
3. Consultar status
4. Testar diferentes cenários (aprovação, rejeição, etc.)

## Voltar para Acabate Pay
Se necessário voltar para o Acabate Pay:
1. No arquivo `config.js`, altere:
```javascript
payment: {
  activeGateway: 'abacatepay',
  abacatepay: {
    enabled: true
  }
}
```

## Segurança
- Nunca compartilhe suas credenciais
- Mantenha o `NODE_ENV` como 'production' em ambiente de produção
- Use HTTPS para o webhook em produção
- Monitore as transações regularmente
- Implemente validações de segurança:
  - Validação de CPF
  - Validação de cartão
  - Proteção contra fraudes
  - Rate limiting
  - CORS configurado corretamente

## Suporte
Em caso de problemas:
1. Verifique os logs do servidor
2. Confirme as credenciais no painel do Mercado Pago
3. Verifique a configuração do webhook
4. Consulte a [documentação oficial do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/overview)
5. Entre em contato com o suporte do Mercado Pago

## Referências
- [Documentação Oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/overview)
- [Referência da API](https://www.mercadopago.com.br/developers/pt/reference)
- [Centro de Segurança](https://www.mercadopago.com.br/developers/pt/security) 