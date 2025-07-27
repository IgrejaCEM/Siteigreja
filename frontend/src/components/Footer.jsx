import React from 'react';
import { Box, Container, Typography, IconButton, Grid } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Footer() {
  const phoneNumber = "13997783327";
  const message = "Olá! Estou entrando em contato para saber informações sobre a conferência CONNECT CONF - IMPROVÁVEIS. Poderia me ajudar?";

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#000',
        color: '#fff',
        py: 6,
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <img
              src="/images_site/logo.png"
              alt="Logo"
              style={{ height: 80, marginBottom: 16 }}
            />
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                onClick={handleWhatsAppClick}
                sx={{
                  color: '#25D366',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'transform 0.2s'
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <IconButton
                href="https://www.instagram.com/adlscem"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#E1306C',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'transform 0.2s'
                }}
              >
                <InstagramIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mt: 2 }}>
              © {new Date().getFullYear()} Connect Conf. Todos os direitos reservados.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 