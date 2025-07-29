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
            <div
              key={ev.id}
              style={{ 
                width: '100vw', 
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Container do evento com bordas e sombra */}
              <a
                href={`/evento/${ev.slug || ev.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="event-card"
                style={{ 
                  width: '90%',
                  maxWidth: '800px',
                  height: '80%',
                  display: 'block',
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  border: '3px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 30px 60px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
              >
                {/* Banner do evento */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  background: 'linear-gradient(45deg, #000, #333)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '40px'
                }}>
                  
                  {/* Logo/Ícone do evento */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '4px solid rgba(255,255,255,0.2)'
                  }}>
                    <span style={{ fontSize: '3rem', color: 'white' }}>🎫</span>
                  </div>
                  
                  {/* Título do evento */}
                  <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 20px 0',
                    textAlign: 'center',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    lineHeight: '1.2'
                  }}>
                    {ev.title}
                  </h1>
                  
                  {/* Data do evento */}
                  <div style={{
                    fontSize: '1.5rem',
                    color: '#ffd700',
                    marginBottom: '30px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📅 {ev.date ? new Date(ev.date).toLocaleDateString('pt-BR') : 'Data a definir'}
                  </div>
                  
                  {/* Local do evento */}
                  {ev.location && (
                    <div style={{
                      fontSize: '1.2rem',
                      color: '#87ceeb',
                      marginBottom: '30px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      📍 {ev.location}
                    </div>
                  )}
                  
                  {/* Botão de ação */}
                  <div className="event-button" style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    color: 'white',
                    padding: '15px 40px',
                    borderRadius: '50px',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    🎫 CLIQUE PARA VER DETALHES
                  </div>
                  
                  {/* Indicador de clique */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#333',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}>
                    👆 CLICÁVEL
                  </div>
                </div>
              </a>
            </div>
          )) : (
            <Typography sx={{ color: '#888', fontSize: { xs: 16, sm: 20 } }}>Nenhum evento cadastrado</Typography>
          )}
        </Box>
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
