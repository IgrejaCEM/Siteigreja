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
import { openCheckout } from '../utils/checkoutUtils';
import api from '../services/api';
import ModernHeader from '../components/ModernHeader';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

const steps = ['Resumo da Compra', 'Dados Pessoais', 'Pagamento', 'Finalização'];

const Checkout = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [eventData, setEventData] = useState(null);
  const [paymentAttempted, setPaymentAttempted] = useState(false);
  
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

  // Carregar dados do evento se houver tickets
  useEffect(() => {
    const loadEventData = async () => {
      const eventItems = items.filter(item => 
        item.type === ITEM_TYPES.EVENT_TICKET || item.type === ITEM_TYPES.EVENT_PRODUCT
      );
      
      if (eventItems.length > 0) {
        const eventId = eventItems[0].eventId;
        try {
          const response = await api.get(`/events/${eventId}`);
          setEventData(response.data);
        } catch (error) {
          console.error('Erro ao carregar dados do evento:', error);
        }
      }
    };

    loadEventData();
  }, [items]);

  // Verificar se há tickets no carrinho
  const hasEventTickets = items.some(item => item.type === ITEM_TYPES.EVENT_TICKET);
  
  // Verificar se o evento requer endereço
  const requiresAddress = eventData?.registration_form?.endereco || hasEventTickets;

  const handleNext = () => {
    console.log('🔄 handleNext chamado, step atual:', activeStep);
    
    if (activeStep === 0) {
      // Validar se há itens no carrinho
      if (items.length === 0) {
        setError('Adicione itens ao carrinho antes de continuar');
        return;
      }
    } else if (activeStep === 1) {
      // Validar dados pessoais
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      
      // Validar CPF se o evento requer
      if (eventData?.registration_form?.cpf && !formData.cpf) {
        setError('CPF é obrigatório para este evento');
        return;
      }
      
      // Validar endereço se necessário
      if (requiresAddress) {
        const addressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
        const missingAddressFields = addressFields.filter(field => !formData.address[field]);
        if (missingAddressFields.length > 0) {
          setError('Preencha todos os campos do endereço');
          return;
        }
      }
    }
    
    console.log('➡️ Avançando para próximo step...');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const newStep = prevActiveStep - 1;
      // Reset payment attempt flag when going back to step 1 or earlier
      if (newStep <= 1) {
        setPaymentAttempted(false);
      }
      return newStep;
    });
  };

  const handlePayment = async () => {
    try {
      console.log('🚀 Iniciando processamento de pagamento...');
      setLoading(true);
      setError('');

      console.log('📦 Itens no carrinho:', items);

      if (items.length === 0) {
        setError('Carrinho vazio');
        setLoading(false);
        return;
      }

      // Separar itens por tipo
      const eventItems = items.filter(item => 
        item.type === ITEM_TYPES.EVENT_TICKET || item.type === ITEM_TYPES.EVENT_PRODUCT
      );
      const storeItems = items.filter(item => item.type === ITEM_TYPES.STORE_PRODUCT);

      console.log('🎫 Itens de evento:', eventItems);
      console.log('🏪 Itens da loja:', storeItems);

      let paymentUrl = '';
      let orderId = '';

      // Processar eventos
      if (eventItems.length > 0) {
        console.log('📝 Processando pedidos de evento...');
        const eventGroups = groupItemsByEvent(eventItems);
        
        for (const [eventId, eventGroupItems] of Object.entries(eventGroups)) {
          console.log('🎯 Processando evento', eventId, ':', eventGroupItems);
          const result = await processEventOrder(eventId, eventGroupItems);
          console.log('✅ Resultado do evento:', result);
          
          if (result.success) {
            paymentUrl = result.paymentUrl;
            orderId = result.orderId;
            console.log('🔗 Payment URL definida:', paymentUrl);
          } else {
            throw new Error(result.error);
          }
        }
      }

      // Processar produtos da loja
      if (storeItems.length > 0) {
        console.log('🏪 Processando produtos da loja...');
        const result = await processStoreOrder(storeItems);
        console.log('✅ Resultado da loja:', result);
        if (result.success) {
          paymentUrl = result.paymentUrl;
          orderId = result.orderId;
          console.log('🔗 Payment URL definida:', paymentUrl);
        } else {
          throw new Error(result.error);
        }
      }

      console.log('🎉 Processamento concluído!');
      console.log('🔗 Payment URL final:', paymentUrl);
      console.log('🆔 Order ID final:', orderId);

      if (paymentUrl) {
        console.log('✅ Definindo paymentUrl no estado...');
        setOrderId(orderId);
        setPaymentUrl(paymentUrl);
        // NÃO ir para finalização ainda - aguardar pagamento
        console.log('🌐 Payment URL gerada, aguardando pagamento...');
      } else {
        console.error('❌ Payment URL não foi gerada');
        throw new Error('URL de pagamento não foi gerada');
      }
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      setError(`Erro ao processar pagamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (item) => {
    console.log('🗑️ Removendo item:', item);
    removeItem(item);
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    console.log('🔄 Atualizando quantidade:', item.name, 'de', item.quantity, 'para', newQuantity);
    updateQuantity(item, newQuantity);
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
        timeout: 60000 // Aumentar timeout para 60 segundos
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
        timeout: 60000 // Aumentar timeout para 60 segundos
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </Grid>
            
            {/* CPF - só se o evento requer */}
            {eventData?.registration_form?.cpf && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  required
                />
              </Grid>
            )}
            
            {/* Endereço - só se necessário */}
            {requiresAddress && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Endereço de Entrega
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rua"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    required
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
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CEP"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Estado"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  // Processar pagamento automaticamente quando chegar no step
  React.useEffect(() => {
    if (activeStep === 2 && !paymentUrl && !loading && !paymentAttempted) {
      console.log('💳 Step 2 - Aguardando usuário clicar no botão de pagamento...');
      // NÃO processar automaticamente - aguardar clique do usuário
    }
  }, [activeStep, paymentUrl, loading, paymentAttempted]);

  const renderPaymentStep = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Pagamento
        </Typography>
        
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Processando pagamento...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aguarde enquanto preparamos seu pagamento
                </Typography>
              </Box>
            ) : paymentUrl ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PaymentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Pagamento Pronto!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Clique no botão abaixo para prosseguir com o pagamento via MercadoPago.
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => {
                    console.log('🌐 Clicou no botão de pagamento');
                    console.log('🔗 URL:', paymentUrl);
                    openCheckout(paymentUrl);
                  }}
                  sx={{ 
                    mt: 2,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  <PaymentIcon sx={{ mr: 1 }} />
                  Pagar com MercadoPago
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Você será redirecionado para o MercadoPago para finalizar o pagamento
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="error" gutterBottom>
                  Erro no Processamento
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Não foi possível gerar o link de pagamento. Tente novamente.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handlePayment}
                  sx={{ mt: 2 }}
                >
                  Tentar Novamente
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

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
                // Download do ticket
                const registrationCode = orderId || 'TEMP-' + Date.now();
                const downloadUrl = `https://siteigreja-1.onrender.com/api/tickets/${registrationCode}/download`;
                console.log('🎫 Tentando baixar ticket:', downloadUrl);
                
                // Criar um link temporário para forçar o download
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.target = '_blank';
                link.download = `ticket-${registrationCode}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
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
      <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
        <Card sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
            <Box>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                {activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>
      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Checkout; 