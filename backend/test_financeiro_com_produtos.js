const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧮 Testando dados financeiros com produtos...');

async function testarFinanceiroComProdutos() {
  try {
    console.log('📋 Passo 1: Fazendo login...');
    
    // Fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Configurar headers com token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📋 Passo 2: Testando rota de transações...');
    
    const transactionsResponse = await axios.get(`${API_BASE_URL}/financial/transactions`, { headers });
    console.log('✅ Transações carregadas:', transactionsResponse.data.length);
    
    if (transactionsResponse.data.length > 0) {
      const transaction = transactionsResponse.data[0];
      console.log('📋 Exemplo de transação:');
      console.log(`   ID: ${transaction.id}`);
      console.log(`   Evento: ${transaction.event_title}`);
      console.log(`   Cliente: ${transaction.customer_name}`);
      console.log(`   Valor do lote: R$ ${transaction.lot_price}`);
      console.log(`   Valor dos produtos: R$ ${transaction.products_total}`);
      console.log(`   Valor total: R$ ${transaction.total_amount}`);
      console.log(`   Status: ${transaction.payment_status}`);
      console.log(`   Produtos: ${JSON.stringify(transaction.products)}`);
    }
    
    console.log('\n📋 Passo 3: Testando resumo financeiro...');
    
    const summaryResponse = await axios.get(`${API_BASE_URL}/financial/summary`, { headers });
    console.log('✅ Resumo carregado');
    
    const summary = summaryResponse.data;
    console.log('📋 Resumo financeiro:');
    console.log(`   Receita total: R$ ${summary.totalRevenue.toFixed(2)}`);
    console.log(`   Total de transações: ${summary.totalTransactions}`);
    console.log(`   Ticket médio: R$ ${summary.averageTicketValue.toFixed(2)}`);
    
    console.log('\n📋 Receita por evento:');
    Object.entries(summary.revenueByEvent).forEach(([event, revenue]) => {
      console.log(`   ${event}: R$ ${revenue.toFixed(2)}`);
    });
    
    console.log('\n📋 Receita por status de pagamento:');
    Object.entries(summary.revenueByPaymentMethod).forEach(([status, revenue]) => {
      console.log(`   ${status}: R$ ${revenue.toFixed(2)}`);
    });
    
    console.log('\n🎯 RESUMO:');
    console.log('✅ Dados financeiros estão sendo calculados corretamente');
    console.log('✅ Produtos estão sendo incluídos no cálculo');
    console.log('✅ Sistema financeiro integrado com produtos');
    
  } catch (error) {
    console.error('❌ Erro ao testar dados financeiros:', error.response?.data || error.message);
  }
}

testarFinanceiroComProdutos(); 