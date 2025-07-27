const axios = require('axios');

console.log('🚀 SETUP COMPLETO DO BANCO - Via API');
console.log('====================================\n');

async function setupCompletoViaAPI() {
    try {
        console.log('🔧 Executando setup completo do banco...\n');
        
        const url = 'https://siteigreja-1.onrender.com/api/admin/setup-database-complete';
        
        console.log('📡 Chamando:', url);
        console.log('⏳ Aguardando resposta (pode demorar um pouco)...\n');
        
        const response = await axios.post(url, {}, {
            timeout: 120000, // 2 minutos
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ SETUP EXECUTADO COM SUCESSO!');
        console.log('📋 Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('\n🎉 BANCO CONFIGURADO COMPLETAMENTE!');
            
            // Aguardar um pouco e testar a API de eventos
            console.log('\n⏳ Aguardando 5 segundos...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Testar listagem de eventos
            console.log('\n📋 Testando listagem de eventos...');
            await testarEventos();
            
            // Testar inscrição
            console.log('\n🧪 Testando inscrição...');
            await testarInscricao();
        }
        
    } catch (error) {
        console.log('❌ ERRO no setup:');
        console.log('📋 Status:', error.response?.status);
        console.log('📄 Dados:', error.response?.data);
        console.log('🔍 Mensagem:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            console.log('⏰ Timeout - o setup pode estar funcionando, aguarde mais um pouco');
        }
    }
}

async function testarEventos() {
    try {
        const response = await axios.get('https://siteigreja-1.onrender.com/api/events', {
            timeout: 10000
        });
        
        console.log('✅ EVENTOS ENCONTRADOS!');
        console.log('📊 Quantidade:', response.data.length);
        
        if (response.data.length > 0) {
            const evento = response.data[0];
            console.log('📋 Primeiro evento:');
            console.log(`  - ID: ${evento.id}`);
            console.log(`  - Título: ${evento.title}`);
            console.log(`  - Status: ${evento.status}`);
        }
        
    } catch (error) {
        console.log('❌ Erro ao testar eventos:', error.response?.status || error.message);
    }
}

async function testarInscricao() {
    try {
        // Pegar lista de eventos primeiro
        const eventos = await axios.get('https://siteigreja-1.onrender.com/api/events');
        
        if (eventos.data.length === 0) {
            console.log('❌ Nenhum evento disponível para teste');
            return;
        }
        
        const evento = eventos.data[0];
        console.log(`📋 Testando inscrição no evento: ${evento.title} (ID: ${evento.id})`);
        
        const dadosTeste = {
            participantes: [
                {
                    name: 'Teste Setup Completo',
                    email: 'teste.setup@email.com',
                    phone: '11999999999'
                }
            ],
            lot_id: 1,
            payment_method: 'free',
            products: []
        };
        
        const response = await axios.post(
            `https://siteigreja-1.onrender.com/api/events/${evento.id}/inscricao-unificada`,
            dadosTeste,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        console.log('🎉 INSCRIÇÃO FUNCIONOU PERFEITAMENTE!');
        console.log('📋 Status:', response.status);
        console.log('📄 Mensagem:', response.data.message);
        console.log('📊 Status da inscrição:', response.data.status);
        
        console.log('\n🎊 PARABÉNS! Todo o sistema está funcionando!');
        console.log('✅ Banco configurado');
        console.log('✅ Eventos criados');
        console.log('✅ Inscrições funcionando');
        console.log('\n🌐 Agora você pode testar em: https://igrejacemchurch.org');
        
    } catch (testError) {
        console.log('❌ Teste de inscrição falhou:');
        console.log('📋 Status:', testError.response?.status);
        console.log('📄 Erro:', testError.response?.data?.details || testError.message);
        
        if (testError.response?.data?.stack) {
            console.log('\n📚 Stack trace:');
            console.log(testError.response.data.stack);
        }
    }
}

// Executar setup completo
setupCompletoViaAPI(); 