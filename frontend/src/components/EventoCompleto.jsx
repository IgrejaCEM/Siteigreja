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
        {/* Banner do evento - MAIS ALTO e separado */}
        <Box sx={{ 
          width: '100%', 
          height: isMobile ? '50vh' : '60vh', // Aumentado significativamente
          position: 'relative',
          borderRadius: isMobile ? '10px' : '20px',
          overflow: 'hidden',
          mb: isMobile ? 4 : 6, // Mais espaço entre banner e conteúdo
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '2px solid #333',
          background: '#000000'
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
            background: 'rgba(0,0,0,0.9)',
            padding: isMobile ? '30px' : '50px', // Mais padding
            color: 'white'
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: isMobile ? 2 : 3, // Mais espaço
                fontSize: isMobile ? '2.2rem' : '3.5rem', // Fonte maior
                lineHeight: 1.2
              }}
            >
              {eventDetails.title}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 2 : 4, // Mais gap
              alignItems: isMobile ? 'flex-start' : 'center' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ fontSize: isMobile ? '1.2rem' : '1.8rem' }} />
                <Typography sx={{ 
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  fontWeight: 'bold'
                }}>
                  {eventDetails.date ? dayjs(eventDetails.date).format('DD/MM/YYYY') : 'Data a definir'}
                </Typography>
              </Box>
              {eventDetails.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: isMobile ? '1.2rem' : '1.8rem' }} />
                  <Typography sx={{ 
                    fontSize: isMobile ? '1rem' : '1.2rem',
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
          background: '#ffffff', // Fundo branco
          px: isMobile ? 1 : 2,
          borderRadius: '15px',
          padding: isMobile ? '20px' : '30px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Descrição - FUNDO BRANCO */}
          <Card sx={{ 
            mb: isMobile ? 3 : 4, 
            background: '#ffffff', 
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ 
              background: '#ffffff',
              padding: isMobile ? '20px' : '30px'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: isMobile ? 2 : 3, 
                  color: '#333333', // Texto escuro
                  fontSize: isMobile ? '1.4rem' : '1.8rem',
                  fontWeight: 'bold'
                }}
              >
                Sobre o Evento
              </Typography>
              <Typography sx={{ 
                color: '#666666', // Texto cinza escuro
                lineHeight: 1.8,
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>
                {eventDetails.description || 'Descrição do evento será adicionada em breve.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Lotes - FUNDO BRANCO */}
          {eventDetails.lots && eventDetails.lots.length > 0 && (
            <Card sx={{ 
              mb: isMobile ? 3 : 4, 
              background: '#ffffff', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ 
                background: '#ffffff',
                padding: isMobile ? '20px' : '30px'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: isMobile ? 3 : 4, 
                    color: '#333333', // Texto escuro
                    fontSize: isMobile ? '1.4rem' : '1.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  🎫 Ingressos Disponíveis
                </Typography>
                <Grid container spacing={isMobile ? 3 : 4}>
                  {eventDetails.lots.map((lot) => (
                    <Grid item xs={12} md={6} key={lot.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: selectedLot?.id === lot.id ? '3px solid #2196f3' : '1px solid #e0e0e0',
                          background: selectedLot?.id === lot.id ? '#f3f8ff' : '#ffffff',
                          '&:hover': {
                            transform: isMobile ? 'none' : 'translateY(-5px)',
                            boxShadow: '0 8px 25px rgba(33,150,243,0.15)',
                            border: '2px solid #2196f3'
                          }
                        }}
                        onClick={() => handleLotSelect(lot)}
                      >
                        <CardContent sx={{ 
                          background: selectedLot?.id === lot.id ? '#f3f8ff' : '#ffffff',
                          padding: isMobile ? '16px' : '20px'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#333333', // Texto escuro
                              mb: 2,
                              fontSize: isMobile ? '1.1rem' : '1.3rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {lot.name}
                          </Typography>
                          <Typography sx={{ 
                            color: '#666666', // Texto cinza
                            mb: 3,
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            lineHeight: 1.6
                          }}>
                            {lot.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 2 : 0
                          }}>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: '#2196f3', // Azul para preço
                                fontWeight: 'bold',
                                fontSize: isMobile ? '1.3rem' : '1.6rem'
                              }}
                            >
                              R$ {lot.price.toFixed(2)}
                            </Typography>
                            <Chip 
                              label={`${lot.quantity} vagas`}
                              color={lot.quantity > 0 ? 'primary' : 'error'}
                              size={isMobile ? 'small' : 'medium'}
                              sx={{ 
                                background: lot.quantity > 0 ? '#2196f3' : '#f44336',
                                color: 'white',
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          {lot.start_date && lot.end_date && (
                            <Typography sx={{ 
                              color: '#999999', // Texto cinza claro
                              fontSize: isMobile ? '0.8rem' : '0.9rem', 
                              mt: 2,
                              fontStyle: 'italic'
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
              mb: isMobile ? 3 : 4, 
              background: '#ffffff', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ 
                background: '#ffffff',
                padding: isMobile ? '20px' : '30px'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: isMobile ? 3 : 4, 
                    color: '#333333', // Texto escuro
                    fontSize: isMobile ? '1.4rem' : '1.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  🛍️ Produtos do Evento
                </Typography>
                <Grid container spacing={isMobile ? 3 : 4}>
                  {eventDetails.products.map((product) => (
                    <Grid item xs={12} md={4} key={product.id}>
                      <Card sx={{ 
                        background: '#ffffff',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <CardContent sx={{ 
                          background: '#ffffff',
                          padding: isMobile ? '16px' : '20px'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#333333', // Texto escuro
                              mb: 2,
                              fontSize: isMobile ? '1.1rem' : '1.3rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography sx={{ 
                            color: '#666666', // Texto cinza
                            mb: 3,
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            lineHeight: 1.6
                          }}>
                            {product.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 2 : 0
                          }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: '#ff6b35', // Laranja para produtos
                                fontWeight: 'bold',
                                fontSize: isMobile ? '1.1rem' : '1.3rem'
                              }}
                            >
                              R$ {product.price.toFixed(2)}
                            </Typography>
                            <Button
                              variant="contained"
                              size={isMobile ? 'small' : 'medium'}
                              onClick={() => handleAddProduct(product)}
                              sx={{ 
                                background: '#ff6b35',
                                color: 'white',
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                padding: isMobile ? '8px 16px' : '10px 20px',
                                fontWeight: 'bold',
                                '&:hover': {
                                  background: '#e55a2b'
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
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ 
                background: '#ffffff',
                padding: isMobile ? '20px' : '30px'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: isMobile ? 3 : 4, 
                    color: '#333333', // Texto escuro
                    fontSize: isMobile ? '1.4rem' : '1.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  🛒 Seu Pedido
                </Typography>
                
                {selectedLot && (
                  <Box sx={{ 
                    mb: isMobile ? 3 : 4, 
                    p: isMobile ? 2 : 3, 
                    background: '#f8f9fa', 
                    borderRadius: 3, 
                    border: '2px solid #e9ecef'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#333333', // Texto escuro
                        mb: 2,
                        fontSize: isMobile ? '1.1rem' : '1.3rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Ingresso: {selectedLot.name}
                    </Typography>
                    <Typography sx={{ 
                      color: '#666666', // Texto cinza
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      R$ {selectedLot.price.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {cartProducts.length > 0 && (
                  <Box sx={{ mb: isMobile ? 3 : 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#333333', // Texto escuro
                        mb: isMobile ? 2 : 3,
                        fontSize: isMobile ? '1.1rem' : '1.3rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Produtos:
                    </Typography>
                    {cartProducts.map((product) => (
                      <Box key={product.id} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2,
                        p: isMobile ? 1.5 : 2,
                        background: '#f8f9fa',
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 1 : 0
                      }}>
                        <Typography sx={{ 
                          color: '#333333', // Texto escuro
                          fontSize: isMobile ? '0.9rem' : '1rem',
                          fontWeight: 'bold'
                        }}>
                          {product.name} x{product.quantity}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          flexDirection: isMobile ? 'column' : 'row'
                        }}>
                          <Typography sx={{ 
                            color: '#666666', // Texto cinza
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            fontWeight: 'bold'
                          }}>
                            R$ {(product.price * product.quantity).toFixed(2)}
                          </Typography>
                          <Button
                            size={isMobile ? 'small' : 'small'}
                            color="error"
                            variant="outlined"
                            onClick={() => handleRemoveProduct(product.id)}
                            sx={{
                              fontSize: isMobile ? '0.8rem' : '0.9rem',
                              padding: isMobile ? '6px 12px' : '8px 16px',
                              borderColor: '#dc3545',
                              color: '#dc3545',
                              '&:hover': {
                                borderColor: '#c82333',
                                backgroundColor: '#f8d7da'
                              }
                            }}
                          >
                            Remover
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: isMobile ? 2 : 3, background: '#e0e0e0' }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 2 : 0
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#333333', // Texto escuro
                      fontWeight: 'bold',
                      fontSize: isMobile ? '1.3rem' : '1.6rem'
                    }}
                  >
                    Total: R$ {calculateTotal().toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    size={isMobile ? 'large' : 'large'}
                    disabled={!selectedLot}
                    sx={{ 
                      background: '#28a745', // Verde para botão principal
                      color: 'white',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      padding: isMobile ? '12px 24px' : '15px 30px',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      '&:hover': {
                        background: '#218838'
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