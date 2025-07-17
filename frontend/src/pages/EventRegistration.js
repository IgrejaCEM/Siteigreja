import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import EventRegistrationForm from '../components/EventRegistrationForm';
import EventRegistrationStore from '../components/EventRegistrationStore';
import api from '../services/api';

const steps = ['Dados Pessoais', 'Produtos', 'Pagamento'];

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar evento',
        severity: 'error'
      });
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    handleNext();
  };

  const handleProductsChange = (products) => {
    setSelectedProducts(products);
  };

  const handleSubmit = async () => {
    try {
      const registrationData = {
        ...formData,
        event_id: eventId,
        products: selectedProducts
      };

      const response = await api.post('/registrations', registrationData);
      
      // Redireciona para a página de pagamento
      navigate(`/payment/${response.data.registration_code}`);
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Erro ao criar inscrição',
        severity: 'error'
      });
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <EventRegistrationForm
            event={event}
            onSubmit={handleFormSubmit}
          />
        );
      case 1:
        return (
          <EventRegistrationStore
            eventId={eventId}
            onProductsChange={handleProductsChange}
          />
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumo da Inscrição
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Dados Pessoais
              </Typography>
              <Typography variant="body2">
                Nome: {formData?.name}
              </Typography>
              <Typography variant="body2">
                Email: {formData?.email}
              </Typography>
              <Typography variant="body2">
                Telefone: {formData?.phone}
              </Typography>
            </Paper>
            {selectedProducts.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Produtos Selecionados
                </Typography>
                {selectedProducts.map((product, index) => (
                  <Typography key={index} variant="body2">
                    {product.name} - Quantidade: {product.quantity} - R$ {(product.unit_price * product.quantity).toFixed(2)}
                  </Typography>
                ))}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total: R$ {selectedProducts.reduce((total, product) => total + (product.unit_price * product.quantity), 0).toFixed(2)}
                </Typography>
              </Paper>
            )}
          </Box>
        );
      default:
        return 'Step desconhecido';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Inscrição - {event?.title}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={activeStep === 0 && !formData}
        >
          {activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
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

export default EventRegistration; 