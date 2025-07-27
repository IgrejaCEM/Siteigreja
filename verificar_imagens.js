// Script para verificar se as imagens estão na pasta correta
// Execute: node verificar_imagens.js

const fs = require('fs');
const path = require('path');

function verificarImagens() {
  const imagesDir = path.join(__dirname, 'frontend', 'public', 'images_site');
  
  console.log('🔍 Verificando imagens na pasta:', imagesDir);
  console.log('=====================================\n');
  
  // Verificar se a pasta existe
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Pasta images_site não encontrada!');
    console.log('📁 Crie a pasta:', imagesDir);
    return;
  }
  
  console.log('✅ Pasta images_site encontrada\n');
  
  // Listar todas as imagens
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => 
    file.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  
  console.log(`📊 Total de imagens encontradas: ${imageFiles.length}\n`);
  
  // Verificar imagens numeradas (1-16)
  const numberedImages = [];
  for (let i = 1; i <= 16; i++) {
    const found = imageFiles.filter(file => 
      file.match(new RegExp(`^${i}\\.(jpg|jpeg|png|webp)$`, 'i'))
    );
    
    if (found.length > 0) {
      numberedImages.push({ number: i, files: found });
      console.log(`✅ Imagem ${i}: ${found.join(', ')}`);
    } else {
      console.log(`❌ Imagem ${i}: NÃO ENCONTRADA`);
    }
  }
  
  console.log('\n=====================================');
  console.log(`📈 Resumo: ${numberedImages.length}/16 imagens numeradas encontradas`);
  
  if (numberedImages.length < 16) {
    console.log('\n💡 Dicas para resolver:');
    console.log('1. Verifique se as imagens estão nomeadas corretamente (1.jpg, 2.jpg, etc.)');
    console.log('2. Verifique se as extensões estão corretas (.jpg, .jpeg, .png, .webp)');
    console.log('3. Verifique se as imagens estão na pasta frontend/public/images_site/');
    console.log('4. Tente renomear as imagens para garantir que estão corretas');
  } else {
    console.log('\n🎉 Todas as imagens estão presentes!');
    console.log('💡 Se as imagens não aparecem no site:');
    console.log('1. Limpe o cache do navegador (Ctrl+F5)');
    console.log('2. Verifique o console do navegador para erros');
    console.log('3. Verifique se o servidor está servindo os arquivos estáticos');
  }
}

verificarImagens(); 