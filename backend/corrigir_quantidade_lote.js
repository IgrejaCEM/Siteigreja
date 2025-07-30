const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔧 CORRIGINDO QUANTIDADE DO LOTE 3');
console.log('====================================');

const corrigirQuantidadeLote = async () => {
  try {
    console.log('📋 [1/4] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/4] Verificando lote atual...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    const lots = eventResponse.data.lots || [];
    const lote3 = lots.find(lot => lot.id === 3);
    
    if (!lote3) {
      console.log('❌ Lote 3 não encontrado!');
      return;
    }
    
    console.log('📊 Lote 3 atual:');
    console.log('   - Nome:', lote3.name);
    console.log('   - Preço:', lote3.price);
    console.log('   - Quantidade atual:', lote3.quantity);
    console.log('   - Status:', lote3.status);
    
    console.log('📋 [3/4] Atualizando quantidade para 100...');
    const updateData = {
      name: lote3.name,
      price: lote3.price,
      quantity: 100, // Aumentar para 100 vagas
      start_date: lote3.start_date,
      end_date: lote3.end_date,
      status: lote3.status
    };
    
    console.log('📦 Dados de atualização:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await axios.put(
      `${API_BASE_URL}/admin/lots/${lote3.id}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Lote atualizado com sucesso!');
    console.log('📋 Resposta:', updateResponse.data);
    
    console.log('📋 [4/4] Verificando lote após atualização...');
    const eventResponse2 = await axios.get(`${API_BASE_URL}/events/13`);
    const lots2 = eventResponse2.data.lots || [];
    const lote3Updated = lots2.find(lot => lot.id === 3);
    
    console.log('📊 Lote 3 após atualização:');
    console.log('   - Nome:', lote3Updated.name);
    console.log('   - Preço:', lote3Updated.price);
    console.log('   - Quantidade nova:', lote3Updated.quantity);
    console.log('   - Status:', lote3Updated.status);
    
  } catch (error) {
    console.log('❌ Erro ao corrigir lote:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
    console.log('📋 Dados completos do erro:', JSON.stringify(error.response?.data, null, 2));
  }
};

corrigirQuantidadeLote(); 