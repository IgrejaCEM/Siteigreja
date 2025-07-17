import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import api from '../services/api';

const StatusCard = ({ title, value, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const PaymentSummary = ({ eventId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, [eventId]);

  const loadSummary = async () => {
    try {
      const response = await api.get(`/api/events/${eventId}/payment-summary`);
      setSummary(response.data);
    } catch (error) {
      setError('Erro ao carregar resumo de pagamentos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert severity="info">
        Nenhum dado de pagamento disponível.
      </Alert>
    );
  }

  const statusData = {
    completed: {
      title: 'Pagamentos Confirmados',
      value: summary.by_status.completed?.count || 0,
      icon: SuccessIcon,
      color: 'success.main'
    },
    pending: {
      title: 'Pagamentos Pendentes',
      value: summary.by_status.pending?.count || 0,
      icon: PendingIcon,
      color: 'warning.main'
    },
    failed: {
      title: 'Pagamentos Falhos',
      value: summary.by_status.failed?.count || 0,
      icon: ErrorIcon,
      color: 'error.main'
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Resumo de Pagamentos
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StatusCard
            title="Total Arrecadado"
            value={formatCurrency(summary.total_amount)}
            icon={MoneyIcon}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusCard
            title="Total de Transações"
            value={summary.total_payments}
            icon={MoneyIcon}
            color="primary.main"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Status dos Pagamentos
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(statusData).map(([key, data]) => (
          <Grid item xs={12} md={4} key={key}>
            <StatusCard {...data} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PaymentSummary; 