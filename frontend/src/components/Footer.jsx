import React from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  const socialLinks = {
    facebook: 'https://facebook.com/suaigreja',
    instagram: 'https://instagram.com/suaigreja',
    youtube: 'https://youtube.com/suaigreja'
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        background: 'linear-gradient(180deg, #fff 0%, #f5f5f5 100%)',
        color: '#222',
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4
          }}
        >
          {/* Logo e informações */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, mb: 2 }}>
            <img
              src="/images_site/logo.png"
              alt="Logo da Igreja"
              style={{ height: 70, marginBottom: 8 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#222', mb: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              Avenida dos trabalhadores, 199 - CAJATI/SP
            </Typography>
            <Typography variant="body1" sx={{ color: '#222', mb: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              WhatsApp: <a href="https://wa.me/" style={{ color: '#222', textDecoration: 'underline' }}>Clique aqui</a>
            </Typography>
            <Typography variant="body1" sx={{ color: '#222', mb: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              E-mail: <a href="mailto:secretariacemcajati@gmail.com" style={{ color: '#222', textDecoration: 'underline' }}>secretariacemcajati@gmail.com</a>
            </Typography>
          </Box>

          {/* Links úteis */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, gap: 1, mb: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>Links Úteis</Typography>
            <a href="/sobre" style={{ color: '#222', textDecoration: 'none', fontSize: 16, marginBottom: 2 }}>Sobre nós</a>
            <a href="/faq" style={{ color: '#222', textDecoration: 'none', fontSize: 16, marginBottom: 2 }}>FAQ</a>
            <a href="/privacidade" style={{ color: '#222', textDecoration: 'none', fontSize: 16, marginBottom: 2 }}>Política de Privacidade</a>
            <a href="/termos" style={{ color: '#222', textDecoration: 'none', fontSize: 16, marginBottom: 2 }}>Termos de Uso</a>
            <a href="/contato" style={{ color: '#222', textDecoration: 'none', fontSize: 16 }}>Contato</a>
          </Box>

          {/* Redes Sociais */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              color="primary"
              aria-label="Facebook"
              component="a"
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                '&:hover': { 
                  color: '#1877f2',
                  backgroundColor: 'rgba(24, 119, 242, 0.1)'
                }
              }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="Instagram"
              component="a"
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                '&:hover': { 
                  color: '#e4405f',
                  backgroundColor: 'rgba(228, 64, 95, 0.1)'
                }
              }}
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="YouTube"
              component="a"
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                '&:hover': { 
                  color: '#ff0000',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)'
                }
              }}
            >
              <YouTubeIcon />
            </IconButton>
          </Box>
        </Box>
        {/* Copyright e créditos */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#888' }}>
            © 2025 Igreja CEM - desenvolvido por MIDIA CEM
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 