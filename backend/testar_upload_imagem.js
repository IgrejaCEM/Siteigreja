const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTE DE UPLOAD DE IMAGEM');
console.log('=============================\n');

async function testarUpload() {
    try {
        const API_URL = 'https://siteigreja-1.onrender.com';
        
        // 1. Testar se a API está online
        console.log('📡 [1/3] Testando conectividade...');
        try {
            await axios.get(`${API_URL}/api/events`);
            console.log('✅ API está online');
        } catch (error) {
            console.log('❌ API offline:', error.message);
            return;
        }
        
        // 2. Criar uma imagem de teste
        console.log('\n🖼️ [2/3] Criando imagem de teste...');
        const testImagePath = path.join(__dirname, 'test-image.png');
        
        // Criar uma imagem PNG simples (1x1 pixel)
        const pngHeader = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
            0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x00, 0x01, // width: 1
            0x00, 0x00, 0x00, 0x01, // height: 1
            0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
            0x90, 0x77, 0x53, 0xDE, // CRC
            0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
            0x49, 0x44, 0x41, 0x54, // IDAT
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
            0x00, 0x00, 0x00, 0x00, // IEND chunk length
            0x49, 0x45, 0x4E, 0x44, // IEND
            0xAE, 0x42, 0x60, 0x82  // CRC
        ]);
        
        fs.writeFileSync(testImagePath, pngHeader);
        console.log('✅ Imagem de teste criada');
        
        // 3. Testar upload
        console.log('\n📤 [3/3] Testando upload...');
        
        const formData = new FormData();
        formData.append('image', fs.createReadStream(testImagePath));
        formData.append('folder', 'events');
        
        const response = await axios.post(`${API_URL}/api/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });
        
        console.log('✅ Upload realizado com sucesso!');
        console.log('📄 Resposta:', response.data);
        console.log('🔗 URL da imagem:', response.data.url);
        
        // 4. Testar acesso à imagem
        console.log('\n🔍 [4/4] Testando acesso à imagem...');
        try {
            const imageResponse = await axios.get(`${API_URL}${response.data.url}`, {
                responseType: 'arraybuffer',
                timeout: 10000
            });
            console.log('✅ Imagem acessível!');
            console.log('📊 Tamanho:', imageResponse.data.length, 'bytes');
        } catch (imageError) {
            console.log('❌ Erro ao acessar imagem:', imageError.message);
        }
        
        // Limpar arquivo de teste
        fs.unlinkSync(testImagePath);
        console.log('\n🧹 Arquivo de teste removido');
        
    } catch (error) {
        console.log('❌ Erro no teste:', error.message);
        if (error.response) {
            console.log('📋 Status:', error.response.status);
            console.log('📄 Dados:', error.response.data);
        }
    }
}

testarUpload(); 