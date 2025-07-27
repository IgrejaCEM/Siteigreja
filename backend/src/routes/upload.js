const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToS3 } = require('../services/s3Service');

// Garantir que a pasta uploads existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar o multer para armazenar arquivos temporariamente
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB para permitir imagens de alta qualidade
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens de alta qualidade
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Apenas imagens JPG, PNG ou WebP são permitidas'));
    }
    cb(null, true);
  },
});

// Rota para upload de imagens
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload iniciado:', req.file?.originalname);
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo enviado');
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const folder = req.body.folder || 'uploads';
    console.log('📁 Pasta:', folder);
    
    // Adiciona informações de qualidade no corpo da requisição
    req.body.quality = 'high';
    req.body.preserveQuality = true;
    
    const imageUrl = await uploadToS3(req.file, folder, req.body);
    console.log('✅ Upload concluído:', imageUrl);

    // Remover o arquivo temporário após o upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer upload da imagem',
      details: error.message 
    });
  }
});

module.exports = router; 