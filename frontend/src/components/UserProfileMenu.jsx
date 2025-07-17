import { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function UserProfileMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  let user = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      user = jwtDecode(token);
    } catch {}
  }
  if (!user) return null;
  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button variant="outlined" onClick={() => navigate('/meus-ingressos')}>Meus Ingressos</Button>
      <IconButton onClick={handleMenu} color="inherit">
        <Avatar sx={{ bgcolor: '#1976d2' }}>{user.name ? user.name[0].toUpperCase() : 'U'}</Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem disabled>{user.name}</MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate('/gestao-conta'); }}>Gestão de Conta</MenuItem>
        <MenuItem onClick={handleLogout}>Sair</MenuItem>
      </Menu>
    </Box>
  );
} 