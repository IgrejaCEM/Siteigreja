import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Container, Card, CardContent, CardMedia, CardActions, Skeleton, Alert, Chip, Divider, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ModernHeader from '../components/ModernHeader';
import HeroSection from '../components/HeroSection';
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
  <footer style="background:#222;color:#fff;padding:24px;text-align:center;">
    © 2025 Igreja CEM. Todos os direitos reservados.
  </footer>
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
    return html.replace(/<[/]?body[^>]*>/gi, '');
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
      <img
        src="https://i.postimg.cc/nrtZwtNn/BANNER-CONNECT-CONF.gif"
        alt="Hero Banner"
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
      {/* Título acima do vídeo do YouTube */}
      <Box sx={{ width: '100%', background: '#000', py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography sx={{
          color: '#fff',
          fontSize: { xs: '2rem', md: '3rem' },
          fontWeight: 900,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: `'Oswald', 'Impact', 'Arial Narrow', Arial, sans-serif`,
        }}>
          Entrou para a festa!
        </Typography>
      </Box>
      {/* Video do YouTube abaixo do banner */}
      <Box sx={{ width: '100%', background: '#000', py: 4, display: 'flex', justifyContent: 'center' }}>
        <iframe
          width="1000"
          height="450"
          src="https://www.youtube.com/embed/aNOVuL1JNYk?rel=0&autoplay=0"
          title="CONNECT CONF Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        />
      </Box>
      {/* Eventos após o vídeo do YouTube */}
      <Box sx={{ width: '100%', py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{
          mb: 0,
          textAlign: 'center',
          fontWeight: 900,
          color: '#222',
          fontSize: { xs: '2.2rem', md: '3.2rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          lineHeight: 1.05,
          fontFamily: `'Oswald', 'Impact', 'Arial Narrow', Arial, sans-serif`,
        }}>
          JÁ ENTENDEU QUE<br />NÃO PODE FICAR DE FORA NÉ?
        </Typography>
        <Typography sx={{
          mb: 4,
          textAlign: 'center',
          color: '#222',
          fontSize: { xs: '1.2rem', md: '1.6rem' },
          fontWeight: 500,
          fontFamily: 'inherit',
        }}>
          Escolha seu ingresso abaixo
        </Typography>
        <Box sx={{ width: '100%', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {events.length > 0 ? events.map(ev => (
            <a
              key={ev.id}
              href={`/evento/${ev.slug || ev.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%', maxWidth: 900, display: 'block', margin: '24px auto' }}
            >
              <img
                src={ev.banner || 'https://via.placeholder.com/900x400?text=Evento'}
                alt={ev.title}
                style={{
                  width: '100%',
                  maxWidth: 900,
                  height: 'auto',
                  objectFit: 'cover',
                  borderRadius: 24,
                  boxShadow: '0 2px 12px #0002',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </a>
          )) : (
            <Typography sx={{ color: '#888', fontSize: 20 }}>Nenhum evento cadastrado</Typography>
          )}
        </Box>
      </Box>
      <style>{css}</style>
      {htmlToShow && renderWithEventSection(htmlToShow)}
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
