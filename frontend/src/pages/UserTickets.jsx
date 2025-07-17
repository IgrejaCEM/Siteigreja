import { useEffect, useState } from 'react';
import { Typography, Card, CardContent, Button, Grid } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function UserTickets() {
  const [ingressos, setIngressos] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
          axios.get(`${API_BASE_URL}/user/tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setIngressos(res.data));
  }, []);
  return (
    <div>
      <Typography variant="h5" gutterBottom>Meus Ingressos</Typography>
      <Grid container spacing={2}>
        {ingressos.map(ev => (
          <Grid item xs={12} md={6} lg={4} key={ev.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{ev.title}</Typography>
                <Typography variant="body2" color="text.secondary">Data: {ev.date}</Typography>
                <Button variant="outlined" size="small" onClick={() => navigate(`/evento/${ev.id}`)}>Ver Evento</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
} 