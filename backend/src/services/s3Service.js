// backend/src/services/s3Service.js

const fs = require('fs');
const path = require('path');

// Salva a imagem localmente e retorna a URL local
async function uploadToS3(file, folder) {
  // Garante que a pasta existe
  const uploadDir = path.join(__dirname, '../uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  // Gera um nome único para o arquivo
  const timestamp = Date.now();
  const ext = path.extname(file.originalname || 'imagem.jpg');
  const base = path.basename(file.originalname || 'imagem', ext);
  const filename = `${base}-${timestamp}${ext}`;
  const destPath = path.join(uploadDir, filename);

  // Move o arquivo para a pasta de destino
  fs.copyFileSync(file.path, destPath);

  // Remove o arquivo temporário
  fs.unlinkSync(file.path);

  // Retorna a URL local acessível pelo frontend
  return `/uploads/${folder}/${filename}`;
}

module.exports = { uploadToS3 }; 