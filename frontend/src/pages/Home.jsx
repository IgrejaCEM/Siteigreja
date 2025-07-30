import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Container, Card, CardContent, CardMedia, CardActions, Skeleton, Alert, Chip, Divider, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ModernHeader from '../components/ModernHeader';
import HeroSection from '../components/HeroSection';
import ImpactSection from '../components/ImpactSection';
import ScrollSection from '../components/ScrollSection';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../services/api';
import EventCarousel from '../components/EventCarousel';
import EventoCompleto from '../components/EventoCompleto';

dayjs.locale('pt-br');

const defaultHtml = `
  <section style="padding:40px 0;text-align:center;">
    <h2>Próximos Eventos</h2>
    <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;">
      <div style="background:#f5f5f5;padding:24px;border-radius:8px;min-width:220px;max-width:320px;flex:1;">
        <h3>Evento 1</h3>
        <p>Descrição do evento 1</p>
      </div>
      <div style="background:#f5f5f5;padding:24px;border-radius:8px;min-width:220px;max-width:320px;flex:1;">
        <h3>Evento 2</h3>
        <p>Descrição do evento 2</p>
      </div>
    </div>
  </section>
`;

const Home = () => {
  const [content, setContent] = useState('');
  const [css, setCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [layout, setLayout] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const location = useLocation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Carregar o conteúdo personalizado com timeout maior
        const contentResponse = await api.get('/settings/home-content', {
          timeout: 30000 // 30 segundos
        });
        setContent(contentResponse.data.content || '');
        setCss(contentResponse.data.css || '');

        // Carregar o layout personalizado
        const layoutResponse = await api.get('/settings/home-layout', {
          timeout: 30000
        });
        setLayout(layoutResponse.data?.layout || []);

        // Carregar eventos
        const eventsResponse = await api.get('/events', {
          timeout: 30000
        });
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        // Se falhar, usar conteúdo padrão
        setContent(defaultHtml);
        setCss('');
        setLayout([]);
        setEvents([]);
        setError('Erro ao carregar conteúdo personalizado. Mostrando versão padrão.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []); // Remover location das dependências para evitar re-renders desnecessários

  // useEffect separado para lidar com mensagens de sucesso
  useEffect(() => {
    if (location.state?.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setOpenSnackbar(true);
      // Limpar a mensagem do histórico de navegação
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.successMessage]);

  const handleEventClick = (event) => {
    navigate(`/evento/${event.slug || event.id}`);
  };

  const getNextAvailableLot = (lots) => {
    if (!lots || lots.length === 0) return null;
    
    const now = dayjs();
    return lots
      .filter(lot => dayjs(lot.end_date).isAfter(now) && lot.quantity > 0)
      .sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date)))[0];
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Função para remover <body> e </body> do HTML vindo do backend
  const sanitizeHtml = (html) => {
    return html
      .replace(/<[/]?body[^>]*>/gi, '')
      .replace(/© 2025 CONNECT CONF\. Todos os direitos reservados\./g, '');
  };

  const htmlToShow = typeof content === 'string' ? sanitizeHtml(content) : '';

  // Função para substituir o placeholder do carrossel de eventos pelo componente dinâmico
  function renderWithEventSection(html) {
    const placeholder = /<div[^>]*id=["']proximos-eventos["'][^>]*><\/div>/gi;
    const parts = html.split(placeholder);
    const matches = html.match(placeholder);
    if (!matches) return <div dangerouslySetInnerHTML={{ __html: html }} />;
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      result.push(<div key={"html-"+i} dangerouslySetInnerHTML={{ __html: parts[i] }} />);
      // Removido o bloco azul entre o vídeo e o evento
    }
    return result;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ModernHeader />
        <HeroSection content={{
          title: 'Bem-vindo à Igreja CEM',
          subtitle: 'Um lugar de fé, esperança e amor',
          buttonText: 'Conheça Nossos Eventos',
          backgroundImage: '/images_site/banner-home.png'
        }} />
        <Box sx={{ py: 4, bgcolor: '#f5f5f5' }}>
          <Container>
            <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>
              {error}
            </Typography>
          </Container>
        </Box>
        <Footer />
        <WhatsAppButton />
      </Box>
    );
  }

  // Após a faixa animada, adicionar a seção de eventos
  return (
    <Box>
      <ModernHeader />
      <div style={{
        width: '100vw',
        background: '#000',
        paddingTop: '00px',
        margin: 0,
        boxSizing: 'border-box',
      }}>
        <video
          src="/images_site/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          display: 'block',
          background: '#000',
          borderRadius: 0,
          margin: 0,
          padding: 0,
        }}
      />
      </div>
      <ImpactSection />
      <ScrollSection />
      {/* Título acima do vídeo do YouTube */}
      <Box sx={{ 
        width: '100%', 
        background: '#000', 
        py: 6, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #fff, transparent)'
        }
      }}>
        <Typography sx={{
          color: '#fff',
          fontSize: { xs: '3.5rem', sm: '4.5rem', md: '6rem' },
          fontWeight: 900,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: `'Oswald', 'Impact', 'Arial Narrow', Arial, sans-serif`,
          textShadow: '0 0 20px rgba(255,255,255,0.3)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              textShadow: '0 0 20px rgba(255,255,255,0.3)'
            },
            '50%': {
              textShadow: '0 0 40px rgba(255,255,255,0.5)'
            },
            '100%': {
              textShadow: '0 0 20px rgba(255,255,255,0.3)'
            }
          }
        }}>
          Entrou para a festa!
        </Typography>
      </Box>
      {/* Video do YouTube abaixo do banner */}
      <Box sx={{ 
        width: '100vw',
        height: '100vh',
        background: '#000', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        mb: 0 // Removendo margem inferior
      }}>
        <Box sx={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}>
          <iframe
            src="https://www.youtube.com/embed/aNOVuL1JNYk?rel=0&autoplay=0"
            title="CONNECT CONF Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </Box>
      </Box>

      {/* Eventos após o vídeo do YouTube */}
      <Box 
        id="ingressos"
        sx={{ 
          width: '100%', 
          py: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 0, // Removendo margem superior
          scrollMarginTop: "100px"
        }}
      >
        <Box sx={{ pt: 8, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{
          mb: 0,
          textAlign: 'center',
          fontWeight: 900,
          color: '#222',
            fontSize: { xs: '3.5rem', md: '5rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          lineHeight: 1.05,
          fontFamily: `'Oswald', 'Impact', 'Arial Narrow', Arial, sans-serif`,
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            GARANTA JÁ SEU INGRESSO ABAIXO
            <Box
              component="span"
              sx={{
                fontSize: '2em',
                color: '#000',
                animation: 'bounce 2s infinite',
                mt: 2,
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)'
                  },
                  '40%': {
                    transform: 'translateY(10px)'
                  },
                  '60%': {
                    transform: 'translateY(5px)'
                  }
                }
              }}
            >
              ↓
            </Box>
        </Typography>
        </Box>
        <Box sx={{ 
          width: '100vw',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          margin: 0,
          padding: 0
        }}>
          {events.length > 0 ? events.map(ev => (
            <EventoCompleto key={ev.id} event={ev} />
          )) : (
            <Typography sx={{ color: '#888', fontSize: { xs: 16, sm: 20 } }}>Nenhum evento cadastrado</Typography>
          )}
        </Box>
      </Box>

      {/* Seção da Loja */}
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Loja da Igreja
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Produtos especiais para sua fé e devoção
          </Typography>
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/loja"
              sx={{ px: 4, py: 1.5 }}
            >
              Visitar Loja
            </Button>
          </Box>
        </Container>
      </Box>
      <style>{css}</style>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 8px 25px rgba(255,107,107,0.5); }
          100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        }
        
        .event-card {
          animation: float 3s ease-in-out infinite;
        }
        
        .event-button {
          animation: glow 2s ease-in-out infinite;
        }
        
        a:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4) !important;
        }
      `}</style>
      {htmlToShow && renderWithEventSection(htmlToShow)}
      <FAQSection />
      <Footer />
      <WhatsAppButton />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Home;
