import { Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <h1>Dashboard</h1>
      </Box>
      <p>Bem-vindo ao painel administrativo!</p>
    </Box>
  );
} 