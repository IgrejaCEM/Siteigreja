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
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../services/api';

dayjs.locale('pt-br');

const EventoCompleto = ({ event }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        const response = await api.get(`/events/${event.slug || event.id}`);
        setEventDetails(response.data);
      } catch (error) {
        console.error('Erro ao carregar detalhes do evento:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [event]);

  const handleLotSelect = (lot) => {
    setSelectedLot(lot);
  };

  const handleAddProduct = (product, quantity = 1) => {
    const existingProduct = cartProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setCartProducts(cartProducts.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + quantity }
          : p
      ));
    } else {
      setCartProducts([...cartProducts, { ...product, quantity }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setCartProducts(cartProducts.filter(p => p.id !== productId));
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedLot) {
      total += selectedLot.price;
    }
    cartProducts.forEach(product => {
      total += product.price * product.quantity;
    });
    return total;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Alert severity="error">Erro ao carregar evento</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100vw', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Banner do evento */}
      <Box sx={{ 
        width: '100%', 
        height: '40vh',
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        mb: 4,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <img
          src={eventDetails.banner || 'https://via.placeholder.com/1200x400?text=Banner+do+Evento'}
          alt={eventDetails.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '40px',
          color: 'white'
        }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            {eventDetails.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon />
              <Typography>
                {eventDetails.date ? dayjs(eventDetails.date).format('DD/MM/YYYY') : 'Data a definir'}
              </Typography>
            </Box>
            {eventDetails.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon />
                <Typography>{eventDetails.location}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Conteúdo do evento */}
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Descrição */}
        <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
              Sobre o Evento
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              {eventDetails.description || 'Descrição do evento será adicionada em breve.'}
            </Typography>
          </CardContent>
        </Card>

        {/* Lotes */}
        {eventDetails.lots && eventDetails.lots.length > 0 && (
          <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
                🎫 Ingressos Disponíveis
              </Typography>
              <Grid container spacing={3}>
                {eventDetails.lots.map((lot) => (
                  <Grid item xs={12} md={6} key={lot.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: selectedLot?.id === lot.id ? '3px solid #4ecdc4' : '1px solid rgba(255,255,255,0.2)',
                        background: selectedLot?.id === lot.id ? 'rgba(78,205,196,0.2)' : 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                        }
                      }}
                      onClick={() => handleLotSelect(lot)}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                          {lot.name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                          {lot.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h5" sx={{ color: '#4ecdc4', fontWeight: 'bold' }}>
                            R$ {lot.price.toFixed(2)}
                          </Typography>
                          <Chip 
                            label={`${lot.quantity} vagas`}
                            color={lot.quantity > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        {lot.start_date && lot.end_date && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mt: 1 }}>
                            De {dayjs(lot.start_date).format('DD/MM')} até {dayjs(lot.end_date).format('DD/MM')}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Produtos */}
        {eventDetails.products && eventDetails.products.length > 0 && (
          <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
                🛍️ Produtos do Evento
              </Typography>
              <Grid container spacing={3}>
                {eventDetails.products.map((product) => (
                  <Grid item xs={12} md={4} key={product.id}>
                    <Card sx={{ 
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                          {product.name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                          {product.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                            R$ {product.price.toFixed(2)}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAddProduct(product)}
                            sx={{ 
                              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #ff5252, #26a69a)'
                              }
                            }}
                          >
                            Adicionar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Carrinho */}
        {(selectedLot || cartProducts.length > 0) && (
          <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
                🛒 Seu Pedido
              </Typography>
              
              {selectedLot && (
                <Box sx={{ mb: 3, p: 2, background: 'rgba(78,205,196,0.2)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    Ingresso: {selectedLot.name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    R$ {selectedLot.price.toFixed(2)}
                  </Typography>
                </Box>
              )}

              {cartProducts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Produtos:
                  </Typography>
                  {cartProducts.map((product) => (
                    <Box key={product.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 1
                    }}>
                      <Typography sx={{ color: 'white' }}>
                        {product.name} x{product.quantity}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: 'white' }}>
                          R$ {(product.price * product.quantity).toFixed(2)}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          Remover
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2, background: 'rgba(255,255,255,0.3)' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total: R$ {calculateTotal().toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  disabled={!selectedLot}
                  sx={{ 
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ff5252, #26a69a)'
                    }
                  }}
                >
                  🎫 Inscrever-se Agora
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default EventoCompleto; 