const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE UPLOAD');
console.log('=========================\n');

async function diagnosticarUpload() {
    try {
        // 1. Verificar se a pasta uploads existe
        console.log('📁 [1/4] Verificando pasta uploads...');
        const uploadsPath = path.join(__dirname, 'src', 'uploads');
        console.log('📍 Caminho:', uploadsPath);
        
        if (!fs.existsSync(uploadsPath)) {
            console.log('❌ Pasta uploads não existe! Criando...');
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('✅ Pasta uploads criada');
        } else {
            console.log('✅ Pasta uploads existe');
        }
        
        // 2. Verificar permissões
        console.log('\n🔐 [2/4] Verificando permissões...');
        try {
            const testFile = path.join(uploadsPath, 'test.txt');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            console.log('✅ Permissões OK');
        } catch (error) {
            console.log('❌ Erro de permissões:', error.message);
        }
        
        // 3. Verificar estrutura de pastas
        console.log('\n📂 [3/4] Verificando estrutura...');
        const eventsPath = path.join(uploadsPath, 'events');
        if (!fs.existsSync(eventsPath)) {
            console.log('❌ Pasta events não existe! Criando...');
            fs.mkdirSync(eventsPath, { recursive: true });
            console.log('✅ Pasta events criada');
        } else {
            console.log('✅ Pasta events existe');
        }
        
        // 4. Listar arquivos existentes
        console.log('\n📋 [4/4] Arquivos existentes:');
        try {
            const files = fs.readdirSync(uploadsPath);
            if (files.length === 0) {
                console.log('📁 Pasta vazia');
            } else {
                files.forEach(file => {
                    const filePath = path.join(uploadsPath, file);
                    const stats = fs.statSync(filePath);
                    console.log(`📄 ${file} - ${stats.size} bytes`);
                });
            }
        } catch (error) {
            console.log('❌ Erro ao listar arquivos:', error.message);
        }
        
        console.log('\n✅ Diagnóstico concluído!');
        
    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error.message);
    }
}

diagnosticarUpload(); 