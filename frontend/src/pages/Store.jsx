import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart, ITEM_TYPES } from '../contexts/CartContext';
import api from '../services/api';
import ModernHeader from '../components/ModernHeader';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadStoreProducts();
  }, []);

  const loadStoreProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/store-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos da loja:', error);
      setError('Erro ao carregar produtos da loja');
    } finally {
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
    const newQuantity = Math.max(1, Math.min(value, selectedProduct?.stock || 1));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      const cartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: parseFloat(selectedProduct.price),
        quantity: quantity,
        type: ITEM_TYPES.STORE_PRODUCT,
        image: selectedProduct.image_url,
        description: selectedProduct.description,
        stock: selectedProduct.stock
      };

      addItem(cartItem);
      handleCloseDialog();
    }
  };

  const handleQuickAdd = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      type: ITEM_TYPES.STORE_PRODUCT,
      image: product.image_url,
      description: product.description,
      stock: product.stock
    };

    addItem(cartItem);
  };

  if (loading) {
    return (
      <Box>
        <ModernHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
        <Footer />
        <WhatsAppButton />
      </Box>
    );
  }

  return (
    <Box>
      <ModernHeader />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ cursor: 'pointer' }}
          >
            Home
          </Link>
          <Typography color="text.primary">Loja</Typography>
        </Breadcrumbs>

        {/* Título da página */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            🏪 Loja da Igreja
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Produtos especiais para sua fé e devoção
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {products.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Nenhum produto disponível
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Em breve teremos produtos especiais para você!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image_url || '/images_site/default-product.jpg'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {product.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </Typography>
                      <Chip 
                        label={`${product.stock} em estoque`}
                        color={product.stock > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleOpenDialog(product)}
                        disabled={product.stock <= 0}
                      >
                        Ver Detalhes
                      </Button>
                      <IconButton
                        color="primary"
                        onClick={() => handleQuickAdd(product)}
                        disabled={product.stock <= 0}
                        sx={{ border: 1, borderColor: 'primary.main' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Dialog para adicionar produto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adicionar ao Carrinho
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <img
                  src={selectedProduct.image_url || '/images_site/default-product.jpg'}
                  alt={selectedProduct.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedProduct.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedProduct.description}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    R$ {parseFloat(selectedProduct.price).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body1">Quantidade:</Typography>
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
                  sx={{ width: '80px' }}
                />
                <IconButton 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= selectedProduct.stock}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estoque disponível: {selectedProduct.stock} unidades
              </Typography>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Resumo do Pedido
                </Typography>
                <Typography variant="body1">
                  {selectedProduct.name} x {quantity}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  Total: R$ {(selectedProduct.price * quantity).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleAddToCart} 
            variant="contained"
            disabled={selectedProduct?.stock <= 0}
          >
            Adicionar ao Carrinho
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Store; 