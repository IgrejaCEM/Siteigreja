const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToS3 } = require('../services/s3Service');

// Configurar o multer para armazenar arquivos temporariamente
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'));
    }
    cb(null, true);
  },
});

// Rota para upload de imagens
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const folder = req.body.folder || 'uploads';
    const imageUrl = await uploadToS3(req.file, folder);

    // Remover o arquivo temporário após o upload
    fs.unlinkSync(req.file.path);

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

module.exports = router; 