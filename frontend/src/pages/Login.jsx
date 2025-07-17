import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError(''); // Limpa o erro quando o usuário começa a digitar
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      // O redirecionamento será feito pelo useEffect
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err.toString() || 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f5f5'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img
            src="/images_site/logo.png"
            alt="Logo"
            style={{ height: 80, maxWidth: '100%', marginBottom: 16 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Login Administrativo
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email ou Usuário"
            name="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
            required
            autoComplete="username"
          />
          <TextField
            fullWidth
            label="Senha"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
            required
            autoComplete="current-password"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
} 