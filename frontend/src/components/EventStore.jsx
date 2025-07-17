import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const EventStore = ({ eventId }) => {
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null,
    imageUrl: '' // Novo campo para URL
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, [eventId]);

  const loadProducts = async () => {
    try {
      const response = await api.get(`/event-products/event/${eventId}`);
      setProducts(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar produtos',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: null,
        imageUrl: product.image_url // Carregar a URL da imagem existente
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null,
        imageUrl: '' // Limpar a URL ao abrir para novo produto
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image: null,
      imageUrl: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Se o campo de URL estiver preenchido, envie apenas os dados e a URL
      if (formData.imageUrl) {
        const data = {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image_url: formData.imageUrl,
          event_id: Number(eventId)
        };
        if (selectedProduct) {
          await api.put(`/event-products/${selectedProduct.id}`, data);
          setSnackbar({ open: true, message: 'Produto atualizado com sucesso!', severity: 'success' });
        } else {
          await api.post('/event-products', data);
          setSnackbar({ open: true, message: 'Produto criado com sucesso!', severity: 'success' });
        }
        handleCloseDialog();
        loadProducts();
        return;
      }
      // Caso contrário, faz upload normalmente
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && key !== 'imageUrl') {
          if (key === 'price' || key === 'stock') {
            formDataToSend.append(key, Number(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      formDataToSend.append('event_id', Number(eventId));
      if (selectedProduct) {
        await api.put(`/event-products/${selectedProduct.id}`, formDataToSend);
        setSnackbar({ open: true, message: 'Produto atualizado com sucesso!', severity: 'success' });
      } else {
        await api.post('/event-products', formDataToSend);
        setSnackbar({ open: true, message: 'Produto criado com sucesso!', severity: 'success' });
      }
      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setSnackbar({ open: true, message: error.response?.data?.error || 'Erro ao salvar produto', severity: 'error' });
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/event-products/${productId}`);
        setSnackbar({
          open: true,
          message: 'Produto excluído com sucesso!',
          severity: 'success'
        });
        loadProducts();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erro ao excluir produto',
          severity: 'error'
        });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Loja do Evento
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Adicionar Produto
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image_url}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  R$ {Number(product.price).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estoque: {product.stock}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descrição"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              fullWidth
              label="Preço"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: 'R$'
              }}
            />
            <TextField
              fullWidth
              label="Estoque"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="URL da Imagem (opcional)"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              margin="normal"
              placeholder="https://exemplo.com/imagem.jpg"
              helperText="Se preencher, a imagem será carregada por este link. Caso contrário, envie um arquivo."
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              {selectedProduct ? 'Alterar Imagem' : 'Selecionar Imagem'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedProduct ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventStore; 