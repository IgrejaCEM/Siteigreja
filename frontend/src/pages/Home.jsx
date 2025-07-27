import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Container, Card, CardContent, CardMedia, CardActions, Skeleton, Alert, Chip, Divider, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
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
        
        // Carregar o conteúdo personalizado
        const contentResponse = await api.get('/settings/home-content');
        setContent(contentResponse.data.content || '');
        setCss(contentResponse.data.css || '');

        // Carregar o layout personalizado
        const layoutResponse = await api.get('/settings/home-layout');
        setLayout(layoutResponse.data?.layout || []);

        // Carregar eventos
        const eventsResponse = await api.get('/events');
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setError('Erro ao carregar eventos. Tente novamente mais tarde.');
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
            textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
            background: 'linear-gradient(45deg, #000 0%, #333 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'titlePulse 2s infinite',
            '@keyframes titlePulse': {
              '0%, 100%': {
                transform: 'scale(1)'
              },
              '50%': {
                transform: 'scale(1.02)'
              }
            }
        }}>
          JÁ ENTENDEU QUE<br />NÃO PODE FICAR DE FORA NÉ?
        </Typography>
        <Typography sx={{
          mb: 4,
          textAlign: 'center',
            color: '#666',
            fontSize: { xs: '1.5rem', md: '2rem' },
          fontWeight: 500,
          fontFamily: 'inherit',
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
            <a
              key={ev.id}
              href={`/evento/${ev.slug || ev.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                width: '100vw', 
                height: '100vh',
                display: 'block', 
                margin: 0,
                padding: 0,
                position: 'relative'
              }}
            >
              <img
                src={ev.banner || 'https://via.placeholder.com/900x400?text=Evento'}
                alt={ev.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  margin: 0,
                  padding: 0
                }}
              />
            </a>
          )) : (
            <Typography sx={{ color: '#888', fontSize: { xs: 16, sm: 20 } }}>Nenhum evento cadastrado</Typography>
          )}
        </Box>
      </Box>
      <style>{css}</style>
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
