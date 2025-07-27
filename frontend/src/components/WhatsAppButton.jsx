import React from 'react';
import { Box } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function WhatsAppButton() {
  const phoneNumber = "13997783327";
  const message = "Olá! Estou entrando em contato para saber informações sobre a conferência CONNECT CONF - IMPROVÁVEIS. Poderia me ajudar?";

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: { xs: 16, md: 32 },
        right: { xs: 16, md: 32 },
        width: { xs: 50, md: 60 },
        height: { xs: 50, md: 60 },
        borderRadius: '50%',
        backgroundColor: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        zIndex: 1000,
        '&:hover': {
          transform: 'scale(1.1)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        }
      }}
    >
      <WhatsAppIcon sx={{ 
        fontSize: { xs: 30, md: 35 }, 
        color: '#fff' 
      }} />
    </Box>
  );
} 