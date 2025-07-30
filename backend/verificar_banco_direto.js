const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 VERIFICANDO BANCO DE DADOS DIRETAMENTE');
console.log('==========================================');

const verificarBancoDireto = async () => {
  try {
    console.log('📋 [1/3] Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/3] Verificando tabela event_products...');
    
    // Testar uma consulta SQL direta
    const sqlResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📊 Status da consulta: ${sqlResponse.status}`);
    console.log(`📊 Produtos encontrados: ${sqlResponse.data.length}`);
    
    if (sqlResponse.data.length > 0) {
      sqlResponse.data.forEach((product, index) => {
        console.log(`\n  Produto ${index + 1}:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Nome: ${product.name}`);
        console.log(`    Event ID: ${product.event_id}`);
        console.log(`    Ativo: ${product.is_active}`);
        console.log(`    Criado em: ${product.created_at}`);
      });
    }
    
    console.log('\n📋 [3/3] Testando criação de um produto simples...');
    
    const produtoTeste = {
      name: 'Produto Teste',
      description: 'Produto para teste',
      price: 10.00,
      event_id: 13,
      is_active: true,
      image_url: 'https://via.placeholder.com/300x200/ff0000/ffffff?text=Teste',
      stock: 10
    };
    
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/event-products`, produtoTeste, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Produto criado com sucesso! ID: ${createResponse.data.id}`);
      
      // Verificar se aparece na lista
      const checkResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`📊 Produtos após criação: ${checkResponse.data.length}`);
      
    } catch (error) {
      console.log(`❌ Erro ao criar produto teste:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Mensagem: ${error.response?.data?.message || error.message}`);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

verificarBancoDireto(); 