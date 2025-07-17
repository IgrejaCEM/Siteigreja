import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, TableCell } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StatCard from '../../components/StatCard';
import api from '../../services/api';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalRevenue: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [inscricoesPorEvento, setInscricoesPorEvento] = useState([]);

  const fetchData = async () => {
    try {
      console.log('Buscando dados...');
      
      // Buscar estatísticas gerais
      const statsResponse = await api.get('/admin/stats');
      console.log('Estatísticas:', statsResponse.data);
      setStats(statsResponse.data);

      // Buscar eventos recentes
      const recentEventsRes = await api.get('/admin/events/active');
      console.log('Eventos:', recentEventsRes.data);
      setRecentEvents(recentEventsRes.data);

      // Buscar inscrições recentes
      const registrationsResponse = await api.get('/admin/registrations/recent');
      console.log('Inscrições:', registrationsResponse.data);
      setRecentRegistrations(registrationsResponse.data);

      // Buscar inscrições por evento
      const inscricoesRes = await api.get('/admin/registrations');
      // Agrupar por evento
      const counts = {};
      inscricoesRes.data.forEach(reg => {
        if (!reg.event_title) return;
        counts[reg.event_title] = (counts[reg.event_title] || 0) + 1;
      });
      setInscricoesPorEvento(Object.entries(counts).map(([title, count]) => ({ title, count })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    }
  };

  useEffect(() => {
    console.log('useEffect do AdminDashboard rodou');
    fetchData();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Dados do gráfico de inscrições por evento
  const chartData = {
    labels: inscricoesPorEvento.map(e => e.title),
    datasets: [
      {
        label: 'Inscrições',
        data: inscricoesPorEvento.map(e => e.count),
        backgroundColor: 'rgba(33, 150, 243, 0.7)'
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Inscrições por Evento' }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      {/* Estatísticas Gerais */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total de Eventos"
              value={stats.totalEvents}
              icon={<EventIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Eventos Ativos"
              value={stats.activeEvents}
              icon={<EventAvailableIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total de Participantes"
              value={stats.totalParticipants}
              icon={<PeopleIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Receita Total"
              value={`R$ ${stats.totalRevenue?.toFixed(2) || '0.00'}`}
              icon={<MonetizationOnIcon />}
            />
          </Grid>
        </Grid>
      </Box>
      {/* Gráfico de Inscrições por Evento */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Bar data={chartData} options={chartOptions} height={80} />
      </Box>

      {/* Listas */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eventos Ativos
                </Typography>
                <List>
                  {recentEvents.map((event) => (
                    <ListItem key={event.id}>
                      <ListItemText
                        primary={event.title}
                        secondary={`${dayjs(event.date).format('DD/MM/YYYY')} - ${event.location}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={event.status === 'active' ? 'Ativo' : 'Encerrado'}
                          color={event.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          {/* Removido o painel de inscrições recentes */}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 