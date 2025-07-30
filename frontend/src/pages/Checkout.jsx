import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart, ITEM_TYPES } from '../contexts/CartContext';
import api from '../services/api';
import ModernHeader from '../components/ModernHeader';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

const steps = ['Resumo da Compra', 'Pagamento', 'Finalização'];

const Checkout = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  // Verificar se há itens no carrinho
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar se há itens no carrinho
      if (items.length === 0) {
        setError('Adicione itens ao carrinho antes de continuar');
        return;
      }
    } else if (activeStep === 1) {
      // Processar pagamento
      handlePayment();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Separar itens por tipo
      const eventItems = items.filter(item => 
        item.type === ITEM_TYPES.EVENT_TICKET || item.type === ITEM_TYPES.EVENT_PRODUCT
      );
      const storeItems = items.filter(item => item.type === ITEM_TYPES.STORE_PRODUCT);

      // Processar pedidos
      const results = [];

      if (eventItems.length > 0) {
        const eventGroups = groupItemsByEvent(eventItems);
        for (const [eventId, eventGroupItems] of Object.entries(eventGroups)) {
          const result = await processEventOrder(eventId, eventGroupItems);
          results.push(result);
        }
      }

      if (storeItems.length > 0) {
        const result = await processStoreOrder(storeItems);
        results.push(result);
      }

      // Se todos os pedidos foram processados com sucesso
      if (results.every(result => result.success)) {
        setOrderId(results[0]?.orderId || '');
        setPaymentUrl(results[0]?.paymentUrl || '');
        setActiveStep(2); // Ir para finalização
      } else {
        setError('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (item) => {
    removeItem(item);
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantity(item.id, newQuantity);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const groupItemsByEvent = (items) => {
    const groups = {};
    items.forEach(item => {
      const eventId = item.eventId || 'general';
      if (!groups[eventId]) {
        groups[eventId] = [];
      }
      groups[eventId].push(item);
    });
    return groups;
  };

  const processEventOrder = async (eventId, eventItems) => {
    try {
      const orderData = {
        event_id: eventId,
        customer: formData,
        items: eventItems.map(item => ({
          type: item.type,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          lot_id: item.lotId
        }))
      };

      const response = await api.post('/registrations', orderData, {
        timeout: 30000 // Aumentar timeout para 30 segundos
      });

      return {
        success: true,
        orderId: response.data.order_id,
        paymentUrl: response.data.payment_url
      };
    } catch (error) {
      console.error('Erro ao processar pedido do evento:', error);
      return { success: false, error: error.message };
    }
  };

  const processStoreOrder = async (storeItems) => {
    try {
      const orderData = {
        customer: formData,
        items: storeItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      const response = await api.post('/store-orders', orderData, {
        timeout: 30000 // Aumentar timeout para 30 segundos
      });

      return {
        success: true,
        orderId: response.data.id,
        paymentUrl: response.data.payment_url
      };
    } catch (error) {
      console.error('Erro ao processar pedido da loja:', error);
      return { success: false, error: error.message };
    }
  };

  const renderCartStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Resumo da Compra
      </Typography>
      
      {items.length === 0 ? (
        <Alert severity="info">
          Seu carrinho está vazio. <Link href="/">Continue comprando</Link>
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <List>
              {items.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={item.name}
                    secondary={`R$ ${(item.price * item.quantity).toFixed(2)}`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                R$ {total.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderPersonalDataStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dados Pessoais
      </Typography>
      
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone *"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Endereço (Opcional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Rua"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                value={formData.address.number}
                onChange={(e) => handleInputChange('address.number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Complemento"
                value={formData.address.complement}
                onChange={(e) => handleInputChange('address.complement', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.address.neighborhood}
                onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estado"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CEP"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Pagamento
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            Clique no botão abaixo para prosseguir com o pagamento via MercadoPago.
          </Typography>
          
          {paymentUrl ? (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => window.open(paymentUrl, '_blank')}
              sx={{ mt: 2 }}
            >
              <PaymentIcon sx={{ mr: 1 }} />
              Pagar com MercadoPago
            </Button>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Processando pagamento...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderConfirmationStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Finalização
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Pagamento Confirmado!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Seu pedido foi processado com sucesso.
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ mt: 2 }}
              onClick={() => {
                // Aqui você pode implementar o download do ticket
                window.open(`/api/tickets/${orderId}/download`, '_blank');
              }}
            >
              Baixar Ticket
            </Button>
            
            <Button
              variant="outlined"
              sx={{ mt: 2, ml: 2 }}
              onClick={() => {
                clearCart();
                navigate('/');
              }}
            >
              Voltar ao Início
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCartStep();
      case 1:
        return renderPersonalDataStep();
      case 2:
        return renderPaymentStep();
      case 3:
        return renderConfirmationStep();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <ModernHeader />
      
      <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}> {/* Adicionado mt: 8 para evitar header */}
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center">
              Checkout
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <Box sx={{ mt: 2 }}>
              {getStepContent(activeStep)}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Voltar
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 
                 activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Checkout; 