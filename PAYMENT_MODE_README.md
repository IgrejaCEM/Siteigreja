# Configuração do Sistema de Pagamento

## Modo de Pagamento Atual: FAKE (Simulado)

O sistema está configurado para **modo fake**, onde todas as inscrições são automaticamente aprovadas sem necessidade de pagamento real.

### Como Funciona o Modo Fake

1. **Inscrições Automáticas**: Todas as inscrições são marcadas como `paid` (pago) automaticamente
2. **QR Code Simulado**: Gera um QR Code fake para demonstração
3. **E-mail de Comprovante**: Envia e-mail com dados simulados
4. **Interface Informativa**: Mostra claramente que está em modo de teste

### Para Alternar para Modo Real (Gateway de Pagamento)

1. **Editar Configuração**:
   ```javascript
   // backend/src/config.js
   const config = {
     PAYMENT_FAKE_MODE: false, // Mudar para false
     // ... outras configurações
   };
   ```

2. **Implementar Gateway de Pagamento**:
   - Adicionar integração com gateway (ex: Mercado Pago, PagSeguro, etc.)
   - Implementar webhooks para confirmação de pagamento
   - Atualizar status de pagamento baseado na resposta do gateway

3. **Atualizar Frontend**:
   - Remover alertas de "modo teste"
   - Implementar fluxo real de pagamento
   - Adicionar validação de pagamento

### Estrutura de Status de Pagamento

- `paid`: Pagamento aprovado
- `pending`: Aguardando pagamento
- `failed`: Pagamento falhou
- `cancelled`: Pagamento cancelado

### Arquivos Modificados

- `backend/src/config.js` - Configurações centralizadas
- `backend/src/routes.js` - Lógica de inscrição
- `frontend/src/pages/PublicEvents.jsx` - Interface do usuário

### Próximos Passos para Implementação Real

1. Escolher gateway de pagamento
2. Implementar integração no backend
3. Atualizar frontend para fluxo real
4. Configurar webhooks
5. Testar em ambiente de sandbox
6. Configurar produção

---

**Nota**: O modo fake é ideal para testes e demonstrações. Para uso em produção, sempre implemente um gateway de pagamento real. 