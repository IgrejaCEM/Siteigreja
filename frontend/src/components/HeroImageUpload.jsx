import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const HeroImageUpload = ({ onImageUploaded, currentImage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'hero');

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onImageUploaded(response.data.url);
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="hero-image-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="hero-image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={loading}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? 'Enviando...' : 'Selecionar Imagem'}
        </Button>
      </label>

      {error && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
          {error}
        </Typography>
      )}

      {currentImage && (
        <Box sx={{ mt: 2, position: 'relative' }}>
          <img
            src={currentImage}
            alt="Hero Preview"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default HeroImageUpload; 