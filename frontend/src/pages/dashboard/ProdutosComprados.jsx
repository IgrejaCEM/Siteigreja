import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Event as EventIcon
} from '@mui/icons-material';
import api from '../../services/api';

const ProdutosComprados = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchTerm, registrations]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/registrations-with-products');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Erro ao buscar registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    if (!searchTerm) {
      setFilteredRegistrations(registrations);
      return;
    }

    const filtered = registrations.filter(registration => 
      registration.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.participant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.products?.some(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRegistrations(filtered);
  };

  const calculateTotalProducts = (registration) => {
    return registration.products?.reduce((total, product) => 
      total + (product.quantity * parseFloat(product.price)), 0
    ) || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ShoppingCartIcon sx={{ mr: 2 }} />
        Produtos Comprados
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Compras
              </Typography>
              <Typography variant="h4">
                {registrations.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Produtos Vendidos
              </Typography>
              <Typography variant="h4">
                {registrations.reduce((total, reg) => 
                  total + (reg.products?.length || 0), 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Valor Total
              </Typography>
              <Typography variant="h4">
                R$ {registrations.reduce((total, reg) => 
                  total + calculateTotalProducts(reg), 0
                ).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Compras Pagas
              </Typography>
              <Typography variant="h4">
                {registrations.filter(reg => reg.payment_status === 'paid').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Pesquisa */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nome, email, evento ou produto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {filteredRegistrations.length === 0 ? (
        <Alert severity="info">
          Nenhuma compra de produtos encontrada.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participante</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Produtos</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Valor Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {registration.participant_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {registration.participant_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {registration.event_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {registration.products?.map((product, index) => (
                      <Chip
                        key={product.id}
                        label={product.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {registration.products?.reduce((total, product) => 
                      total + product.quantity, 0
                    ) || 0}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      R$ {calculateTotalProducts(registration).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(registration.payment_status)}
                      color={getStatusColor(registration.payment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProdutosComprados; 