const { db } = require('./src/database/db');

console.log('🧪 CRIANDO INSCRIÇÃO DE TESTE');
console.log('==============================');

async function criarInscricaoTeste() {
  try {
    console.log('📋 Passo 1: Verificando eventos disponíveis...');
    
    const eventos = await db('events').select('*').limit(3);
    console.log(`📊 Eventos encontrados: ${eventos.length}`);
    
    if (eventos.length === 0) {
      console.log('❌ Nenhum evento encontrado! Criando evento de teste...');
      
      const [eventId] = await db('events').insert({
        title: 'EVENTO TESTE INSCRIÇÃO',
        description: 'Evento para testar inscrições',
        date: '2025-12-31 19:00:00',
        location: 'Igreja CEM',
        slug: 'evento-teste-inscricao',
        status: 'active',
        has_payment: false
      }).returning('id');
      
      console.log(`✅ Evento criado com ID: ${eventId}`);
      
      // Criar lote
      const [lotId] = await db('lots').insert({
        event_id: eventId,
        name: 'LOTE TESTE',
        price: 0,
        quantity: 100,
        status: 'active',
        is_free: true
      }).returning('id');
      
      console.log(`✅ Lote criado com ID: ${lotId}`);
      
      eventos.push({ id: eventId, title: 'EVENTO TESTE INSCRIÇÃO' });
    }
    
    const evento = eventos[0];
    console.log(`📅 Usando evento: ${evento.title} (ID: ${evento.id})`);
    
    console.log('\n📋 Passo 2: Criando inscrição de teste...');
    
    // Buscar lote do evento
    const lotes = await db('lots').where('event_id', evento.id).select('*');
    const lote = lotes[0];
    
    if (!lote) {
      console.log('❌ Nenhum lote encontrado! Criando lote...');
      const [lotId] = await db('lots').insert({
        event_id: evento.id,
        name: 'LOTE TESTE',
        price: 0,
        quantity: 100,
        status: 'active',
        is_free: true
      }).returning('id');
      console.log(`✅ Lote criado com ID: ${lotId}`);
    }
    
    // Criar inscrição de teste
    const inscricaoData = {
      event_id: evento.id,
      lot_id: lote ? lote.id : 1,
      name: 'João Silva Teste',
      email: 'joao.teste@email.com',
      phone: '11999999999',
      cpf: '12345678901',
      address: 'Rua Teste, 123',
      registration_code: 'TEST-001',
      status: 'confirmed',
      payment_status: 'paid',
      form_data: JSON.stringify({
        nome: 'João Silva Teste',
        email: 'joao.teste@email.com',
        telefone: '11999999999',
        cpf: '12345678901',
        endereco: 'Rua Teste, 123',
        participantes: [
          {
            name: 'João Silva Teste',
            email: 'joao.teste@email.com',
            phone: '11999999999'
          }
        ]
      }),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [inscricaoId] = await db('registrations').insert(inscricaoData).returning('id');
    
    console.log('✅ Inscrição criada com sucesso!');
    console.log(`📊 ID da inscrição: ${inscricaoId}`);
    console.log(`👤 Nome: ${inscricaoData.name}`);
    console.log(`📧 Email: ${inscricaoData.email}`);
    console.log(`📱 Telefone: ${inscricaoData.phone}`);
    console.log(`📦 Form Data: ${inscricaoData.form_data.substring(0, 50)}...`);
    
    console.log('\n📋 Passo 3: Verificando se a inscrição foi salva...');
    
    const inscricaoSalva = await db('registrations').where('id', inscricaoId).first();
    
    console.log('✅ Inscrição encontrada no banco:');
    console.log(`   ID: ${inscricaoSalva.id}`);
    console.log(`   Nome: ${inscricaoSalva.name}`);
    console.log(`   Email: ${inscricaoSalva.email}`);
    console.log(`   Status: ${inscricaoSalva.status}`);
    console.log(`   Payment Status: ${inscricaoSalva.payment_status}`);
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('✅ Inscrição criada com dados completos');
    console.log('✅ Agora teste o dashboard para ver se aparece');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

criarInscricaoTeste(); 