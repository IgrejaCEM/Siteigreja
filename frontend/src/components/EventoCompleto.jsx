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
  useTheme
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleProceedToRegistration = () => {
    if (!selectedLot) {
      alert('Por favor, selecione um ingresso primeiro!');
      return;
    }

    // Preparar dados para inscrição
    const registrationData = {
      eventId: eventDetails.id,
      lotId: selectedLot.id,
      products: cartProducts,
      total: calculateTotal()
    };

    // Redirecionar para página de inscrição
    const eventSlug = eventDetails.slug || eventDetails.id;
    window.location.href = `/evento/${eventSlug}/inscricao`;
  };

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
        <Alert severity="error">Erro ao carregar evento</Alert>
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
          }
          
          .evento-completo .MuiCard-root {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          
          .evento-completo .MuiCardContent-root {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          
          /* Remover gradientes roxos apenas do evento */
          .evento-completo *[style*="gradient"] {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Remover cores roxas/lilás apenas do evento */
          .evento-completo *[style*="#6"], 
          .evento-completo *[style*="#7"], 
          .evento-completo *[style*="#8"], 
          .evento-completo *[style*="#9"] {
            background: #000000 !important;
            background-color: #000000 !important;
          }
          
          /* Manter cabeçalho e outros elementos normais */
          header, .MuiAppBar-root, nav {
            background: inherit !important;
            background-color: inherit !important;
          }
          
          /* Otimizações para mobile */
          @media (max-width: 768px) {
            .evento-completo {
              padding: 10px !important;
            }
            
            .evento-completo .MuiCard-root {
              margin-bottom: 16px !important;
            }
            
            .evento-completo .MuiTypography-h2 {
              font-size: 1.8rem !important;
              line-height: 1.2 !important;
            }
            
            .evento-completo .MuiTypography-h5 {
              font-size: 1.2rem !important;
            }
            
            .evento-completo .MuiTypography-h6 {
              font-size: 1rem !important;
            }
            
            .evento-completo .MuiButton-root {
              font-size: 0.9rem !important;
              padding: 8px 16px !important;
            }
          }
          
          @media (max-width: 480px) {
            .evento-completo .MuiTypography-h2 {
              font-size: 1.5rem !important;
            }
            
            .evento-completo .MuiTypography-h5 {
              font-size: 1.1rem !important;
            }
            
            .evento-completo .MuiTypography-h6 {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>
      
      <Box 
        className="evento-completo"
        sx={{ 
          width: '100vw', 
          minHeight: '100vh',
          background: '#000000',
          color: 'white',
          padding: isMobile ? '10px' : '20px'
        }}
      >
        {/* Banner do evento - MAIS ALTO */}
        <Box sx={{ 
          width: '100%', 
          height: isMobile ? '50vh' : '60vh', // Aumentado de 30vh/40vh para 50vh/60vh
          position: 'relative',
          borderRadius: isMobile ? '10px' : '20px',
          overflow: 'hidden',
          mb: isMobile ? 3 : 5, // Aumentado margin bottom
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '2px solid #333',
          background: '#000000'
        }}>
          <img
            src={
              isMobile 
                ? (eventDetails.banner_evento_mobile || eventDetails.banner_mobile || eventDetails.banner_evento || eventDetails.banner || 'https://via.placeholder.com/600x300?text=Banner+Mobile')
                : (eventDetails.banner_evento_desktop || eventDetails.banner_desktop || eventDetails.banner_evento || eventDetails.banner || 'https://via.placeholder.com/1200x400?text=Banner+Desktop')
            }
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
            background: 'rgba(0,0,0,0.9)',
            padding: isMobile ? '20px' : '40px',
            color: 'white'
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: isMobile ? 1 : 2,
                fontSize: isMobile ? '1.8rem' : '3rem',
                lineHeight: 1.2
              }}
            >
              {eventDetails.title}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 3, 
              alignItems: isMobile ? 'flex-start' : 'center' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ fontSize: isMobile ? '1rem' : '1.5rem' }} />
                <Typography sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {eventDetails.date ? dayjs(eventDetails.date).format('DD/MM/YYYY') : 'Data a definir'}
                </Typography>
              </Box>
              {eventDetails.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: isMobile ? '1rem' : '1.5rem' }} />
                  <Typography sx={{ 
                    fontSize: isMobile ? '0.8rem' : '1rem',
                    display: isMobile ? 'none' : 'block'
                  }}>
                    {eventDetails.location}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Conteúdo do evento - FUNDO BRANCO */}
        <Box sx={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          background: '#ffffff',
          px: isMobile ? 1 : 2,
          borderRadius: '10px',
          padding: isMobile ? '16px' : '24px'
        }}>
          {/* Descrição - FUNDO BRANCO */}
          <Card sx={{ 
            mb: isMobile ? 2 : 4, 
            background: '#ffffff', 
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ 
              background: '#ffffff',
              padding: isMobile ? '16px' : '24px'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: isMobile ? 1 : 2, 
                  color: '#000000',
                  fontSize: isMobile ? '1.2rem' : '1.5rem'
                }}
              >
                Sobre o Evento
              </Typography>
              <Typography sx={{ 
                color: '#333333', 
                lineHeight: 1.6,
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}>
                {eventDetails.description || 'Descrição do evento será adicionada em breve.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Lotes - FUNDO BRANCO */}
          {eventDetails.lots && eventDetails.lots.length > 0 && (
            <Card sx={{ 
              mb: isMobile ? 2 : 4, 
              background: '#ffffff', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ 
                background: '#ffffff',
                padding: isMobile ? '16px' : '24px'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: isMobile ? 2 : 3, 
                    color: '#000000',
                    fontSize: isMobile ? '1.2rem' : '1.5rem'
                  }}
                >
                  🎫 Ingressos Disponíveis
                </Typography>
                <Grid container spacing={isMobile ? 2 : 3}>
                  {eventDetails.lots.map((lot) => (
                    <Grid item xs={12} md={6} key={lot.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: selectedLot?.id === lot.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          background: selectedLot?.id === lot.id ? '#f3f3f3' : '#ffffff',
                          '&:hover': {
                            transform: isMobile ? 'none' : 'translateY(-5px)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #1976d2'
                          }
                        }}
                        onClick={() => handleLotSelect(lot)}
                      >
                        <CardContent sx={{ 
                          background: selectedLot?.id === lot.id ? '#f3f3f3' : '#ffffff',
                          padding: isMobile ? '12px' : '16px'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#000000', 
                              mb: 1,
                              fontSize: isMobile ? '1rem' : '1.25rem'
                            }}
                          >
                            {lot.name}
                          </Typography>
                          <Typography sx={{ 
                            color: '#666666', 
                            mb: 2,
                            fontSize: isMobile ? '0.8rem' : '1rem'
                          }}>
                            {lot.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 1 : 0
                          }}>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: '#1976d2', 
                                fontWeight: 'bold',
                                fontSize: isMobile ? '1.1rem' : '1.5rem'
                              }}
                            >
                              R$ {lot.price.toFixed(2)}
                            </Typography>
                            <Chip 
                              label={`${lot.quantity} vagas`}
                              color={lot.quantity > 0 ? 'primary' : 'error'}
                              size={isMobile ? 'small' : 'small'}
                              sx={{ 
                                background: lot.quantity > 0 ? '#1976d2' : '#d32f2f',
                                color: 'white',
                                fontSize: isMobile ? '0.7rem' : '0.75rem'
                              }}
                            />
                          </Box>
                          {lot.start_date && lot.end_date && (
                            <Typography sx={{ 
                              color: '#999999', 
                              fontSize: isMobile ? '0.7rem' : '0.9rem', 
                              mt: 1 
                            }}>
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

          {/* Produtos - FUNDO BRANCO */}
          {eventDetails.products && eventDetails.products.length > 0 && (
            <Card sx={{ 
              mb: isMobile ? 2 : 4, 
              background: '#ffffff', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ 
                background: '#ffffff',
                padding: isMobile ? '16px' : '24px'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: isMobile ? 2 : 3, 
                    color: '#000000',
                    fontSize: isMobile ? '1.2rem' : '1.5rem'
                  }}
                >
                  🛍️ Produtos do Evento
                </Typography>
                <Grid container spacing={isMobile ? 2 : 3}>
                  {eventDetails.products.map((product) => (
                    <Grid item xs={12} md={4} key={product.id}>
                      <Card sx={{ 
                        background: '#ffffff',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent sx={{ 
                          background: '#ffffff',
                          padding: isMobile ? '12px' : '16px'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#000000', 
                              mb: 1,
                              fontSize: isMobile ? '1rem' : '1.25rem'
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography sx={{ 
                            color: '#666666', 
                            mb: 2,
                            fontSize: isMobile ? '0.8rem' : '1rem'
                          }}>
                            {product.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 1 : 0
                          }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: '#1976d2', 
                                fontWeight: 'bold',
                                fontSize: isMobile ? '1rem' : '1.25rem'
                              }}
                            >
                              R$ {product.price.toFixed(2)}
                            </Typography>
                            <Button
                              variant="contained"
                              size={isMobile ? 'small' : 'small'}
                              onClick={() => handleAddProduct(product)}
                              sx={{ 
                                background: '#1976d2',
                                color: 'white',
                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                padding: isMobile ? '6px 12px' : '8px 16px',
                                '&:hover': {
                                  background: '#1565c0'
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

          {/* Carrinho - FUNDO BRANCO */}
          {(selectedLot || cartProducts.length > 0) && (
            <Card sx={{ 
              background: '#ffffff', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ 
                background: '#ffffff',
                padding: isMobile ? '16px' : '24px'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: isMobile ? 2 : 3, 
                    color: '#000000',
                    fontSize: isMobile ? '1.2rem' : '1.5rem'
                  }}
                >
                  🛒 Seu Pedido
                </Typography>
                
                {selectedLot && (
                  <Box sx={{ 
                    mb: isMobile ? 2 : 3, 
                    p: isMobile ? 1 : 2, 
                    background: '#f5f5f5', 
                    borderRadius: 2, 
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#000000', 
                        mb: 1,
                        fontSize: isMobile ? '1rem' : '1.25rem'
                      }}
                    >
                      Ingresso: {selectedLot.name}
                    </Typography>
                    <Typography sx={{ 
                      color: '#666666',
                      fontSize: isMobile ? '0.9rem' : '1rem'
                    }}>
                      R$ {selectedLot.price.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {cartProducts.length > 0 && (
                  <Box sx={{ mb: isMobile ? 2 : 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#000000', 
                        mb: isMobile ? 1 : 2,
                        fontSize: isMobile ? '1rem' : '1.25rem'
                      }}
                    >
                      Produtos:
                    </Typography>
                    {cartProducts.map((product) => (
                      <Box key={product.id} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1,
                        p: isMobile ? 0.5 : 1,
                        background: '#f5f5f5',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 0.5 : 0
                      }}>
                        <Typography sx={{ 
                          color: '#000000',
                          fontSize: isMobile ? '0.8rem' : '1rem'
                        }}>
                          {product.name} x{product.quantity}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          flexDirection: isMobile ? 'column' : 'row'
                        }}>
                          <Typography sx={{ 
                            color: '#1976d2',
                            fontSize: isMobile ? '0.8rem' : '1rem'
                          }}>
                            R$ {(product.price * product.quantity).toFixed(2)}
                          </Typography>
                          <Button
                            size={isMobile ? 'small' : 'small'}
                            color="error"
                            onClick={() => handleRemoveProduct(product.id)}
                            sx={{
                              fontSize: isMobile ? '0.7rem' : '0.875rem',
                              padding: isMobile ? '4px 8px' : '6px 12px'
                            }}
                          >
                            Remover
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: isMobile ? 1 : 2, background: '#e0e0e0' }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#000000', 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '1.1rem' : '1.5rem'
                    }}
                  >
                    Total: R$ {calculateTotal().toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    size={isMobile ? 'medium' : 'large'}
                    disabled={!selectedLot}
                    onClick={handleProceedToRegistration}
                    sx={{ 
                      background: '#1976d2',
                      color: 'white',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      '&:hover': {
                        background: '#1565c0'
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