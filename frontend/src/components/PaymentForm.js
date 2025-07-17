import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { paymentApi } from '../services/api';

const PaymentForm = ({ eventId, loteId, amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cpf: '',
    email: ''
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Criar a intenção de pagamento
      const paymentResponse = await paymentApi.createPayment({
        eventId,
        loteId,
        amount,
        customer: {
          email: formData.email,
          cpf: formData.cpf
        },
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'credit_card' ? {
          card_number: formData.cardNumber,
          card_name: formData.cardName,
          expiry_date: formData.expiryDate,
          cvv: formData.cvv
        } : {}
      });

      // Se for cartão de crédito, confirmar o pagamento
      if (paymentMethod === 'credit_card') {
        await paymentApi.confirmPayment(paymentResponse.data.paymentIntent.id);
      }

      onSuccess(paymentResponse.data);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setError(error.response?.data?.error || 'Erro ao processar pagamento');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Informações de Pagamento
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Método de Pagamento</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Método de Pagamento"
                >
                  <MenuItem value="credit_card">Cartão de Crédito</MenuItem>
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="boleto">Boleto Bancário</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CPF"
                value={formData.cpf}
                onChange={handleChange('cpf')}
                required
              />
            </Grid>

            {paymentMethod === 'credit_card' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Número do Cartão"
                    value={formData.cardNumber}
                    onChange={handleChange('cardNumber')}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome no Cartão"
                    value={formData.cardName}
                    onChange={handleChange('cardName')}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Data de Validade"
                    placeholder="MM/AA"
                    value={formData.expiryDate}
                    onChange={handleChange('expiryDate')}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    type="password"
                    value={formData.cvv}
                    onChange={handleChange('cvv')}
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Valor Total: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(amount)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Finalizar Pagamento'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm; 