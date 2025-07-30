const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🛍️ CRIANDO PRODUTOS DE TESTE (VERSÃO CORRIGIDA)');
console.log('==================================================');

const criarProdutosTesteCorrigido = async () => {
  try {
    console.log('📋 [1/3] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/3] Criando produtos de teste...');
    
    const produtosTeste = [
      {
        name: 'Camiseta do Evento',
        description: 'Camiseta exclusiva do evento com design especial',
        price: 25.00,
        event_id: 13,
        is_active: true,
        image_url: 'https://via.placeholder.com/300x200/1976d2/ffffff?text=Camiseta+Evento',
        stock: 50
      },
      {
        name: 'Caneca Personalizada',
        description: 'Caneca com logo do evento, perfeita para recordação',
        price: 15.50,
        event_id: 13,
        is_active: true,
        image_url: 'https://via.placeholder.com/300x200/ff9800/ffffff?text=Caneca+Evento',
        stock: 30
      },
      {
        name: 'Kit Completo',
        description: 'Kit com camiseta, caneca e adesivo do evento',
        price: 35.00,
        event_id: 13,
        is_active: true,
        image_url: 'https://via.placeholder.com/300x200/4caf50/ffffff?text=Kit+Completo',
        stock: 20
      }
    ];
    
    for (let i = 0; i < produtosTeste.length; i++) {
      const produto = produtosTeste[i];
      console.log(`\n📦 Criando produto ${i + 1}: ${produto.name}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/event-products`, produto, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Produto criado com sucesso! ID: ${response.data.id}`);
        console.log(`   Nome: ${response.data.name}`);
        console.log(`   Preço: R$ ${response.data.price}`);
        console.log(`   Event ID: ${response.data.event_id}`);
        console.log(`   Ativo: ${response.data.is_active}`);
        
      } catch (error) {
        console.log(`❌ Erro ao criar produto ${produto.name}:`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Mensagem: ${error.response?.data?.message || error.message}`);
        console.log(`   Dados enviados:`, JSON.stringify(produto, null, 2));
      }
    }
    
    console.log('\n📋 [3/3] Verificando produtos criados...');
    const produtosResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const produtosEvento13 = produtosResponse.data.filter(p => p.event_id === 13);
    console.log(`📊 Total de produtos do evento 13: ${produtosEvento13.length}`);
    
    produtosEvento13.forEach((produto, index) => {
      console.log(`\n  Produto ${index + 1}:`);
      console.log(`    ID: ${produto.id}`);
      console.log(`    Nome: ${produto.name}`);
      console.log(`    Preço: R$ ${produto.price}`);
      console.log(`    Ativo: ${produto.is_active}`);
    });
    
    console.log('\n🎉 Processo concluído! Agora teste a home page para ver os produtos.');
    
  } catch (error) {
    console.log('❌ Erro geral:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

criarProdutosTesteCorrigido(); 