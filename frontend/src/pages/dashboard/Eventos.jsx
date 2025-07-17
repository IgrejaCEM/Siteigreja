import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CardMedia,
  CardActions,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import "../../AdminEvents.css";
import ErrorBoundary from '../../components/ErrorBoundary';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventos();

    // Atualizar a lista a cada 5 segundos
    const interval = setInterval(() => {
      fetchEventos();
    }, 5000);

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  const fetchEventos = async () => {
    try {
      const response = await api.get('/admin/events');
      console.log('Resposta da API:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Formato de dados inválido');
      }
      
      setEventos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err.response || err);
      setError(err.response?.data?.message || 'Erro ao carregar eventos');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await api.delete(`/admin/events/${id}`);
        fetchEventos();
      } catch (err) {
        console.error('Erro ao deletar evento:', err);
        setError(err.response?.data?.message || 'Erro ao deletar evento');
      }
    }
  };

  const handleEdit = (evento) => {
    navigate(`/admin/editar-evento/${evento.id}`);
  };

  const handleView = (evento) => {
    navigate(`/evento/${evento.slug}`);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return 'Data inválida';
    }
  };

  const renderEvents = () => {
    if (!Array.isArray(eventos) || eventos.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 4,
          p: 3,
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <EventIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum evento encontrado
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/criar-evento')}
            sx={{ mt: 2 }}
          >
            Criar Primeiro Evento
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {eventos.map((evento) => (
          <Grid key={evento.id} item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image={evento.banner || "https://via.placeholder.com/300x200?text=Imagem+do+Evento"}
                alt={evento.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography gutterBottom variant="h5" component="div" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 0 }}>
                    {evento.title || 'Sem título'}
                  </Typography>
                  <Chip 
                    label={evento.status === 'active' ? 'Ativo' : 'Inativo'} 
                    color={evento.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {evento.description || 'Sem descrição'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                  Data: {formatDate(evento.date)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                  Local: {evento.location || 'Local não definido'}
                </Typography>
                {evento.price && (
                  <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', mt: 1 }}>
                    Preço: R$ {Number(evento.price).toFixed(2)}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ bgcolor: 'white', p: 2, borderTop: '1px solid #eee' }}>
                <Button 
                  size="small" 
                  onClick={() => handleEdit(evento)}
                  sx={{ 
                    color: '#1976d2',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  Editar
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => handleDelete(evento.id)}
                  sx={{ 
                    '&:hover': { backgroundColor: '#ffebee' }
                  }}
                >
                  Excluir
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <ErrorBoundary>
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Eventos
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchEventos}
              sx={{ mr: 2 }}
            >
              Atualizar Lista
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/admin/criar-evento')}
            >
              Criar Evento
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderEvents()
        )}
      </Paper>
    </ErrorBoundary>
  );
};

export default Eventos; 