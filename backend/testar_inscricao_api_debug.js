const axios = require('axios');

// Configuração da API
// const API_URL = 'https://siteigreja-1.onrender.com';
const API_URL = 'http://localhost:3005'; // Para teste local

async function testarInscricaoAPI() {
    try {
        console.log('🔍 Testando API de inscrição...\n');

        // Dados de teste para inscrição
        const dadosInscricao = {
            participantes: [
                {
                    name: 'Teste Usuario',
                    email: 'teste@email.com',
                    phone: '11999999999',
                    cpf: '12345678901'
                }
            ],
            payment_method: 'mercadopago',
            lot_id: 1, // Assumindo que existe um lote com ID 1
            products: []
        };

        console.log('📦 Dados da requisição:', JSON.stringify(dadosInscricao, null, 2));
        console.log('🌐 URL:', `${API_URL}/api/events/1/inscricao-unificada`);

        // Fazer requisição para a API
        const response = await axios.post(
            `${API_URL}/api/events/1/inscricao-unificada`,
            dadosInscricao,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ Sucesso!');
        console.log('📋 Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ Erro na API:');
        console.log('📋 Status:', error.response?.status);
        console.log('📄 Dados do erro:', error.response?.data);
        console.log('🔍 Mensagem:', error.message);
        
        if (error.response?.data?.stack) {
            console.log('📚 Stack trace:');
            console.log(error.response.data.stack);
        }
    }
}

// Primeiro vamos testar se conseguimos buscar o evento
async function testarEventoExiste() {
    try {
        console.log('🔍 Verificando se o evento existe...\n');
        
        const response = await axios.get(`${API_URL}/api/events/1`);
        console.log('✅ Evento encontrado!');
        console.log('📋 Título:', response.data.title);
        console.log('📋 Status:', response.data.status);
        
        return true;
    } catch (error) {
        console.log('❌ Erro ao buscar evento:');
        console.log('📋 Status:', error.response?.status);
        console.log('📄 Dados do erro:', error.response?.data);
        
        return false;
    }
}

// Função principal
async function main() {
    console.log('🚀 Iniciando testes da API LOCAL...\n');
    
    // Primeiro teste: verificar se o evento existe
    const eventoExiste = await testarEventoExiste();
    
    if (eventoExiste) {
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Segundo teste: testar inscrição
        await testarInscricaoAPI();
    } else {
        console.log('❌ Não é possível testar inscrição - evento não encontrado');
    }
    
    console.log('\n🏁 Testes concluídos.');
}

main(); 