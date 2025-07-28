const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

console.log('🧪 TESTE SIMPLES DE UPLOAD');
console.log('===========================\n');

async function testarUpload() {
    try {
        const API_URL = 'https://siteigreja-1.onrender.com';
        
        // 1. Testar se a API está online
        console.log('📡 [1/3] Testando API...');
        try {
            await axios.get(`${API_URL}/api/events`);
            console.log('✅ API está online');
        } catch (error) {
            console.log('❌ API offline:', error.message);
            return;
        }
        
        // 2. Criar arquivo de teste simples
        console.log('\n📝 [2/3] Criando arquivo de teste...');
        const testFile = 'test-image.txt';
        fs.writeFileSync(testFile, 'teste');
        console.log('✅ Arquivo de teste criado');
        
        // 3. Testar upload
        console.log('\n📤 [3/3] Testando upload...');
        
        const formData = new FormData();
        formData.append('image', fs.createReadStream(testFile));
        formData.append('folder', 'events');
        
        try {
            const response = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 30000
            });
            
            console.log('✅ Upload funcionou!');
            console.log('📄 Resposta:', response.data);
            console.log('🔗 URL:', response.data.url);
            
        } catch (error) {
            console.log('❌ Upload falhou:');
            console.log('📋 Status:', error.response?.status);
            console.log('📄 Erro:', error.response?.data);
            console.log('📚 Stack:', error.response?.data?.stack);
        }
        
        // Limpar arquivo de teste
        fs.unlinkSync(testFile);
        
    } catch (error) {
        console.log('❌ Erro geral:', error.message);
    }
}

testarUpload(); 