import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Chip, 
  Alert, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Badge,
  IconButton
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
import ModernHeader from '../components/ModernHeader';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { useInterval } from '../utils/useInterval';
import duration from 'dayjs/plugin/duration';
import EventProducts from '../components/EventProducts';

dayjs.locale('pt-br');
dayjs.extend(duration);

const Evento = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Novos estados para seleção
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await api.get(`/events/${slug}`);
        console.log('Evento carregado:', response.data);
        setEvent(response.data);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        setError('Erro ao carregar o evento. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [slug]);

  useEffect(() => {
    if (!event) return;
    const updateCountdown = () => {
      const now = dayjs();
      const eventDate = dayjs(event.date);
      const diff = eventDate.diff(now);
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const duration = dayjs.duration(diff);
      setTimeLeft({
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const handleAddProduct = (product, quantity = 1) => {
    setCartProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleRemoveProduct = (productId) => {
    setCartProducts(prev => prev.filter(p => p.id !== productId));
  };

  const calculateTotal = () => {
    if (!event?.lots || event.lots.length === 0) return 0;
    const selectedLot = event.lots.find(lot => lot.id === selectedLotId);
    const lotPrice = selectedLot ? Number(selectedLot.price) || 0 : 0;
    
    const productsTotal = cartProducts.reduce((total, product) => {
      return total + (Number(product.price) * product.quantity);
    }, 0);
    
    return lotPrice + productsTotal;
  };

  const handleGoToInscription = () => {
    if (!selectedLotId) {
      alert('Por favor, selecione um lote primeiro.');
      return;
    }
    
    // Salvar seleções no localStorage para usar na página de inscrição
    const selections = {
      selectedLotId,
      cartProducts,
      total: calculateTotal()
    };
    localStorage.setItem('eventSelections', JSON.stringify(selections));
    
    navigate(`/evento/${event.id}/inscricao`);
  };

  const renderValueSummary = () => {
    const selectedLot = event.lots.find(lot => lot.id === selectedLotId);
    const lotPrice = selectedLot ? Number(selectedLot.price) || 0 : 0;
    const productsTotal = cartProducts.reduce((total, product) => {
      return total + (Number(product.price) * product.quantity);
    }, 0);
    const total = lotPrice + productsTotal;

    return (
      <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumo dos Valores
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {selectedLot && (
            <Typography variant="body1">
              Lote selecionado: {selectedLot.name} - R$ {lotPrice.toFixed(2)}
            </Typography>
          )}
          {cartProducts.length > 0 && (
            <Typography variant="body1">
              Produtos: R$ {productsTotal.toFixed(2)}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h5" color="primary" fontWeight="bold">
          Total: R$ {total.toFixed(2)}
        </Typography>
      </Box>
    );
  };

  const handleInscricao = () => {
    navigate(`/evento/${event.id}/inscricao`);
  };

  if (loading) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <CircularProgress />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <Alert severity="error">{error}</Alert>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <Typography>Evento não encontrado</Typography>
        </Box>
        <Footer />
      </Box>
    );
  }

  const nextLot = event.lots?.find(lot => 
    lot.status === 'active' &&
    lot.quantity > 0 &&
    dayjs(lot.start_date).isBefore(dayjs()) &&
    dayjs(lot.end_date).isAfter(dayjs())
  );

  const hasAvailableLots = event.lots?.some(lot => 
    lot.status === 'active' &&
    lot.quantity > 0 &&
    dayjs(lot.start_date).isBefore(dayjs()) &&
    dayjs(lot.end_date).isAfter(dayjs())
  );

  return (
    <Box>
      <ModernHeader />
      
      {/* Hero Section */}
      <Box sx={{ 
        background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${event.banner_evento || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          }}>
            {event.title}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {dayjs(event.date).format('DD [de] MMMM [de] YYYY [às] HH:mm')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {event.location}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8, mt: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {dayjs(event.date).format('DD [de] MMMM [de] YYYY [às] HH:mm')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {event.location}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>

            {event.additional_info && (
              <>
                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                  Informações Adicionais
                </Typography>
                <Typography variant="body1" paragraph>
                  {event.additional_info}
                </Typography>
              </>
            )}

            {/* Seção de Produtos */}
            <EventProducts eventId={event.id} onAddProduct={handleAddProduct} />
            
            {/* Carrinho de Produtos */}
            {cartProducts.length > 0 && (
              <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Produtos Selecionados
                </Typography>
                {cartProducts.map(product => (
                  <Box key={product.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 2,
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantidade: {product.quantity} | R$ {product.price.toFixed(2)} cada
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        R$ {(product.price * product.quantity).toFixed(2)}
                      </Typography>
                      <Button 
                        color="error" 
                        size="small"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        Remover
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: '100px' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Selecionar Lote
                </Typography>
                
                {event.lots && event.lots.length > 0 ? (
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={selectedLotId || ''}
                      onChange={(e) => setSelectedLotId(Number(e.target.value))}
                    >
                      {event.lots.map((lot) => {
                        const isAvailable = 
                          lot.status === 'active' &&
                          lot.quantity > 0 &&
                          dayjs(lot.start_date).isBefore(dayjs()) &&
                          dayjs(lot.end_date).isAfter(dayjs());

                        const isExpired = dayjs(lot.end_date).isBefore(dayjs());
                        const isSoldOut = lot.quantity <= 0;
                        const isFuture = dayjs(lot.start_date).isAfter(dayjs());

                        return (
                          <Box key={lot.id} sx={{ 
                            mb: 2, 
                            opacity: isAvailable ? 1 : 0.6,
                            p: 2,
                            border: selectedLotId === lot.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            borderRadius: 1,
                            bgcolor: selectedLotId === lot.id ? '#f3f8ff' : 'transparent'
                          }}>
                            <FormControlLabel
                              value={lot.id}
                              control={<Radio />}
                              label=""
                              disabled={!isAvailable}
                              sx={{ width: '100%', margin: 0 }}
                            />
                            <Box sx={{ ml: 4 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {lot.name}
                              </Typography>
                              <Typography variant="h6" color="primary" gutterBottom>
                                R$ {lot.price ? Number(lot.price).toFixed(2) : '0.00'}
                              </Typography>
                              
                              {isAvailable ? (
                                <>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {lot.quantity} ingressos disponíveis
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Válido até {dayjs(lot.end_date).format('DD/MM/YYYY HH:mm')}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Válido até {dayjs(lot.end_date).format('DD/MM/YYYY HH:mm')}
                                  </Typography>
                                  <Typography variant="body2" color="error" gutterBottom>
                                    {isSoldOut ? '🔴 Ingressos esgotados' : 
                                     isExpired ? '⏰ Período encerrado' :
                                     isFuture ? '⏳ Em breve' : '❌ Indisponível'}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <Typography variant="body1" color="error">
                    Nenhum lote disponível para este evento
                  </Typography>
                )}

                {/* Resumo dos Valores */}
                {(selectedLotId || cartProducts.length > 0) && renderValueSummary()}

                {/* Botão para Inscrição */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleGoToInscription}
                  disabled={!selectedLotId}
                  sx={{ mt: 3 }}
                >
                  {selectedLotId ? 'Ir para Inscrição' : 'Selecione um Lote'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Evento; 