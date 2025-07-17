import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';

// Função utilitária para obter usuário do localStorage
function getUserFromLocalStorage() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MeusEventos = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUserFromLocalStorage();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar eventos');
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timeString) => {
    return format(new Date(`2000-01-01T${timeString}`), 'HH:mm');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          Por favor, faça login para ver seus eventos.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meus Eventos
      </Typography>

      {events.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Você ainda não está registrado em nenhum evento.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {event.title}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<CalendarIcon />}
                      label={formatDate(event.date)}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      icon={<TimeIcon />}
                      label={formatTime(event.time)}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {event.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {event.organizer}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => navigate(`/eventos/${event.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MeusEventos; 