import { Box, Typography, Button, Container, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroSection({ content }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Dados do carrossel
  const slides = [
    {
      title: 'Bem-vindo à Igreja CEM',
      subtitle: 'Um lugar de fé, esperança e amor',
      buttonText: 'Conheça Nossos Eventos',
      backgroundImage: '/images_site/banner-home.png'
    },
    {
      title: 'Junte-se a Nós',
      subtitle: 'Venha fazer parte da nossa família',
      buttonText: 'Saiba Mais',
      backgroundImage: '/images_site/banner-home-2.png'
    },
    {
      title: 'Eventos Especiais',
      subtitle: 'Participe das nossas celebrações',
      buttonText: 'Ver Eventos',
      backgroundImage: '/images_site/banner-home-3.png'
    }
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
      <Swiper
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="hero-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: `url("${slide.backgroundImage}") center/cover no-repeat`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(45,45,45,0.85) 100%)',
                  zIndex: 0,
                },
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    color: 'white',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: theme.spacing(3),
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: isMobile ? '2.5rem' : '4rem',
                      fontWeight: 'bold',
                      marginBottom: theme.spacing(2),
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {slide.title}
                  </Typography>
                  
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: isMobile ? '1.5rem' : '2rem',
                      marginBottom: theme.spacing(4),
                      opacity: 0.9,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {slide.subtitle}
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/eventos')}
                    sx={{
                      fontSize: isMobile ? '1rem' : '1.2rem',
                      padding: theme.spacing(2, 4),
                      borderRadius: '30px',
                      textTransform: 'none',
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease',
                      },
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}
                  >
                    {slide.buttonText}
                  </Button>
                </Box>
              </Container>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Segundo carrossel (miniaturas) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          width: '80%',
          maxWidth: '600px',
        }}
      >
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={3}
          navigation={true}
          className="thumb-swiper"
          watchSlidesProgress={true}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <Box
                sx={{
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: `url("${slide.backgroundImage}") center/cover no-repeat`,
                  }}
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
} 