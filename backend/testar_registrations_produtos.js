const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('📋 Testando registrations com produtos...');

async function testarRegistrationsProdutos() {
  try {
    console.log('📋 Fazendo login...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // Testar rota de registrations com produtos
    console.log('📋 Testando /admin/registrations-with-products...');
    const registrationsResponse = await axios.get(`${API_BASE_URL}/admin/registrations-with-products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Registrations com produtos carregados com sucesso!');
    console.log('📊 Total de registrations com produtos:', registrationsResponse.data.length);
    
    if (registrationsResponse.data.length > 0) {
      console.log('📋 Primeira registration com produtos:', {
        id: registrationsResponse.data[0].id,
        participant_name: registrationsResponse.data[0].participant_name,
        event_title: registrationsResponse.data[0].event_title,
        products: registrationsResponse.data[0].products
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar registrations com produtos:', error.response?.data || error.message);
  }
}

testarRegistrationsProdutos(); 