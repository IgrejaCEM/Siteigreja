import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ background: '#fff', color: '#222', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar style={{ minHeight: 64, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/images_site/logo.png"
            alt="Logo"
            style={{ height: 45, maxWidth: '100%' }}
          />
          <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 600 }}>
            Painel Administrativo
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 