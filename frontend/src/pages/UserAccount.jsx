import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, Grid, IconButton } from '@mui/material';
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const initialState = {
  name: '', email: '', phone: '', address: '', cpf: '', birthdate: '', cep: '', bairro: '', numero: '', complemento: '', cidade: '', estado: ''
};

export default function UserAccount() {
  const [form, setForm] = useState(initialState);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const navigate = useNavigate();

  const banners = [
    { id: 1, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', title: 'Congresso Jovem' },
    { id: 2, img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80', title: 'Retiro Espiritual' },
    { id: 3, img: 'https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?auto=format&fit=crop&w=800&q=80', title: 'Encontro de Casais' },
    { id: 4, img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', title: 'Workshop de Música' },
    { id: 5, img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', title: 'Palestra Motivacional' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
          axios.get(`${API_BASE_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setForm({ ...initialState, ...res.data }));
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSuccess(''); setError('');
    try {
      const token = localStorage.getItem('token');
              await axios.put(`${API_BASE_URL}/auth/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Dados atualizados com sucesso!');
      setEdit(false);
    } catch {
      setError('Erro ao atualizar dados.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4 }}>
      <Swiper spaceBetween={20} slidesPerView={1} autoplay={{ delay: 3500 }} style={{ borderRadius: 12, marginBottom: 32 }}>
        {banners.map(b => (
          <SwiperSlide key={b.id}>
            <Box sx={{ position: 'relative', height: 220, overflow: 'hidden', borderRadius: 3, cursor: 'pointer' }} onClick={() => navigate(`/evento/${b.id}`)}>
              <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Typography variant="h5" sx={{ position: 'absolute', bottom: 16, left: 32, color: '#fff', textShadow: '0 2px 8px #000' }}>{b.title}</Typography>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/images_site/logo.png"
            alt="Logo"
            style={{ height: 55, maxWidth: '100%' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 500, color: '#1976d2' }}>Minha Conta</Typography>
        </Box>
        <IconButton onClick={handleLogout} color="error"><LogoutIcon /></IconButton>
      </Box>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Dados da Conta */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>Dados da Conta</Typography>
            <TextField label="Nome" name="name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={handleChange} InputProps={{ readOnly: !edit }} />
            <TextField label="E-mail" name="email" type="email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={handleChange} InputProps={{ readOnly: !edit }} />
            <TextField label="Senha" type="password" fullWidth sx={{ mb: 2 }} value={edit ? '' : '********'} InputProps={{ readOnly: true }} helperText={edit ? 'Funcionalidade de troca de senha em breve' : ''} />
          </Grid>
          {/* Dados de compra */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>Dados de compra</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nome do comprador" name="name" fullWidth value={form.name} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="CPF" name="cpf" fullWidth value={form.cpf} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Data de Nascimento" name="birthdate" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.birthdate} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Telefone" name="phone" fullWidth value={form.phone} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="CEP" name="cep" fullWidth value={form.cep} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Endereço" name="address" fullWidth value={form.address} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Bairro" name="bairro" fullWidth value={form.bairro} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Número" name="numero" fullWidth value={form.numero} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Complemento" name="complemento" fullWidth value={form.complemento} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cidade" name="cidade" fullWidth value={form.cidade} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Estado" name="estado" fullWidth value={form.estado} onChange={handleChange} InputProps={{ readOnly: !edit }} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {!edit ? (
            <Button variant="contained" sx={{ bgcolor: '#ff9800', color: '#fff' }} onClick={() => setEdit(true)}>EDITAR DADOS</Button>
          ) : (
            <Button variant="contained" color="primary" type="submit" onClick={handleSave}>SALVAR</Button>
          )}
        </Box>
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
} 