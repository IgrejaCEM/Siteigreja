import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import api from '../services/api';

const EventProducts = ({ eventId, onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [eventId]);

  const loadProducts = async () => {
    try {
      const response = await api.get(`/events/${eventId}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos do evento');
      setLoading(false);
    }
  };

  const handleOpenDialog = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, selectedProduct.stock));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (onAddProduct && selectedProduct) {
      onAddProduct(selectedProduct, quantity);
    }
    handleCloseDialog();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Não há produtos disponíveis para este evento.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Produtos do Evento
      </Typography>
      
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    R$ {parseFloat(product.price || 0).toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleOpenDialog(product)}
                    disabled={!product.is_active || product.stock <= 0}
                  >
                    {product.stock > 0 ? 'Adicionar' : 'Indisponível'}
                  </Button>
                </Box>
                {product.stock > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Estoque disponível: {product.stock}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Adicionar ao Carrinho</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body1" color="primary" gutterBottom>
                                  R$ {parseFloat(selectedProduct.price || 0).toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <IconButton 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  type="number"
                  inputProps={{ min: 1, max: selectedProduct.stock }}
                  sx={{ width: '80px', mx: 2 }}
                />
                <IconButton 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= selectedProduct.stock}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Total: R$ {(selectedProduct.price * quantity).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleAddToCart} variant="contained">
            Adicionar ao Carrinho
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventProducts; 