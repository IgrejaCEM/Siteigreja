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
        background: '#000000 !important'
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
        background: '#000000 !important'
      }}>
        <Alert severity="error">Erro ao carregar evento</Alert>
      </Box>
    );
  }

  return (
    <>
      <style>
        {`
          /* FORÇAR TUDO PRETO - REMOVER QUALQUER ROXO */
          * {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Remover gradientes roxos */
          *[style*="background"] {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Forçar cards pretos */
          .MuiCard-root, .MuiCard-root * {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Forçar seções pretas */
          section, div {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Remover gradientes */
          *[style*="gradient"] {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Forçar fundo preto em tudo */
          body, html, #root {
            background: #000000 !important;
            background-color: #000000 !important;
          }
        `}
      </style>
      
      <Box sx={{ 
        width: '100vw', 
        minHeight: '100vh',
        background: '#000000 !important',
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '2px solid #333',
          background: '#000000 !important'
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
            background: 'rgba(0,0,0,0.9) !important',
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
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', background: '#000000 !important' }}>
          {/* Descrição */}
          <Card sx={{ mb: 4, background: '#000000 !important', border: '1px solid #333' }}>
            <CardContent sx={{ background: '#000000 !important' }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
                Sobre o Evento
              </Typography>
              <Typography sx={{ color: '#ccc', lineHeight: 1.6 }}>
                {eventDetails.description || 'Descrição do evento será adicionada em breve.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Lotes */}
          {eventDetails.lots && eventDetails.lots.length > 0 && (
            <Card sx={{ mb: 4, background: '#000000 !important', border: '1px solid #333' }}>
              <CardContent sx={{ background: '#000000 !important' }}>
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
                          border: selectedLot?.id === lot.id ? '2px solid #fff' : '1px solid #333',
                          background: selectedLot?.id === lot.id ? '#111 !important' : '#000000 !important',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 10px 25px rgba(255,255,255,0.1)',
                            border: '1px solid #666'
                          }
                        }}
                        onClick={() => handleLotSelect(lot)}
                      >
                        <CardContent sx={{ background: selectedLot?.id === lot.id ? '#111 !important' : '#000000 !important' }}>
                          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                            {lot.name}
                          </Typography>
                          <Typography sx={{ color: '#ccc', mb: 2 }}>
                            {lot.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                              R$ {lot.price.toFixed(2)}
                            </Typography>
                            <Chip 
                              label={`${lot.quantity} vagas`}
                              color={lot.quantity > 0 ? 'default' : 'error'}
                              size="small"
                              sx={{ 
                                background: lot.quantity > 0 ? '#333' : '#d32f2f',
                                color: 'white'
                              }}
                            />
                          </Box>
                          {lot.start_date && lot.end_date && (
                            <Typography sx={{ color: '#999', fontSize: '0.9rem', mt: 1 }}>
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
            <Card sx={{ mb: 4, background: '#000000 !important', border: '1px solid #333' }}>
              <CardContent sx={{ background: '#000000 !important' }}>
                <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
                  🛍️ Produtos do Evento
                </Typography>
                <Grid container spacing={3}>
                  {eventDetails.products.map((product) => (
                    <Grid item xs={12} md={4} key={product.id}>
                      <Card sx={{ 
                        background: '#000000 !important',
                        border: '1px solid #333'
                      }}>
                        <CardContent sx={{ background: '#000000 !important' }}>
                          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                            {product.name}
                          </Typography>
                          <Typography sx={{ color: '#ccc', mb: 2 }}>
                            {product.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                              R$ {product.price.toFixed(2)}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleAddProduct(product)}
                              sx={{ 
                                background: '#333',
                                color: 'white',
                                '&:hover': {
                                  background: '#555'
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
            <Card sx={{ background: '#000000 !important', border: '1px solid #333' }}>
              <CardContent sx={{ background: '#000000 !important' }}>
                <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
                  🛒 Seu Pedido
                </Typography>
                
                {selectedLot && (
                  <Box sx={{ mb: 3, p: 2, background: '#111 !important', borderRadius: 2, border: '1px solid #444' }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      Ingresso: {selectedLot.name}
                    </Typography>
                    <Typography sx={{ color: '#ccc' }}>
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
                        background: '#111 !important',
                        borderRadius: 1,
                        border: '1px solid #444'
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

                <Divider sx={{ my: 2, background: '#333' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Total: R$ {calculateTotal().toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!selectedLot}
                    sx={{ 
                      background: '#333',
                      color: 'white',
                      '&:hover': {
                        background: '#555'
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
    </>
  );
};

export default EventoCompleto; 