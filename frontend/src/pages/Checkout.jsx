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
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart, ITEM_TYPES } from '../contexts/CartContext';
import api from '../services/api';
import ModernHeader from '../components/ModernHeader';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

const steps = ['Carrinho', 'Dados Pessoais', 'Pagamento', 'Confirmação'];

const Checkout = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
      // Validar dados pessoais
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleRemoveItem = (item) => {
    removeItem(item);
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Separar itens por tipo
      const eventItems = items.filter(item => 
        item.type === ITEM_TYPES.EVENT_TICKET || item.type === ITEM_TYPES.EVENT_PRODUCT
      );
      const storeItems = items.filter(item => item.type === ITEM_TYPES.STORE_PRODUCT);

      // Processar pedidos separadamente
      const orders = [];

      // Processar itens de eventos
      if (eventItems.length > 0) {
        const eventGroups = groupItemsByEvent(eventItems);
        for (const [eventId, eventItems] of Object.entries(eventGroups)) {
          const order = await processEventOrder(eventId, eventItems);
          orders.push(order);
        }
      }

      // Processar itens da loja
      if (storeItems.length > 0) {
        const storeOrder = await processStoreOrder(storeItems);
        orders.push(storeOrder);
      }

      setSuccess('Pedido realizado com sucesso! Você receberá um email de confirmação.');
      clearCart();
      setActiveStep(3);
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      setError('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const groupItemsByEvent = (items) => {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.eventId]) {
        groups[item.eventId] = [];
      }
      groups[item.eventId].push(item);
    });
    return groups;
  };

  const processEventOrder = async (eventId, eventItems) => {
    const tickets = eventItems.filter(item => item.type === ITEM_TYPES.EVENT_TICKET);
    const products = eventItems.filter(item => item.type === ITEM_TYPES.EVENT_PRODUCT);

    const orderData = {
      event_id: eventId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf,
      address: formData.address,
      tickets: tickets.map(ticket => ({
        lot_id: ticket.lotId,
        quantity: ticket.quantity
      })),
      products: products.map(product => ({
        product_id: product.id,
        quantity: product.quantity,
        unit_price: product.price
      }))
    };

    const response = await api.post('/registrations', orderData);
    return response.data;
  };

  const processStoreOrder = async (storeItems) => {
    const orderData = {
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        address: formData.address
      },
      items: storeItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }))
    };

    const response = await api.post('/store-orders', orderData);
    return response.data;
  };

  const renderCartStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Seu Carrinho
      </Typography>
      
      {items.length === 0 ? (
        <Alert severity="info">
          Seu carrinho está vazio. <Link href="/">Continue comprando</Link>
        </Alert>
      ) : (
        <List>
          {items.map((item, index) => (
            <ListItem key={index} sx={{ border: 1, borderColor: 'grey.200', mb: 1, borderRadius: 1 }}>
              <ListItemText
                primary={item.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.type === ITEM_TYPES.EVENT_TICKET ? '🎫 Ingresso' : 
                       item.type === ITEM_TYPES.EVENT_PRODUCT ? '🛍️ Produto do Evento' : 
                       '🏪 Produto da Loja'}
                    </Typography>
                    {item.eventName && (
                      <Typography variant="body2" color="text.secondary">
                        Evento: {item.eventName}
                      </Typography>
                    )}
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      R$ {item.price.toFixed(2)} cada
                    </Typography>
                  </Box>
                }
              />
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
                <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 80, textAlign: 'right' }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveItem(item)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Total: R$ {total.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={items.length === 0}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );

  const renderPersonalDataStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dados Pessoais
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome completo *"
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
            Endereço
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={handleBack}>
          Voltar
        </Button>
        <Button variant="contained" onClick={handleNext}>
          Continuar
        </Button>
      </Box>
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Resumo do Pedido
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Itens do Pedido
          </Typography>
          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>
                {item.name} x {item.quantity}
              </Typography>
              <Typography fontWeight="bold">
                R$ {(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Total
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              R$ {total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Dados Pessoais
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography><strong>Nome:</strong> {formData.name}</Typography>
          <Typography><strong>Email:</strong> {formData.email}</Typography>
          <Typography><strong>Telefone:</strong> {formData.phone}</Typography>
          {formData.cpf && <Typography><strong>CPF:</strong> {formData.cpf}</Typography>}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack}>
          Voltar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Finalizar Pedido'}
        </Button>
      </Box>
    </Box>
  );

  const renderConfirmationStep = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4" color="primary" gutterBottom>
        ✅ Pedido Realizado com Sucesso!
      </Typography>
      <Typography variant="h6" gutterBottom>
        Obrigado por sua compra
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Você receberá um email de confirmação com os detalhes do seu pedido.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Voltar para a Home
      </Button>
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

  if (items.length === 0 && activeStep !== 3) {
    return (
      <Box>
        <ModernHeader />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="info">
            Seu carrinho está vazio. <Link href="/">Continue comprando</Link>
          </Alert>
        </Container>
        <Footer />
        <WhatsAppButton />
      </Box>
    );
  }

  return (
    <Box>
      <ModernHeader />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ cursor: 'pointer' }}
          >
            Home
          </Link>
          <Typography color="text.primary">Checkout</Typography>
        </Breadcrumbs>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Mensagens de erro/sucesso */}
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

        {/* Conteúdo do step */}
        {getStepContent(activeStep)}
      </Container>

      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Checkout; 