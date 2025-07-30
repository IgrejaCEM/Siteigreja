import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme, Container, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CartIcon from './CartIcon';

export default function ModernHeader() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'O QUE É', href: '#oque-e' },
    { label: 'FAQ', href: '#faq' },
    { label: 'GARANTA SEU INGRESSO', href: '#ingressos', isButton: true }
  ];

  const handleMenuClick = (href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const handleItemClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        py: 2,
      }}
    >
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: { xs: '100%', sm: '90%', md: '70%' },
            bgcolor: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            px: { xs: 2, sm: 4 },
            py: 1.5,
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
          }}
        >
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <img
              src="/images_site/logo.png"
              alt="Logo"
              style={{ 
                height: isMobile ? 50 : 70,
                marginRight: 8 
              }}
            />
          </Box>

          {/* Menu Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {menuItems.map((item) => 
                item.isButton ? (
                  <Button
                    key={item.label}
                    variant="text"
                    size="large"
                    sx={{
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff5252 0%, #d63031 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                      },
                    }}
                    onClick={() => handleItemClick(item.href)}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Typography
                    key={item.label}
                    variant="body1"
                    sx={{
                      color: '#fff',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#ff6b6b',
                      },
                    }}
                    onClick={() => handleItemClick(item.href)}
                  >
                    {item.label}
                  </Typography>
                )
              )}
              
              {/* Carrinho */}
              <CartIcon />
            </Box>
          )}

          {/* Menu Mobile */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CartIcon />
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: '#fff' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Container>

      {/* Drawer Mobile */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Menu
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.label}
                button
                onClick={() => handleMenuClick(item.href)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: item.isButton ? 600 : 400,
                      color: item.isButton ? '#ff6b6b' : '#fff',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
} 