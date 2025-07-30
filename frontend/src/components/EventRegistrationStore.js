import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const EventRegistrationStore = ({ eventId, onProductsChange }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [eventId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [productId]: newQuantity
      };
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

  const handleAddToCart = () => {
    if (selectedProduct) {
      handleQuantityChange(selectedProduct.id, quantity);
      handleCloseDialog();
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      const price = parseFloat(product?.price || 0);
      return total + (price * quantity);
    }, 0);
  };

  // Função segura para formatar preço
  const formatPrice = (price) => {
    const numericPrice = parseFloat(price || 0);
    return `R$ ${numericPrice.toFixed(2)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Produtos Disponíveis
      </Typography>

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
                <Typography variant="h6" component="h3">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatPrice(product.price)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Estoque: {product.stock}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleQuantityChange(product.id, -1)}
                    disabled={!selectedProducts[product.id]}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                    {selectedProducts[product.id] || 0}
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => handleQuantityChange(product.id, 1)}
                    disabled={product.stock <= (selectedProducts[product.id] || 0)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
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
                {formatPrice(selectedProduct.price)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <IconButton 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  type="number"
                  inputProps={{ min: 1, max: selectedProduct.stock }}
                  sx={{ width: '80px', mx: 2 }}
                />
                <IconButton 
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  disabled={quantity >= selectedProduct.stock}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Total: {formatPrice(parseFloat(selectedProduct.price || 0) * quantity)}
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

export default EventRegistrationStore; 