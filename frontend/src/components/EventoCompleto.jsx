import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Container,
  CardMedia
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../services/api';
import { useCart, ITEM_TYPES } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

dayjs.locale('pt-br');

const EventoCompleto = ({ event }) => {
  // Flag para controlar exibição da loja geral na página do evento
  const SHOW_GENERAL_STORE_ON_EVENT = false;
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState(null);
  
  const { addItem, getEventItems, getStoreItems, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Obter produtos do carrinho
  const cartProducts = getEventItems(event?.id);
  const cartStoreItems = getStoreItems();

  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        console.log('🔍 Carregando detalhes do evento:', event);
        setLoading(true);
        setError(null);
        
        if (!event || (!event.slug && !event.id)) {
          throw new Error('Evento inválido');
        }
        
        const response = await api.get(`/events/${event.slug || event.id}`);
        console.log('✅ Detalhes do evento carregados:', response.data);
        setEventDetails(response.data);
      } catch (error) {
        console.error('❌ Erro ao carregar detalhes do evento:', error);
        setError(error.response?.data?.error || 'Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };

    if (event) {
      loadEventDetails();
    }
  }, [event]);

  // Carregar produtos da loja geral para exibir abaixo dos ingressos
  useEffect(() => {
    if (!SHOW_GENERAL_STORE_ON_EVENT) {
      return; // não buscar se não for exibir
    }
    const loadStoreProducts = async () => {
      try {
        setStoreLoading(true);
        setStoreError(null);
        console.log('🛍️ Buscando produtos da loja geral...');
        const response = await api.get('/store-products');
        console.log('📦 Produtos da loja:', response.data?.length);
        setStoreProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('❌ Erro ao buscar produtos da loja:', err);
        setStoreError('Não foi possível carregar os produtos da loja.');
      } finally {
        setStoreLoading(false);
      }
    };

    loadStoreProducts();
  }, [SHOW_GENERAL_STORE_ON_EVENT]);

  const handleLotSelect = (lot) => {
    try {
      console.log('🎯 Lote selecionado:', lot);
      setSelectedLot(lot);
    } catch (error) {
      console.error('❌ Erro ao selecionar lote:', error);
    }
  };

  const handleAddProduct = (product, quantity = 1) => {
    try {
      console.log('🛒 Adicionando produto ao carrinho:', product, 'quantidade:', quantity);
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: quantity,
        type: ITEM_TYPES.EVENT_PRODUCT,
        eventId: event.id,
        eventName: event.name,
        image: product.image_url,
        description: product.description,
        stock: product.stock
      };

      addItem(cartItem);
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
    }
  };

  const handleAddStoreProduct = (product, quantity = 1) => {
    try {
      console.log('🏪 Adicionando produto da LOJA ao carrinho:', product, 'quantidade:', quantity);
      const cartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: quantity,
        type: ITEM_TYPES.STORE_PRODUCT,
        image: product.image_url,
        description: product.description,
        stock: product.stock
      };
      addItem(cartItem);
    } catch (error) {
      console.error('❌ Erro ao adicionar produto da loja:', error);
    }
  };

  const handleRemoveProduct = (product) => {
    try {
      console.log('🗑️ Removendo produto do carrinho:', product);
      removeItem(product);
    } catch (error) {
      console.error('❌ Erro ao remover produto:', error);
    }
  };

  const handleQuantityChange = (product, change) => {
    try {
      console.log('📊 Alterando quantidade do produto:', product.id, 'mudança:', change);
      const newQuantity = Math.max(1, product.quantity + change);
      updateQuantity(product, newQuantity);
    } catch (error) {
      console.error('❌ Erro ao alterar quantidade:', error);
    }
  };

  const calculateTotal = () => {
    try {
      let total = 0;
      
      // Adicionar preço do ingresso selecionado
      if (selectedLot) {
        total += parseFloat(selectedLot.price);
      }
      
      // Adicionar preços dos produtos do evento
      cartProducts.forEach(product => {
        total += parseFloat(product.price) * product.quantity;
      });

      // Adicionar preços dos produtos da loja geral
      cartStoreItems.forEach(product => {
        total += parseFloat(product.price) * product.quantity;
      });
      
      return total;
    } catch (error) {
      console.error('❌ Erro ao calcular total:', error);
      return 0;
    }
  };

  const handleProceedToRegistration = () => {
    try {
      console.log('🚀 Prosseguindo para checkout...');
      
      // Adicionar ingresso ao carrinho se selecionado
      if (selectedLot) {
        const ticketItem = {
          id: selectedLot.id,
          name: `Ingresso - ${selectedLot.name}`,
          price: parseFloat(selectedLot.price),
          quantity: 1,
          type: ITEM_TYPES.EVENT_TICKET,
          eventId: event.id,
          eventName: event.name,
          lotId: selectedLot.id,
          lotName: selectedLot.name
        };
        
        addItem(ticketItem);
      }
      
      // Caso não tenha ingresso mas tenha produtos da loja, ainda assim pode prosseguir
      if (!selectedLot && cartProducts.length === 0 && cartStoreItems.length === 0) {
        console.log('❌ Nenhum item no carrinho para finalizar');
        return;
      }

      // Redirecionar para checkout
      navigate('/checkout');
    } catch (error) {
      console.error('❌ Erro ao prosseguir para checkout:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Mostrar erro se houver
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        background: '#000000',
        color: 'white',
        p: 3
      }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Erro ao carregar evento
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Tentar Novamente
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000000'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (!eventDetails) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000000'
      }}>
        <Alert severity="error">Evento não encontrado</Alert>
      </Box>
    );
  }

  return (
    <>
      <style>
        {`
          /* CSS ESPECÍFICO - SÓ REMOVER ROXO/LILÁS DO EVENTO */
          .evento-completo {
            background: #000000 !important;
            color: white !important;
          }
          
          .evento-completo .MuiCard-root {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .evento-completo .MuiTypography-root {
            color: white !important;
          }
          
          .evento-completo .MuiChip-root {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
          }
          
          .evento-completo .MuiButton-root {
            background: #ff6b35 !important;
            color: white !important;
          }
          
          .evento-completo .MuiButton-root:hover {
            background: #e55a2b !important;
          }
        `}
      </style>

      <Box className="evento-completo" sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header do Evento */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              {eventDetails.title}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon />
                <Typography variant="body1">
                  {dayjs(eventDetails.date).format('DD/MM/YYYY')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon />
                <Typography variant="body1">
                  {eventDetails.location}
                </Typography>
              </Box>
            </Box>
            
            {eventDetails.description && (
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                {eventDetails.description}
              </Typography>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* Coluna Esquerda - Ingressos e Produtos do Evento */}
            <Grid item xs={12} md={8}>
              {/* Ingressos Disponíveis */}
              {eventDetails.lots && eventDetails.lots.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Ingressos Disponíveis
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {eventDetails.lots.map((lot) => (
                        <Grid item xs={12} sm={6} key={lot.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              border: selectedLot?.id === lot.id ? '2px solid #ff6b35' : '1px solid rgba(255,255,255,0.2)',
                              background: selectedLot?.id === lot.id ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.05)'
                            }}
                            onClick={() => handleLotSelect(lot)}
                          >
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {lot.name}
                              </Typography>
                              <Typography variant="h5" color="primary" gutterBottom>
                                {formatPrice(lot.price)}
                              </Typography>
                              <Chip 
                                label={`${lot.available_spots} vagas`} 
                                color="primary" 
                                size="small"
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Produtos do Evento */}
              {eventDetails.products && eventDetails.products.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <ShoppingCartIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Produtos do Evento
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Produtos especiais disponíveis para este evento
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {eventDetails.products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                          <Card 
                            sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            {/* Imagem do Produto */}
                            <CardMedia
                              component="img"
                              height="200"
                              image={product.image_url || 'https://via.placeholder.com/300x200?text=Produto'}
                              alt={product.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {product.name}
                              </Typography>
                              {product.description && (
                                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, flexGrow: 1 }}>
                                  {product.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                  {formatPrice(product.price)}
                                </Typography>
                                <Chip 
                                  label={`Estoque: ${product.stock}`} 
                                  color={product.stock > 0 ? 'success' : 'error'}
                                  size="small"
                                />
                              </Box>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleAddProduct(product)}
                                disabled={product.stock <= 0}
                                sx={{ 
                                  mt: 'auto',
                                  py: 1.5,
                                  fontWeight: 'bold',
                                  textTransform: 'none'
                                }}
                              >
                                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Loja da Igreja (produtos gerais) - oculto por padrão */}
              {SHOW_GENERAL_STORE_ON_EVENT && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <StoreIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Loja da Igreja
                    </Typography>
                  </Box>

                  {storeLoading && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                      <CircularProgress size={28} />
                    </Box>
                  )}

                  {storeError && (
                    <Alert severity="warning">{storeError}</Alert>
                  )}

                  {!storeLoading && !storeError && (
                    <Grid container spacing={3}>
                      {storeProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={`store-${product.id}`}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="200"
                              image={product.image_url || 'https://via.placeholder.com/300x200?text=Produto'}
                              alt={product.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {product.name}
                              </Typography>
                              {product.description && (
                                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, flexGrow: 1 }}>
                                  {product.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                  {formatPrice(product.price)}
                                </Typography>
                                <Chip
                                  label={`Estoque: ${product.stock}`}
                                  color={product.stock > 0 ? 'success' : 'error'}
                                  size="small"
                                />
                              </Box>
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleAddStoreProduct(product)}
                                disabled={product.stock <= 0}
                                sx={{ mt: 'auto', py: 1.5, fontWeight: 'bold', textTransform: 'none' }}
                              >
                                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
              )}
            </Grid>

            {/* Coluna Direita - Carrinho */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Seu Pedido
                  </Typography>

                  {/* Ingresso Selecionado */}
                  {selectedLot && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Ingresso - {selectedLot.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPrice(selectedLot.price)}
                      </Typography>
                    </Box>
                  )}

                  {/* Produtos adicionados ao carrinho */}
                  {cartProducts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Produtos do Evento:
                      </Typography>
                      {cartProducts.map((product) => (
                        <Box key={product.id} sx={{ mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                              {product.name} x{product.quantity}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {formatPrice(product.price * product.quantity)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleQuantityChange(product, -1)}
                              disabled={product.quantity <= 1}
                            >
                              -
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleQuantityChange(product, 1)}
                            >
                              +
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleRemoveProduct(product)}
                            >
                              Remover
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {cartStoreItems.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Produtos da Loja:
                      </Typography>
                      {cartStoreItems.map((product) => (
                        <Box key={`store-${product.id}`} sx={{ mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                              {product.name} x{product.quantity}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {formatPrice(product.price * product.quantity)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleQuantityChange(product, -1)}
                              disabled={product.quantity <= 1}
                            >
                              -
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleQuantityChange(product, 1)}
                            >
                              +
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleRemoveProduct(product)}
                            >
                              Remover
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Total */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      Total: {formatPrice(calculateTotal())}
                    </Typography>
                  </Box>

                  {/* Botão Finalizar */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleProceedToRegistration}
                    disabled={!selectedLot && cartProducts.length === 0 && cartStoreItems.length === 0}
                    sx={{ py: 1.5 }}
                  >
                    Finalizar Compra
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default EventoCompleto; 