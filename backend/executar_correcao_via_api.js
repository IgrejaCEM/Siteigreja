const axios = require('axios');

console.log('🚨 CORREÇÃO EMERGENCIAL - Via API');
console.log('===================================\n');

async function corrigirBancoViaAPI() {
    try {
        console.log('🔧 Executando correção do banco via API...\n');
        
        const url = 'https://siteigreja-1.onrender.com/api/admin/fix-database-emergency';
        
        console.log('📡 Chamando:', url);
        console.log('⏳ Aguardando resposta...\n');
        
        const response = await axios.post(url, {}, {
            timeout: 60000, // 60 segundos
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ CORREÇÃO EXECUTADA COM SUCESSO!');
        console.log('📋 Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('\n🎉 BANCO CORRIGIDO!');
            console.log('✅ Agora a API de inscrição deve funcionar!');
            
            // Testar inscrição
            console.log('\n🧪 Testando inscrição...');
            await testarInscricao();
        }
        
    } catch (error) {
        console.log('❌ ERRO na correção:');
        console.log('📋 Status:', error.response?.status);
        console.log('📄 Dados:', error.response?.data);
        console.log('🔍 Mensagem:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            console.log('⏰ Timeout - a correção pode estar funcionando, aguarde mais um pouco');
        }
    }
}

async function testarInscricao() {
    try {
        const dadosTeste = {
            participantes: [
                {
                    name: 'Teste Pós-Correção',
                    email: 'teste.pos.correcao@email.com',
                    phone: '11999999999'
                }
            ],
            lot_id: 1,
            payment_method: 'free',
            products: []
        };
        
        const response = await axios.post(
            'https://siteigreja-1.onrender.com/api/events/1/inscricao-unificada',
            dadosTeste,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        console.log('✅ TESTE DE INSCRIÇÃO PASSOU!');
        console.log('📋 Status:', response.status);
        console.log('📄 Resposta:', response.data.message);
        
    } catch (testError) {
        console.log('❌ Teste de inscrição ainda falhou:');
        console.log('📋 Status:', testError.response?.status);
        console.log('📄 Erro:', testError.response?.data?.details || testError.message);
    }
}

// Executar correção
corrigirBancoViaAPI(); 