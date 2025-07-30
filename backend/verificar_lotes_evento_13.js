const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 VERIFICANDO LOTES DO EVENTO 13');
console.log('==================================');

const verificarLotes = async () => {
  try {
    console.log('📋 [1/3] Verificando evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    console.log('📋 Status do evento:', eventResponse.data.status);
    
    console.log('📋 [2/3] Verificando lotes...');
    const lots = eventResponse.data.lots || [];
    console.log(`📊 ${lots.length} lotes encontrados:`);
    
    lots.forEach((lot, index) => {
      console.log(`\n  Lote ${index + 1}:`);
      console.log(`    ID: ${lot.id}`);
      console.log(`    Nome: ${lot.name}`);
      console.log(`    Preço: ${lot.price} (tipo: ${typeof lot.price})`);
      console.log(`    Quantidade: ${lot.quantity}`);
      console.log(`    Status: ${lot.status}`);
      console.log(`    Início: ${lot.start_date}`);
      console.log(`    Fim: ${lot.end_date}`);
      console.log(`    É gratuito: ${lot.price === 0 || lot.price === '0'}`);
    });
    
    console.log('\n📋 [3/3] Verificando lote específico ID 3...');
    const lote3 = lots.find(lot => lot.id === 3);
    
    if (lote3) {
      console.log('✅ Lote 3 encontrado:');
      console.log('   - Nome:', lote3.name);
      console.log('   - Preço:', lote3.price);
      console.log('   - Quantidade:', lote3.quantity);
      console.log('   - Status:', lote3.status);
      console.log('   - Vagas disponíveis:', lote3.quantity > 0 ? 'Sim' : 'Não');
    } else {
      console.log('❌ Lote 3 NÃO encontrado!');
      console.log('📋 IDs disponíveis:', lots.map(l => l.id));
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar lotes:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarLotes(); 