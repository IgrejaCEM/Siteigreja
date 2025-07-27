const axios = require('axios');

const API_URL = 'https://siteigreja-1.onrender.com';

async function testarAPICompleta() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DA API');
    console.log('==============================\n');

    // Teste 1: Verificar se a API está respondendo
    try {
        console.log('📡 [1/5] Testando conectividade...');
        const health = await axios.get(`${API_URL}/api/events`, { timeout: 10000 });
        console.log('✅ API online. Eventos encontrados:', health.data.length);
        
        if (health.data.length > 0) {
            console.log('📋 Primeiro evento:', health.data[0].title);
            console.log('📋 ID do primeiro evento:', health.data[0].id);
        }
    } catch (error) {
        console.log('❌ API offline:', error.message);
        return;
    }

    // Teste 2: Verificar evento específico ID 1
    try {
        console.log('\n📋 [2/5] Verificando evento ID 1...');
        const evento1 = await axios.get(`${API_URL}/api/events/1`, { timeout: 10000 });
        console.log('✅ Evento ID 1 existe:', evento1.data.title);
        console.log('📊 Status:', evento1.data.status);
    } catch (error) {
        console.log('❌ Evento ID 1 não encontrado. Status:', error.response?.status);
        
        // Testar outros IDs
        console.log('🔍 Testando outros IDs...');
        for (let id = 2; id <= 5; id++) {
            try {
                const evento = await axios.get(`${API_URL}/api/events/${id}`, { timeout: 5000 });
                console.log(`✅ Evento ID ${id} existe:`, evento.data.title);
                break;
            } catch (e) {
                console.log(`❌ Evento ID ${id} não encontrado`);
            }
        }
    }

    // Teste 3: Verificar lotes
    try {
        console.log('\n🎫 [3/5] Verificando lotes...');
        const lotes = await axios.get(`${API_URL}/api/events/1/lots`, { timeout: 10000 });
        console.log('✅ Lotes encontrados:', lotes.data.length);
        if (lotes.data.length > 0) {
            console.log('📋 Primeiro lote:', lotes.data[0].name, '- ID:', lotes.data[0].id);
        }
    } catch (error) {
        console.log('❌ Lotes não encontrados. Status:', error.response?.status);
    }

    // Teste 4: Verificar estrutura do banco
    try {
        console.log('\n🗄️ [4/5] Verificando estrutura do banco...');
        const estrutura = await axios.post(`${API_URL}/api/admin/fix-database-emergency`, {}, { timeout: 10000 });
        console.log('✅ Estrutura OK. Colunas:', estrutura.data.existingColumns?.length || 'N/A');
    } catch (error) {
        console.log('❌ Erro na estrutura:', error.response?.status);
    }

    // Teste 5: Tentar inscrição com ID correto
    try {
        console.log('\n🧪 [5/5] Testando inscrição...');
        
        // Primeiro pegar o ID correto do evento
        const eventos = await axios.get(`${API_URL}/api/events`);
        const eventoParaTeste = eventos.data[0]; // Usar o primeiro evento
        
        if (!eventoParaTeste) {
            console.log('❌ Nenhum evento disponível para teste');
            return;
        }
        
        console.log(`📋 Testando com evento: ${eventoParaTeste.title} (ID: ${eventoParaTeste.id})`);
        
        const dadosTeste = {
            participantes: [
                {
                    name: 'Teste Final',
                    email: 'teste.final@email.com',
                    phone: '11999999999'
                }
            ],
            lot_id: 1,
            payment_method: 'free',
            products: []
        };
        
        const inscricao = await axios.post(
            `${API_URL}/api/events/${eventoParaTeste.id}/inscricao-unificada`,
            dadosTeste,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        console.log('🎉 INSCRIÇÃO FUNCIONOU!');
        console.log('📋 Status:', inscricao.status);
        console.log('📄 Mensagem:', inscricao.data.message);
        
    } catch (inscricaoError) {
        console.log('❌ Inscrição ainda falhou:');
        console.log('📋 Status:', inscricaoError.response?.status);
        console.log('📄 Erro:', inscricaoError.response?.data?.details || inscricaoError.message);
        
        if (inscricaoError.response?.data?.stack) {
            console.log('\n📚 Stack trace:');
            console.log(inscricaoError.response.data.stack);
        }
    }
    
    console.log('\n📊 DIAGNÓSTICO CONCLUÍDO');
}

testarAPICompleta(); 