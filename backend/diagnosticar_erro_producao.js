const axios = require('axios');

const API_URL = 'https://siteigreja-1.onrender.com';

async function diagnosticarErro() {
    console.log('🔍 Diagnosticando erro 500 em produção...\n');

    // Teste 1: Verificar se a API está respondendo
    try {
        console.log('📡 [1/6] Testando conectividade da API...');
        const healthCheck = await axios.get(`${API_URL}/api/events`, { timeout: 10000 });
        console.log('✅ API respondendo. Status:', healthCheck.status);
        console.log('📋 Eventos encontrados:', healthCheck.data.length || 0);
    } catch (error) {
        console.log('❌ Erro na conectividade:', error.message);
        return;
    }

    // Teste 2: Verificar evento específico
    try {
        console.log('\n📋 [2/6] Verificando evento ID 1...');
        const evento = await axios.get(`${API_URL}/api/events/1`, { timeout: 10000 });
        console.log('✅ Evento encontrado:', evento.data.title);
        console.log('📊 Status:', evento.data.status);
    } catch (error) {
        console.log('❌ Erro ao buscar evento:', error.response?.status, error.message);
        return;
    }

    // Teste 3: Verificar lotes do evento
    try {
        console.log('\n🎫 [3/6] Verificando lotes do evento...');
        const lotes = await axios.get(`${API_URL}/api/events/1/lots`, { timeout: 10000 });
        console.log('✅ Lotes encontrados:', lotes.data.length);
        if (lotes.data.length > 0) {
            console.log('📋 Primeiro lote ID:', lotes.data[0].id);
            console.log('📋 Primeiro lote nome:', lotes.data[0].name);
            console.log('📋 Primeiro lote preço:', lotes.data[0].price);
        }
    } catch (error) {
        console.log('❌ Erro ao buscar lotes:', error.response?.status, error.message);
    }

    // Teste 4: Tentar inscrição com dados mínimos
    try {
        console.log('\n🧪 [4/6] Testando inscrição com dados mínimos...');
        const dadosMinimos = {
            participantes: [
                {
                    name: 'Teste API',
                    email: 'teste@test.com',
                    phone: '11999999999'
                }
            ],
            lot_id: 1,
            payment_method: 'free',
            products: []
        };

        const response = await axios.post(
            `${API_URL}/api/events/1/inscricao-unificada`,
            dadosMinimos,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        console.log('✅ Inscrição funcionou! Status:', response.status);
    } catch (error) {
        console.log('❌ Erro na inscrição:');
        console.log('📋 Status:', error.response?.status);
        console.log('📄 Detalhes:', error.response?.data?.details || error.message);
        
        if (error.response?.data?.stack) {
            console.log('\n📚 Stack trace:');
            console.log(error.response.data.stack);
        }
    }

    // Teste 5: Verificar estrutura do banco
    try {
        console.log('\n🗄️ [5/6] Verificando disponibilidade de endpoints...');
        
        // Testar outros endpoints para ver se o problema é específico
        const users = await axios.get(`${API_URL}/api/admin/users`, { 
            timeout: 10000,
            validateStatus: () => true // Aceita qualquer status
        });
        console.log('📋 Endpoint /api/admin/users status:', users.status);
        
    } catch (error) {
        console.log('ℹ️ Outros endpoints também com problemas');
    }

    // Teste 6: Verificar logs do servidor
    console.log('\n📊 [6/6] Resumo do diagnóstico:');
    console.log('- API está online: ✅');
    console.log('- Evento existe: ✅'); 
    console.log('- Lotes disponíveis: ?');
    console.log('- Inscrição funcionando: ❌');
    console.log('\n💡 Possíveis causas:');
    console.log('1. Estrutura do banco em produção ainda não corrigida');
    console.log('2. Variáveis de ambiente faltando');
    console.log('3. Deploy não aplicou as correções');
    console.log('4. Problema específico com PostgreSQL vs SQLite');
}

diagnosticarErro().catch(console.error); 