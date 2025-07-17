import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import api from '../services/api';

const EventRegistrationStore = ({ eventId, onProductsChange }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadProducts();
  }, [eventId]);

  const loadProducts = async () => {
    try {
      const response = await api.get(`/event-products/event/${eventId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar produtos',
        severity: 'error'
      });
    }
  };

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      const updatedProducts = {
        ...prev,
        [productId]: newQuantity
      };

      // Notifica o componente pai sobre as mudanças
      const selectedProductsList = Object.entries(updatedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([id, quantity]) => {
          const product = products.find(p => p.id === parseInt(id));
          return {
            product_id: parseInt(id),
            quantity,
            unit_price: product.price
          };
        });

      onProductsChange(selectedProductsList);

      return updatedProducts;
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return total + (product.price * quantity);
    }, 0);
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
                  R$ {product.price.toFixed(2)}
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
                  <TextField
                    value={selectedProducts[product.id] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0 && value <= product.stock) {
                        setSelectedProducts(prev => ({
                          ...prev,
                          [product.id]: value
                        }));
                      }
                    }}
                    type="number"
                    size="small"
                    sx={{ width: '60px' }}
                    inputProps={{ min: 0, max: product.stock }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleQuantityChange(product.id, 1)}
                    disabled={selectedProducts[product.id] >= product.stock}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {Object.keys(selectedProducts).length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">
            Total dos Produtos: R$ {calculateTotal().toFixed(2)}
          </Typography>
        </Box>
      )}

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

export default EventRegistrationStore; 