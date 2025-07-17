import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, Alert, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import dayjs from 'dayjs';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Converter data para YYYY-MM-DD
      let birthdateToSend = '';
      if (birthdate) {
        const [d, m, y] = birthdate.split('/');
        birthdateToSend = `${y}-${m}-${d}`;
      }
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        username,
        email,
        password,
        birthdate: birthdateToSend,
        gender
      });
      // Login automático após cadastro
      const loginRes = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });
      localStorage.setItem("token", loginRes.data.token);
      setName(""); setEmail(""); setPassword(""); setBirthdate(""); setGender(""); setUsername("");
      navigate("/"); // Redireciona para a página Home
    } catch (err) {
      setError("Erro ao criar conta. Tente outro e-mail ou usuário.");
    }
  };

  useEffect(() => {
    document.body.style.background = "#fff";
    document.body.style.color = "#222";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  return (
    <Box className="container mt-5" maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>Criar Conta</Typography>
      <form onSubmit={handleRegister}>
        <TextField label="Nome" fullWidth margin="normal" value={name} onChange={e => setName(e.target.value)} required />
        <TextField label="Nome de usuário" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required />
        <TextField label="E-mail" type="email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
        <TextField label="Data de nascimento" fullWidth margin="normal" value={birthdate} onChange={e => setBirthdate(e.target.value.replace(/[^0-9/]/g, '').slice(0, 10))} placeholder="DD/MM/AAAA" required />
        <TextField label="Gênero" fullWidth margin="normal" value={gender} onChange={e => setGender(e.target.value)} select required>
          <MenuItem value="masculino">Masculino</MenuItem>
          <MenuItem value="feminino">Feminino</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
          <MenuItem value="">Prefiro não informar</MenuItem>
        </TextField>
        <TextField label="Senha" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained" color="primary" fullWidth>Criar Conta</Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
} 