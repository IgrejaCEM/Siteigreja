import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsAppButton = () => {
  const whatsappNumber = '5513997728988'; // Número atualizado
  const whatsappMessage = 'Olá! Gostaria de tirar algumas dúvidas sobre os eventos.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Tooltip title="Tire suas dúvidas pelo WhatsApp" placement="left">
      <IconButton
        component="a"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
          color: 'white',
          width: 60,
          height: 60,
          '&:hover': {
            background: 'linear-gradient(135deg, #128c7e 0%, #075e54 100%)',
            transform: 'scale(1.05)',
          },
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
      >
        <WhatsAppIcon sx={{ fontSize: 32 }} />
      </IconButton>
    </Tooltip>
  );
};

export default WhatsAppButton; 