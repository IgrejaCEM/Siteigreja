const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('💰 Testando rotas financeiras com produtos...');

async function testarFinanceiro() {
  try {
    console.log('📋 Fazendo login...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // Testar rota de transações
    console.log('📋 Testando /financial/transactions...');
    const transactionsResponse = await axios.get(`${API_BASE_URL}/financial/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Transações carregadas com sucesso!');
    console.log('📊 Total de transações:', transactionsResponse.data.length);
    
    if (transactionsResponse.data.length > 0) {
      console.log('📋 Primeira transação:', {
        id: transactionsResponse.data[0].id,
        event_title: transactionsResponse.data[0].event_title,
        total_amount: transactionsResponse.data[0].total_amount,
        products_total: transactionsResponse.data[0].products_total
      });
    }
    
    // Testar rota de resumo
    console.log('📋 Testando /financial/summary...');
    const summaryResponse = await axios.get(`${API_BASE_URL}/financial/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Resumo financeiro carregado com sucesso!');
    console.log('📊 Receita total:', summaryResponse.data.totalRevenue);
    console.log('📊 Total de transações:', summaryResponse.data.totalTransactions);
    
  } catch (error) {
    console.error('❌ Erro ao testar financeiro:', error.response?.data || error.message);
  }
}

testarFinanceiro(); 