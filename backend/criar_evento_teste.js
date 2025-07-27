const { db } = require('./src/database/db');

async function criarEventoTeste() {
    try {
        console.log('🚀 CRIANDO EVENTO DE TESTE');
        console.log('==========================\n');

        // 1. Verificar se a tabela events existe
        const eventsExists = await db.schema.hasTable('events');
        console.log('📋 Tabela events existe:', eventsExists);

        if (!eventsExists) {
            console.log('❌ Tabela events não existe! Executando migrations...');
            return;
        }

        // 2. Verificar eventos existentes
        const existingEvents = await db('events').select('*');
        console.log('📊 Eventos existentes:', existingEvents.length);

        if (existingEvents.length > 0) {
            console.log('✅ Já existem eventos:');
            existingEvents.forEach(event => {
                console.log(`  - ID: ${event.id}, Título: ${event.title}`);
            });
            return;
        }

        // 3. Verificar se a tabela lots existe
        const lotsExists = await db.schema.hasTable('lots');
        console.log('📋 Tabela lots existe:', lotsExists);

        // 4. Criar evento de teste
        console.log('\n🔧 Criando evento de teste...');
        const [eventoId] = await db('events').insert({
            title: 'CONNECT CONF 2025 - TESTE',
            description: 'Evento de teste para verificação da API',
            start_date: '2025-08-01',
            end_date: '2025-08-03',
            location: 'Teste Local',
            status: 'active',
            max_participants: 1000,
            price: 0,
            image_url: '/images_site/banner-home.png',
            created_at: new Date(),
            updated_at: new Date()
        }).returning('id');

        const finalEventId = typeof eventoId === 'object' ? eventoId.id : eventoId;
        console.log('✅ Evento criado com ID:', finalEventId);

        // 5. Criar lote de teste se a tabela lots existir
        if (lotsExists) {
            console.log('\n🎫 Criando lote de teste...');
            const [loteId] = await db('lots').insert({
                event_id: finalEventId,
                name: 'Lote Gratuito',
                description: 'Lote de teste gratuito',
                price: 0,
                quantity: 500,
                start_date: '2025-01-01',
                end_date: '2025-12-31',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            }).returning('id');

            const finalLoteId = typeof loteId === 'object' ? loteId.id : loteId;
            console.log('✅ Lote criado com ID:', finalLoteId);
        }

        // 6. Verificar se foi criado corretamente
        const eventoCriado = await db('events').where('id', finalEventId).first();
        console.log('\n📋 Evento criado:', eventoCriado.title);

        // 7. Testar a API de inscrição
        console.log('\n🧪 Testando API de inscrição...');
        const axios = require('axios');
        
        const dadosTeste = {
            participantes: [
                {
                    name: 'Teste Criação Evento',
                    email: 'teste.evento@email.com',
                    phone: '11999999999'
                }
            ],
            lot_id: 1,
            payment_method: 'free',
            products: []
        };

        try {
            const response = await axios.post(
                `https://siteigreja-1.onrender.com/api/events/${finalEventId}/inscricao-unificada`,
                dadosTeste,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            console.log('🎉 TESTE DE INSCRIÇÃO PASSOU!');
            console.log('📋 Status:', response.status);
            console.log('📄 Resposta:', response.data.message);

        } catch (testError) {
            console.log('❌ Teste ainda falhou:', testError.response?.status);
            console.log('📄 Erro:', testError.response?.data?.details || testError.message);
        }

        console.log('\n✅ EVENTO DE TESTE CRIADO COM SUCESSO!');

    } catch (error) {
        console.error('❌ Erro ao criar evento:', error);
        console.error('Stack:', error.stack);
    } finally {
        await db.destroy();
    }
}

criarEventoTeste(); 