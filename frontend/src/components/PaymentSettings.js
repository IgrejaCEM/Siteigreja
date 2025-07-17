import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid
} from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const PaymentSettings = () => {
  const { eventId } = useParams();
  const [settings, setSettings] = useState({
    has_payment: false,
    payment_enabled: false,
    payment_gateway: 'stripe',
    ticket_price: 0,
    currency: 'BRL',
    payment_settings: {}
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
    loadPaymentMethods();
  }, [eventId]);

  const loadSettings = async () => {
    try {
      const response = await api.get(`/api/events/${eventId}/payment-settings`);
      setSettings(response.data);
    } catch (error) {
      setError('Erro ao carregar configurações de pagamento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await api.get('/api/payment-methods');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await api.put(`/api/events/${eventId}/payment-settings`, settings);
      setSuccess(true);
    } catch (error) {
      setError('Erro ao salvar configurações de pagamento');
      console.error(error);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Configurações de Pagamento
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Configurações salvas com sucesso!
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Switch
                    checked={settings.has_payment}
                    onChange={handleChange('has_payment')}
                    color="primary"
                  />
                  <Typography>Habilitar pagamentos para este evento</Typography>
                </Box>
              </Grid>

              {settings.has_payment && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gateway de Pagamento</InputLabel>
                      <Select
                        value={settings.payment_gateway}
                        onChange={handleChange('payment_gateway')}
                        label="Gateway de Pagamento"
                      >
                        <MenuItem value="stripe">Stripe</MenuItem>
                        <MenuItem value="mercadopago">Mercado Pago</MenuItem>
                        <MenuItem value="pagseguro">PagSeguro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Moeda</InputLabel>
                      <Select
                        value={settings.currency}
                        onChange={handleChange('currency')}
                        label="Moeda"
                      >
                        <MenuItem value="BRL">Real (BRL)</MenuItem>
                        <MenuItem value="USD">Dólar (USD)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Preço do Ingresso"
                      type="number"
                      value={settings.ticket_price}
                      onChange={handleChange('ticket_price')}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Switch
                        checked={settings.payment_enabled}
                        onChange={handleChange('payment_enabled')}
                        color="primary"
                      />
                      <Typography>Ativar pagamentos</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Métodos de Pagamento Disponíveis
                    </Typography>
                    <Grid container spacing={2}>
                      {paymentMethods.map(method => (
                        <Grid item xs={12} sm={6} md={4} key={method.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>{method.name}</Typography>
                                <Switch
                                  checked={method.enabled}
                                  disabled
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Salvar Configurações
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSettings; 