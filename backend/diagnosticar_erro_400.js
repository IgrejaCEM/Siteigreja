const axios = require('axios');

console.log('🔍 DIAGNÓSTICO DO ERRO 400');
console.log('===========================\n');

async function diagnosticarErro400() {
    try {
        const API_URL = 'https://siteigreja-1.onrender.com';
        
        // 1. Verificar evento
        console.log('📋 [1/4] Verificando evento...');
        const evento = await axios.get(`${API_URL}/api/events/1`);
        console.log('✅ Evento:', evento.data.title);
        console.log('📊 Status:', evento.data.status);
        
        // 2. Verificar lotes do evento
        console.log('\n🎫 [2/4] Verificando lotes...');
        try {
            const lotes = await axios.get(`${API_URL}/api/events/1/lots`);
            console.log('✅ Lotes encontrados:', lotes.data.length);
            
            if (lotes.data.length > 0) {
                lotes.data.forEach((lote, index) => {
                    console.log(`📋 Lote ${index + 1}:`);
                    console.log(`  - ID: ${lote.id}`);
                    console.log(`  - Nome: ${lote.name}`);
                    console.log(`  - Preço: R$ ${lote.price}`);
                    console.log(`  - Quantidade: ${lote.quantity}`);
                    console.log(`  - Status: ${lote.status}`);
                    console.log(`  - Datas: ${lote.start_date} até ${lote.end_date}`);
                });
            } else {
                console.log('❌ Nenhum lote encontrado! Este é o problema!');
                return;
            }
        } catch (loteError) {
            console.log('❌ Erro ao buscar lotes:', loteError.response?.status);
            console.log('📄 Detalhes:', loteError.response?.data);
        }
        
        // 3. Testar inscrição com dados mínimos
        console.log('\n🧪 [3/4] Testando inscrição com dados básicos...');
        
        const dadosBasicos = {
            participantes: [
                {
                    name: 'Teste 400',
                    email: 'teste400@email.com',
                    phone: '11999999999'
                }
            ],
            lot_id: 1,
            products: []
        };
        
        try {
            const response = await axios.post(
                `${API_URL}/api/events/1/inscricao-unificada`,
                dadosBasicos,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );
            
            console.log('✅ Inscrição funcionou!');
            console.log('📄 Resposta:', response.data.message);
            
        } catch (error) {
            console.log('❌ Erro 400 detalhado:');
            console.log('📋 Status:', error.response?.status);
            console.log('📄 Erro:', error.response?.data?.error);
            console.log('📋 Detalhes:', error.response?.data?.details);
            
            if (error.response?.data?.stack) {
                console.log('\n📚 Stack trace:');
                console.log(error.response.data.stack);
            }
        }
        
        // 4. Testar diferentes lot_ids
        console.log('\n🔄 [4/4] Testando diferentes lot_ids...');
        
        for (let lotId = 1; lotId <= 3; lotId++) {
            try {
                const dadosTeste = {
                    participantes: [
                        {
                            name: `Teste Lote ${lotId}`,
                            email: `teste.lote${lotId}@email.com`,
                            phone: '11999999999'
                        }
                    ],
                    lot_id: lotId,
                    products: []
                };
                
                const response = await axios.post(
                    `${API_URL}/api/events/1/inscricao-unificada`,
                    dadosTeste,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    }
                );
                
                console.log(`✅ Lote ID ${lotId} funcionou!`);
                break;
                
            } catch (error) {
                console.log(`❌ Lote ID ${lotId} falhou:`, error.response?.data?.error);
            }
        }
        
    } catch (error) {
        console.log('❌ Erro geral:', error.message);
    }
}

diagnosticarErro400(); 