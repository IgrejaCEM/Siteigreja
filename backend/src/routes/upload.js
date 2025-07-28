const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que a pasta uploads existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar o multer para armazenar arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.body.folder || 'uploads';
    const folderPath = path.join(uploadsDir, folder);
    
    // Criar pasta se não existir
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Apenas imagens JPG, PNG, WebP ou GIF são permitidas'));
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
    
    // Gerar URL da imagem
    const imageUrl = `/uploads/${folder}/${req.file.filename}`;
    console.log('✅ Upload concluído:', imageUrl);

    res.json({ 
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
    
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer upload da imagem',
      details: error.message 
    });
  }
});

module.exports = router; 