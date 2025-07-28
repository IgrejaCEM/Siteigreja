const axios = require('axios');

console.log('🔍 VERIFICANDO UPLOAD VIA API');
console.log('==============================\n');

async function verificarUpload() {
    try {
        const API_URL = 'https://siteigreja-1.onrender.com';
        
        console.log('📡 Chamando rota de verificação...');
        
        const response = await axios.post(`${API_URL}/api/admin/check-upload`, {}, {
            timeout: 30000
        });
        
        console.log('✅ Verificação concluída!');
        console.log('📄 Resposta:', response.data);
        
        if (response.data.success) {
            console.log('✅ Upload deve funcionar agora!');
            console.log('📁 Pasta uploads:', response.data.uploadsPath);
            console.log('📁 Pasta events:', response.data.eventsPath);
            console.log('📋 Arquivos:', response.data.files);
        }
        
    } catch (error) {
        console.log('❌ Erro na verificação:', error.message);
        if (error.response) {
            console.log('📋 Status:', error.response.status);
            console.log('📄 Dados:', error.response.data);
        }
    }
}

verificarUpload(); 