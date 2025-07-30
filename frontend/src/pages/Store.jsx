import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/store-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, qty = 1) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      type: 'store_product',
      quantity: qty,
      image_url: product.image_url
    });
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

  const handleAddWithQuantity = () => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct, quantity);
      handleCloseDialog();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Loja da Igreja
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                {product.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    {formatPrice(product.price)}
                  </Typography>
                  <Chip 
                    label={`Estoque: ${product.stock}`} 
                    color={product.stock > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                {product.category && (
                  <Chip label={product.category} size="small" sx={{ mb: 1 }} />
                )}
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CartIcon />}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                >
                  Adicionar ao Carrinho
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog(product)}
                  disabled={product.stock <= 0}
                >
                  Escolher Quantidade
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adicionar {selectedProduct?.name} ao Carrinho
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Quantidade:
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: selectedProduct?.stock || 1 }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Total: {selectedProduct ? formatPrice(selectedProduct.price * quantity) : ''}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleAddWithQuantity} variant="contained">
            Adicionar ao Carrinho
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Store; 