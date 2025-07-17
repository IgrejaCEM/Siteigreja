import { Box, Typography, Button, IconButton, useMediaQuery, useTheme, Container, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

export default function ModernHeader() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'O QUE É', href: '#oque-e' },
    { label: 'FAQ', href: '/faq' },
    { label: 'GARANTA SEU INGRESSO', href: '/eventos', isButton: true }
  ];

  const handleMenuClick = (href) => {
    setMobileMenuOpen(false);
    navigate(href);
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
                      py: 1,
                      fontWeight: 700,
                      color: '#fff',
                      background: 'transparent',
                      letterSpacing: 1,
                      boxShadow: 'none',
                      border: 'none',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.10)',
                        color: '#FF6B6B',
                      },
                    }}
                    onClick={() => navigate(item.href)}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Typography
                    key={item.label}
                    variant="subtitle1"
                    sx={{
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                      letterSpacing: 1,
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      transition: 'background 0.2s',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.10)',
                      },
                    }}
                    onClick={() => navigate(item.href)}
                  >
                    {item.label}
                  </Typography>
                )
              )}
            </Box>
          )}

          {/* Menu Mobile */}
          {isMobile && (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: '#fff' }}
              >
                <MenuIcon />
              </IconButton>
              
              <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                PaperProps={{
                  sx: {
                    width: '80%',
                    maxWidth: 300,
                    bgcolor: 'rgba(26,26,26,0.95)',
                    backdropFilter: 'blur(8px)',
                  }
                }}
              >
                <List sx={{ pt: 4 }}>
                  {menuItems.map((item) => (
                    <ListItem 
                      key={item.label}
                      onClick={() => handleMenuClick(item.href)}
                      sx={{
                        py: 2,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={item.label} 
                        sx={{ 
                          color: '#fff',
                          '& .MuiTypography-root': {
                            fontWeight: item.isButton ? 700 : 600,
                            letterSpacing: 1,
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
} 