import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CartIcon from './CartIcon';

const ModernHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'O QUE É', path: '/#sobre' },
    { text: 'FAQ', path: '/#faq' }
  ];

  const drawer = (
    <Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated ? (
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Sair" />
          </ListItem>
        ) : (
          <ListItem 
            button 
            component={Link}
            to="/login"
            onClick={handleDrawerToggle}
          >
            <ListItemText primary="Entrar" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 'bold',
                flexGrow: 1
              }}
            >
              CONNECT
            </Typography>

            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
                
                {/* Carrinho */}
                <CartIcon />
                
                {isAuthenticated ? (
                  <Button
                    onClick={handleLogout}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Sair
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      color: 'white',
                      borderColor: 'white',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    Entrar
                  </Button>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CartIcon />
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            background: 'rgba(0,0,0,0.9)',
            color: 'white'
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default ModernHeader; 