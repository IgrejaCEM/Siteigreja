// backend/src/services/s3Service.js

const fs = require('fs');
const path = require('path');

// Salva a imagem localmente e retorna a URL local
async function uploadToS3(file, folder, options = {}) {
  try {
    console.log('📤 Iniciando upload:', file.originalname);
    
    // Garante que a pasta existe
    const uploadDir = path.join(__dirname, '../uploads', folder);
    console.log('📁 Pasta de destino:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Criando pasta:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gera um nome único para o arquivo
    const timestamp = Date.now();
    const ext = path.extname(file.originalname || 'imagem.jpg');
    const base = path.basename(file.originalname || 'imagem', ext);
    const filename = `${base}-${timestamp}${ext}`;
    const destPath = path.join(uploadDir, filename);
    
    console.log('📄 Arquivo de destino:', destPath);

    // Copia o arquivo de forma assíncrona
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(file.path);
      const writeStream = fs.createWriteStream(destPath);
      
      readStream.on('error', (error) => {
        console.error('❌ Erro ao ler arquivo:', error);
        reject(error);
      });
      
      writeStream.on('error', (error) => {
        console.error('❌ Erro ao escrever arquivo:', error);
        reject(error);
      });
      
      writeStream.on('finish', () => {
        console.log('✅ Arquivo copiado com sucesso');
        resolve();
      });
      
      readStream.pipe(writeStream);
    });

    // Remove o arquivo temporário
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log('🧹 Arquivo temporário removido');
    }

    // Retorna a URL local acessível pelo frontend
    const imageUrl = `/uploads/${folder}/${filename}`;
    console.log('🔗 URL gerada:', imageUrl);
    
    return imageUrl;
    
  } catch (error) {
    console.error('❌ Erro no uploadToS3:', error);
    throw error;
  }
}

module.exports = { uploadToS3 }; 