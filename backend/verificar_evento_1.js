const axios = require('axios');

console.log('🔍 VERIFICANDO EVENTO ID 1');
console.log('===========================\n');

async function verificarEvento1() {
    try {
        const API_URL = 'https://siteigreja-1.onrender.com';
        
        // 1. Testar API geral
        console.log('📡 [1/3] Testando API...');
        try {
            const response = await axios.get(`${API_URL}/api/events`);
            console.log('✅ API funcionando');
            console.log('📊 Eventos encontrados:', response.data.length);
        } catch (error) {
            console.log('❌ Erro na API:', error.message);
            return;
        }
        
        // 2. Testar evento ID 1
        console.log('\n🎯 [2/3] Testando evento ID 1...');
        try {
            const evento = await axios.get(`${API_URL}/api/events/1`);
            console.log('✅ Evento ID 1 encontrado!');
            console.log('📋 Título:', evento.data.title);
            console.log('📅 Data:', evento.data.date);
            console.log('📍 Local:', evento.data.location);
        } catch (error) {
            console.log('❌ Evento ID 1 não encontrado');
            console.log('📋 Status:', error.response?.status);
            console.log('📄 Erro:', error.response?.data);
        }
        
        // 3. Testar rota admin
        console.log('\n👑 [3/3] Testando rota admin...');
        try {
            const adminEvento = await axios.get(`${API_URL}/api/admin/events/1`);
            console.log('✅ Rota admin funcionando!');
            console.log('📋 Título:', adminEvento.data.title);
        } catch (error) {
            console.log('❌ Rota admin falhou');
            console.log('📋 Status:', error.response?.status);
            console.log('📄 Erro:', error.response?.data);
        }
        
    } catch (error) {
        console.log('❌ Erro geral:', error.message);
    }
}

verificarEvento1(); 