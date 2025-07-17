import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../services/api';

const Payment = () => {
  const { registrationCode } = useParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadPaymentDetails();
  }, [registrationCode]);

  const loadPaymentDetails = async () => {
    try {
      const response = await api.get(`/payments/${registrationCode}`);
      setPaymentDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar detalhes do pagamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar detalhes do pagamento',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await api.post('/payments', {
        registration_code: registrationCode,
        payment_method: 'credit_card' // ou outro método de pagamento
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Pagamento realizado com sucesso!',
          severity: 'success'
        });
        // Redireciona para a página de confirmação
        navigate(`/registration-confirmation/${registrationCode}`);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Erro ao processar pagamento',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  if (!paymentDetails) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Inscrição não encontrada</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pagamento
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo da Inscrição
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Nome"
              secondary={paymentDetails.registration.name}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Email"
              secondary={paymentDetails.registration.email}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Lote"
              secondary={paymentDetails.lot.name}
            />
          </ListItem>
        </List>
      </Paper>

      {paymentDetails.products.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Produtos Selecionados
          </Typography>
          <List>
            {paymentDetails.products.map((product, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={product.product.name}
                  secondary={`Quantidade: ${product.quantity} - R$ ${(product.unit_price * product.quantity).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">
            Total dos Produtos: R$ {paymentDetails.productsTotal.toFixed(2)}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Valor Total
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography>Valor do Lote:</Typography>
          <Typography>R$ {paymentDetails.lot.price.toFixed(2)}</Typography>
        </Box>
        {paymentDetails.productsTotal > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Total dos Produtos:</Typography>
            <Typography>R$ {paymentDetails.productsTotal.toFixed(2)}</Typography>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total a Pagar:</Typography>
          <Typography variant="h6" color="primary">
            R$ {paymentDetails.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handlePayment}
        >
          Realizar Pagamento
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Payment; 