import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EventImageUpload = ({ onImageUploaded, currentImage, label = "Selecionar Imagem", folder = "events" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).');
      return;
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10MB.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onImageUploaded(response.data.url);
      setError('');
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageUploaded('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={`event-image-upload-${folder}`}
        type="file"
        onChange={handleFileChange}
      />
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <label htmlFor={`event-image-upload-${folder}`}>
          <Button
            variant="outlined"
            component="span"
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={loading}
            sx={{ flex: 1 }}
          >
            {loading ? 'Enviando...' : label}
          </Button>
        </label>
        
        {currentImage && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleRemoveImage}
            disabled={loading}
          >
            Remover
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {currentImage && (
        <Box sx={{ mt: 2, position: 'relative' }}>
          <img
            src={currentImage}
            alt="Preview"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            URL: {currentImage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EventImageUpload; 