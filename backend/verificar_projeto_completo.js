const { db } = require('./src/database/db');
const axios = require('axios');

console.log('🔍 VERIFICAÇÃO COMPLETA DO PROJETO');
console.log('====================================');

async function verificarProjetoCompleto() {
  try {
    console.log('📋 1. VERIFICANDO BANCO DE DADOS...');
    
    // Verificar tabelas principais
    const tabelas = ['events', 'lots', 'registrations', 'users', 'payments'];
    const tabelasExistentes = [];
    
    for (const tabela of tabelas) {
      const existe = await db.schema.hasTable(tabela);
      tabelasExistentes.push({ nome: tabela, existe });
      console.log(`   ${existe ? '✅' : '❌'} Tabela ${tabela}: ${existe ? 'EXISTE' : 'NÃO EXISTE'}`);
    }
    
    console.log('\n📋 2. VERIFICANDO EVENTOS...');
    
    const eventos = await db('events').select('*').limit(3);
    console.log(`📊 Total de eventos: ${eventos.length}`);
    eventos.forEach(evento => {
      console.log(`   - ${evento.title} (ID: ${evento.id}, Status: ${evento.status})`);
    });
    
    console.log('\n📋 3. VERIFICANDO LOTES...');
    
    const lotes = await db('lots').select('*').limit(3);
    console.log(`📊 Total de lotes: ${lotes.length}`);
    lotes.forEach(lote => {
      console.log(`   - ${lote.name} (Preço: R$ ${lote.price}, Evento: ${lote.event_id})`);
    });
    
    console.log('\n📋 4. VERIFICANDO INSCRIÇÕES...');
    
    const inscricoes = await db('registrations').select('*').limit(3);
    console.log(`📊 Total de inscrições: ${inscricoes.length}`);
    inscricoes.forEach(inscricao => {
      console.log(`   - ${inscricao.name} (${inscricao.email}, Status: ${inscricao.status})`);
    });
    
    console.log('\n📋 5. VERIFICANDO MERCADO PAGO...');
    
    const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
    
    try {
      const mpResponse = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Mercado Pago: CONECTADO');
      console.log(`📊 Métodos disponíveis: ${mpResponse.data.length}`);
      
    } catch (mpError) {
      console.log('❌ Mercado Pago: ERRO DE CONEXÃO');
      console.log(`📋 Erro: ${mpError.response?.data?.message || mpError.message}`);
    }
    
    console.log('\n📋 6. VERIFICANDO BACKEND...');
    
    try {
      const backendResponse = await axios.get('https://siteigreja-1.onrender.com/api/events', {
        timeout: 10000
      });
      
      console.log('✅ Backend: ONLINE');
      console.log(`📊 Status: ${backendResponse.status}`);
      
    } catch (backendError) {
      console.log('❌ Backend: OFFLINE');
      console.log(`📋 Erro: ${backendError.message}`);
    }
    
    console.log('\n📋 7. VERIFICANDO FRONTEND...');
    
    try {
      const frontendResponse = await axios.get('https://igrejacemchurch.org', {
        timeout: 10000
      });
      
      console.log('✅ Frontend: ONLINE');
      console.log(`📊 Status: ${frontendResponse.status}`);
      
    } catch (frontendError) {
      console.log('❌ Frontend: OFFLINE');
      console.log(`📋 Erro: ${frontendError.message}`);
    }
    
    console.log('\n🎯 RESUMO DO PROJETO:');
    
    const problemas = [];
    const sucessos = [];
    
    // Verificar tabelas
    tabelasExistentes.forEach(tabela => {
      if (tabela.existe) {
        sucessos.push(`Tabela ${tabela.nome} existe`);
      } else {
        problemas.push(`Tabela ${tabela.nome} não existe`);
      }
    });
    
    // Verificar dados
    if (eventos.length > 0) sucessos.push('Eventos cadastrados');
    else problemas.push('Nenhum evento cadastrado');
    
    if (lotes.length > 0) sucessos.push('Lotes cadastrados');
    else problemas.push('Nenhum lote cadastrado');
    
    console.log('\n✅ SUCESSOS:');
    sucessos.forEach(sucesso => console.log(`   - ${sucesso}`));
    
    if (problemas.length > 0) {
      console.log('\n❌ PROBLEMAS:');
      problemas.forEach(problema => console.log(`   - ${problema}`));
    }
    
    console.log('\n🎯 STATUS GERAL:');
    if (problemas.length === 0) {
      console.log('🟢 PROJETO FUNCIONANDO PERFEITAMENTE!');
    } else if (problemas.length <= 2) {
      console.log('🟡 PROJETO FUNCIONANDO COM PEQUENOS PROBLEMAS');
    } else {
      console.log('🔴 PROJETO COM PROBLEMAS SIGNIFICATIVOS');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

verificarProjetoCompleto(); 