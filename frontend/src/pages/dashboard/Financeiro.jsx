import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ArcElement
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Legend
);

dayjs.locale('pt-br');

const Financeiro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTicketValue: 0,
    revenueByEvent: {},
    revenueByPaymentMethod: {},
    revenueByMonth: {}
  });

  // Filtros
  const [filters, setFilters] = useState({
    eventId: '',
    startDate: dayjs().subtract(30, 'days'),
    endDate: dayjs(),
    paymentStatus: '',
    paymentMethod: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadFinancialData();
  }, [filters]);

  const loadEvents = async () => {
    try {
      const response = await api.get('/admin/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const loadFinancialData = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchData = async () => {
        try {
          const [transactionsRes, summaryRes] = await Promise.all([
            api.get('/financial/transactions', { params: filters }),
            api.get('/financial/summary', { params: filters })
          ]);
          setTransactions(transactionsRes.data);
          setSummary(summaryRes.data);
          setError('');
        } catch (error) {
          console.error('Erro ao carregar dados financeiros:', error);
          setError('Erro ao carregar dados financeiros. Por favor, tente novamente.');
        }
      };

      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/financial/export', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio-financeiro.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      setError('Erro ao exportar relatório. Por favor, tente novamente.');
    }
  };

  // Configuração dos gráficos com IDs únicos
  const revenueByEventChart = {
    id: 'revenueByEventChart',
    labels: Object.keys(summary.revenueByEvent),
    datasets: [{
      id: 'revenueByEventDataset',
      data: Object.values(summary.revenueByEvent),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };

  const revenueByMonthChart = {
    id: 'revenueByMonthChart',
    labels: Object.keys(summary.revenueByMonth),
    datasets: [{
      id: 'revenueByMonthDataset',
      label: 'Receita por Mês',
      data: Object.values(summary.revenueByMonth),
      backgroundColor: '#36A2EB'
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financeiro
      </Typography>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Receita Total</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: 'success.main' }}>
                  R$ {summary.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total de Transações</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {summary.totalTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PieChartIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6">Ticket Médio</Typography>
                </Box>
                <Typography variant="h4" color="secondary">
                  R$ {summary.averageTicketValue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Evento</InputLabel>
                <Select
                  value={filters.eventId}
                  onChange={(e) => handleFilterChange('eventId')(e.target.value)}
                  label="Evento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Data Inicial"
                  value={filters.startDate}
                  onChange={handleFilterChange('startDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Data Final"
                  value={filters.endDate}
                  onChange={handleFilterChange('endDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus')(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="paid">Pago</MenuItem>
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="failed">Falhou</MenuItem>
                  <MenuItem value="refunded">Reembolsado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Método</InputLabel>
                <Select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod')(e.target.value)}
                  label="Método"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="credit_card">Cartão de Crédito</MenuItem>
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="boleto">Boleto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Atualizar">
                  <IconButton onClick={loadFinancialData} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Exportar Excel">
                  <IconButton onClick={handleExport} color="success">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Gráficos */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Receita por Evento
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {Object.keys(summary.revenueByEvent).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma receita registrada por evento
                        </Typography>
                      ) : (
                        <Pie data={revenueByEventChart} options={chartOptions} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Receita por Mês
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {Object.keys(summary.revenueByMonth).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma receita registrada por mês
                        </Typography>
                      ) : (
                        <Bar data={revenueByMonthChart} options={chartOptions} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Tabela de Transações */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transações
              </Typography>
              {transactions.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 4
                }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Nenhuma transação encontrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    As transações aparecerão aqui quando houver pagamentos registrados no sistema.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Evento</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Método</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.event_title}</TableCell>
                          <TableCell>
                            {dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm')}
                          </TableCell>
                          <TableCell>{transaction.customer_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.payment_method}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            R$ {transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={
                                transaction.status === 'paid' ? 'success' :
                                transaction.status === 'pending' ? 'warning' :
                                transaction.status === 'failed' ? 'error' :
                                'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Financeiro; 