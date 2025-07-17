import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button, Divider, Chip, Alert, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon
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
      
      <Box
        component="img"
        src={event.banner_evento || event.banner || '/placeholder-event.jpg'}
        alt={event.title}
        sx={{
          width: '100%',
          height: '400px',
          objectFit: 'cover',
          mb: 4,
          mt: '80px',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Contador centralizado sobrepondo levemente o banner */}
      {event.date && (
        <Box sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 420, // mais para baixo, só sobrepondo um pouco
          display: 'flex',
          justifyContent: 'center',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 2,
            boxShadow: 3,
            p: 1.5,
            minWidth: 320,
            pointerEvents: 'auto',
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{timeLeft.days}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>dias</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mx: 0.5 }}>:</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{String(timeLeft.hours).padStart(2, '0')}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>horas</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mx: 0.5 }}>:</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{String(timeLeft.minutes).padStart(2, '0')}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>min</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mx: 0.5 }}>:</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{String(timeLeft.seconds).padStart(2, '0')}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>seg</Typography>
            </Box>
          </Box>
        </Box>
      )}

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

            <EventProducts eventId={event.id} />
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: '100px' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Ingressos
                </Typography>
                
                {hasAvailableLots ? (
                  event.lots.map((lot) => {
                    const isAvailable = 
                      lot.status === 'active' &&
                      lot.quantity > 0 &&
                      dayjs(lot.start_date).isBefore(dayjs()) &&
                      dayjs(lot.end_date).isAfter(dayjs());

                    return (
                      <Box key={lot.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {lot.name}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          R$ {lot.price ? Number(lot.price).toFixed(2) : '0.00'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {lot.quantity} ingressos disponíveis
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Válido até {dayjs(lot.end_date).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                        {isAvailable ? (
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => navigate(`/evento/${event.slug}/inscricao`)}
                          >
                            Comprar Ingresso
                          </Button>
                        ) : (
                          <Typography variant="body2" color="error">
                            {lot.quantity <= 0 ? 'Ingressos esgotados' : 'Fora do período de vendas'}
                          </Typography>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body1" color="error">
                    Ingressos esgotados ou fora do período de vendas
                  </Typography>
                )}
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