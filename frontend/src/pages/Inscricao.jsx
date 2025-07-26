import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Check as CheckIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../services/api';
import ModernHeader from '../components/ModernHeader';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'qrcode.react';
import EventProducts from '../components/EventProducts';
import { useInterval } from '../utils/useInterval';

dayjs.locale('pt-br');

const steps = ['Inscrições', 'Forma de Pagamento', 'Confirmação'];

const Inscricao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [inscricoes, setInscricoes] = useState([{
    nome: user?.name || '',
    email: user?.email || '',
    telefone: user?.phone || '',
    cpf: '',
    idade: '',
    genero: '',
    endereco: '',
    autorizacao_imagem: false,
    custom_fields: {}
  }]);
  const [currentInscricao, setCurrentInscricao] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentPending, setPaymentPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [openingPayment, setOpeningPayment] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
        // Seleciona o primeiro lote disponível por padrão
        if (response.data.lots && response.data.lots.length > 0) {
          setSelectedLotId(response.data.lots[0].id);
        }
      } catch (error) {
        setError('Erro ao carregar evento');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Função para verificar status do pagamento
  const checkPaymentStatus = async () => {
    if (registrationCode) {
      try {
        const response = await api.get(`/payments/${registrationCode}`);
        if (response.data.status === 'completed') {
          setPaymentPending(false);
          setPaymentStatus('completed');
        }
      } catch (err) {
        console.log('Erro ao verificar status do pagamento:', err);
      }
    }
  };

  // Polling para status do pagamento
  useInterval(async () => {
    if (paymentPending && registrationCode) {
      try {
        const response = await api.get(`/payments/${registrationCode}`);
        if (response.data.status === 'completed') {
          setPaymentPending(false);
          setPaymentStatus('completed');
        }
      } catch (err) {
        // Ignora erros de polling
      }
    }
  }, paymentPending ? 5000 : null);

  const handleInputChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setInscricoes(prev => prev.map((inscricao, i) => 
      i === index ? {
        ...inscricao,
        [name]: type === 'checkbox' ? checked : value
      } : inscricao
    ));
  };

  const handleCustomFieldChange = (index, fieldName, value) => {
    setInscricoes(prev => prev.map((inscricao, i) => 
      i === index ? {
        ...inscricao,
        custom_fields: {
          ...inscricao.custom_fields,
          [fieldName]: value
        }
      } : inscricao
    ));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }
    if (activeStep === 1) {
      const total = calculateTotal();
      if (total > 0 && !paymentMethod) {
        setError('Por favor, selecione uma forma de pagamento.');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const addInscricao = () => {
    setInscricoes(prev => [...prev, {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      idade: '',
      genero: '',
      endereco: '',
      autorizacao_imagem: false,
      custom_fields: {}
    }]);
    setCurrentInscricao(inscricoes.length);
  };

  const removeInscricao = (index) => {
    setInscricoes(prev => prev.filter((_, i) => i !== index));
    if (currentInscricao >= index) {
      setCurrentInscricao(Math.max(0, currentInscricao - 1));
    }
  };

  const isAllInscricoesValid = () => {
    return inscricoes.every(inscricao => 
      inscricao.nome && 
      inscricao.email && 
      inscricao.telefone &&
      (!event.registration_form?.cpf || inscricao.cpf) &&
      (!event.registration_form?.idade || inscricao.idade) &&
      (!event.registration_form?.genero || inscricao.genero) &&
      (!event.registration_form?.endereco || inscricao.endereco)
    );
  };

  const handleAddProduct = (product, quantity = 1) => {
    setCartProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleRemoveProduct = (productId) => {
    setCartProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar dados antes de enviar
      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Preparar dados para envio
      const participantesToSend = inscricoes.map(inscricao => ({
        name: inscricao.nome,
        email: inscricao.email,
        phone: inscricao.telefone,
        ...(event.registration_form?.cpf && { cpf: inscricao.cpf }),
        ...(event.registration_form?.idade && { age: inscricao.idade }),
        ...(event.registration_form?.genero && { gender: inscricao.genero }),
        ...(event.registration_form?.endereco && { address: inscricao.endereco }),
        ...(event.registration_form?.autorizacao_imagem && {
          image_authorization: inscricao.autorizacao_imagem
        }),
        ...(event.registration_form?.custom_fields && {
          custom_fields: inscricao.custom_fields
        })
      }));

      const response = await api.post(`/events/${event.id}/inscricao-unificada`, {
        participantes: participantesToSend,
        payment_method: paymentMethod,
        lot_id: selectedLotId,
        products: cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))
      });

      setRegistrationCode(response.data.registration_code);
      setRegistrationComplete(true);
      setError('');
      // Sempre exibe o link de pagamento se houver
      if (response.data.payment_info && response.data.payment_info.payment_url) {
        setPaymentUrl(response.data.payment_info.payment_url);
        setPaymentPending(true);
      } else {
        setPaymentUrl('');
        setPaymentPending(false);
      }
      // Atualizar os dados nos painéis administrativos
      try {
        await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/registrations/recent'),
          api.get(`/admin/events/${event.id}/stats`)
        ]);
        window.dispatchEvent(new Event('registration-updated'));
      } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
      }
      // Redirecionar após 3 segundos
      // setTimeout(() => {
      //   navigate('/', {
      //     state: {
      //       successMessage: `Inscrição realizada! Código: ${response.data.registration_code}`
      //     }
      //   });
      // }, 3000);
    } catch (error) {
      console.error('Erro ao fazer inscrição:', error);
      setError(
        error.response?.data?.error ||
        error.response?.data?.details ||
        'Erro ao fazer inscrição. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para copiar o link de pagamento
  const handleCopyPaymentUrl = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateTotal = () => {
    if (!event.lots || event.lots.length === 0) return 0;
    const selectedLot = event.lots.find(lot => lot.id === selectedLotId) || event.lots[0];
    const price = Number(selectedLot.price) || 0;
    console.log('Preço do lote selecionado:', price, 'Qtd inscrições:', inscricoes.length);
    return price * inscricoes.length;
  };

  const handleLotChange = (lotId) => {
    setSelectedLotId(lotId);
    console.log('Lote selecionado:', lotId);
    const lot = event.lots.find(l => l.id === lotId);
    if (lot) {
      console.log('Dados do lote selecionado:', lot);
    }
  };

  // NOVA FUNÇÃO: Abre o checkout AbacatePay antes de finalizar inscrição
  const handleCheckoutAndNext = async () => {
    setLoading(true);
    setError('');
    try {
      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }
      if (!paymentMethod) {
        setError('Por favor, selecione uma forma de pagamento.');
        setLoading(false);
        return;
      }
      const participantesToSend = inscricoes.map(inscricao => ({
        name: inscricao.nome,
        email: inscricao.email,
        phone: inscricao.telefone,
        ...(event.registration_form?.cpf && { cpf: inscricao.cpf }),
        ...(event.registration_form?.idade && { age: inscricao.idade }),
        ...(event.registration_form?.genero && { gender: inscricao.genero }),
        ...(event.registration_form?.endereco && { address: inscricao.endereco }),
        ...(event.registration_form?.autorizacao_imagem && {
          image_authorization: inscricao.autorizacao_imagem
        }),
        ...(event.registration_form?.custom_fields && {
          custom_fields: inscricao.custom_fields
        })
      }));
      const total = calculateTotal();
      if (total > 0) {
        // Gera cobrança e obtém link do checkout
        const response = await api.post(`/events/${event.id}/inscricao-unificada`, {
          participantes: participantesToSend,
          lot_id: selectedLotId,
          payment_method: paymentMethod,
          products: cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))
        });
        if (response.data.payment_info && response.data.payment_info.payment_url) {
          console.log('Abrindo checkout:', response.data.payment_info.payment_url);
          // Abre o checkout em uma nova aba
          const checkoutWindow = window.open(response.data.payment_info.payment_url, '_blank');
          
          // Adiciona um listener para detectar quando a aba é fechada
          if (checkoutWindow) {
            const checkClosed = setInterval(() => {
              if (checkoutWindow.closed) {
                clearInterval(checkClosed);
                console.log('Checkout fechado, verificando status do pagamento...');
                // Verifica o status do pagamento quando a aba é fechada
                checkPaymentStatus();
              }
            }, 1000);
          }
        } else {
          setError('Não foi possível obter o link do checkout. Tente novamente ou entre em contato com o suporte.');
          setLoading(false);
          return;
        }
        setRegistrationCode(response.data.registration_code);
        setRegistrationComplete(true);
        setPaymentUrl(response.data.payment_info?.payment_url || '');
        setPaymentPending(!!response.data.payment_info?.payment_url);
        setActiveStep((prevStep) => prevStep + 1);
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (error) {
      console.error('Erro ao fazer inscrição:', error);
      setError(
        error.response?.data?.error ||
        error.response?.data?.details ||
        'Erro ao fazer inscrição. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <CircularProgress />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <Alert severity="error">{error}</Alert>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <Typography>Evento não encontrado</Typography>
        </Box>
        <Footer />
      </Box>
    );
  }

  const renderInscricaoForm = (index) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nome"
          name="nome"
          value={inscricoes[index].nome}
          onChange={(e) => handleInputChange(index, e)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={inscricoes[index].email}
          onChange={(e) => handleInputChange(index, e)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Telefone"
          name="telefone"
          value={inscricoes[index].telefone}
          onChange={(e) => handleInputChange(index, e)}
          required
        />
      </Grid>
      {event.registration_form?.cpf && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="CPF"
            name="cpf"
            value={inscricoes[index].cpf}
            onChange={(e) => handleInputChange(index, e)}
            required
          />
        </Grid>
      )}
      {event.registration_form?.idade && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Idade"
            name="idade"
            type="number"
            value={inscricoes[index].idade}
            onChange={(e) => handleInputChange(index, e)}
            required
          />
        </Grid>
      )}
      {event.registration_form?.genero && (
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Gênero</FormLabel>
            <RadioGroup
              name="genero"
              value={inscricoes[index].genero}
              onChange={(e) => handleInputChange(index, e)}
            >
              <FormControlLabel value="masculino" control={<Radio />} label="Masculino" />
              <FormControlLabel value="feminino" control={<Radio />} label="Feminino" />
              <FormControlLabel value="outro" control={<Radio />} label="Outro" />
            </RadioGroup>
          </FormControl>
        </Grid>
      )}
      {event.registration_form?.endereco && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Endereço"
            name="endereco"
            value={inscricoes[index].endereco}
            onChange={(e) => handleInputChange(index, e)}
            required
          />
        </Grid>
      )}
      {event.registration_form?.autorizacao_imagem && (
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="autorizacao_imagem"
                checked={inscricoes[index].autorizacao_imagem}
                onChange={(e) => handleInputChange(index, e)}
              />
            }
            label="Autorizo o uso da minha imagem para divulgação do evento"
          />
        </Grid>
      )}
      {event.registration_form?.custom_fields?.map((field, fieldIndex) => (
        <Grid item xs={12} key={fieldIndex}>
          {field.type === 'text' && (
            <TextField
              fullWidth
              label={field.label}
              value={inscricoes[index].custom_fields[field.label] || ''}
              onChange={(e) => handleCustomFieldChange(index, field.label, e.target.value)}
              required={field.required}
            />
          )}
          {field.type === 'select' && (
            <FormControl fullWidth>
              <FormLabel>{field.label}</FormLabel>
              <RadioGroup
                value={inscricoes[index].custom_fields[field.label] || ''}
                onChange={(e) => handleCustomFieldChange(index, field.label, e.target.value)}
              >
                {field.options.map((option, i) => (
                  <FormControlLabel
                    key={i}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Grid>
      ))}
    </Grid>
  );

  const renderLotSelection = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Selecione o Lote
      </Typography>
      <Grid container spacing={2}>
        {event.lots.map((lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.id}>
            <Card
              sx={{
                cursor: 'pointer',
                bgcolor: selectedLotId === lot.id ? 'action.selected' : 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleLotChange(lot.id)}
            >
              <CardContent>
                <Typography variant="h6">{lot.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Preço: R$ {lot.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vagas: {lot.quantity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderStep = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {renderLotSelection()}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Inscrições ({inscricoes.length})</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addInscricao}
              >
                Adicionar Inscrição
              </Button>
            </Box>
            {inscricoes.map((inscricao, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Inscrição {index + 1}
                </Typography>
                {renderInscricaoForm(index)}
                {index > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeInscricao(index)}
                    sx={{ mt: 2 }}
                  >
                    Remover Inscrição
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        );

      case 1:
        // Novo passo: seleção de método de pagamento
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecione a forma de pagamento
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Forma de Pagamento</FormLabel>
              <RadioGroup
                row
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="PIX" control={<Radio />} label="Pix" />
                <FormControlLabel value="BOLETO" control={<Radio />} label="Boleto" />
                <FormControlLabel value="CREDITCARD" control={<Radio />} label="Cartão de Crédito" />
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (!paymentMethod) {
                  setError('Por favor, selecione uma forma de pagamento.');
                  return;
                }
                handleCheckoutAndNext();
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Avançar para pagamento'}
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Inscrição Confirmada!
            </Typography>
            {paymentPending ? (
              <>
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  <strong>Pagamento pendente:</strong> O checkout do Mercado Pago foi aberto em uma nova aba.<br/>
                  <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                    • Complete o pagamento na aba que foi aberta<br/>
                    • Após o pagamento, feche a aba e volte aqui<br/>
                    • O status será atualizado automaticamente
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                    disabled={openingPayment}
                    onClick={() => setOpeningPayment(true)}
                  >
                    {openingPayment ? <CircularProgress size={20} color="inherit" /> : 'Abrir checkout novamente'}
                  </Button>
                  <br/>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={checkPaymentStatus}
                    sx={{ mt: 1 }}
                  >
                    Verificar status do pagamento
                  </Button>
                  <br/>
                  <span style={{ fontSize: 13, color: '#555', marginTop: 2, display: 'block' }}>
                    Após o pagamento, você receberá a confirmação por e-mail ou WhatsApp.<br/>
                    Se não receber em até 30 minutos, entre em contato com o suporte do evento.
                  </span>
                </Alert>
              </>
            ) : paymentStatus === 'completed' ? (
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                Pagamento confirmado! Sua inscrição está garantida.
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                Sua inscrição foi realizada com sucesso!
              </Alert>
            )}
            {registrationCode && (
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Código de Inscrição: {registrationCode}
                </Typography>
                <QRCode value={registrationCode} size={200} />
              </Box>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Voltar para Home
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <ModernHeader />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Inscrição para {event.title}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {dayjs(event.date).format('DD [de] MMMM [de] YYYY [às] HH:mm')}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {event.location}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                {event.lots?.find(lot => 
                  dayjs(lot.end_date).isAfter(dayjs()) && lot.quantity > 0
                ) && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" color="primary">
                      {event.lots.find(lot => 
                        dayjs(lot.end_date).isAfter(dayjs()) && lot.quantity > 0
                      ).name}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {event.lots.find(lot => 
                        dayjs(lot.end_date).isAfter(dayjs()) && lot.quantity > 0
                      ).price > 0 ? `R$ ${calculateTotal()}` : 'Gratuito'}
                    </Typography>
                    <Chip
                      label={`${event.lots.find(lot => 
                        dayjs(lot.end_date).isAfter(dayjs()) && lot.quantity > 0
                      ).quantity} vagas disponíveis`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStep(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 
                activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
            </Button>
          </Box>

          {event && (
            <Box sx={{ mt: 4 }}>
              <EventProducts eventId={event.id} onAddProduct={handleAddProduct} />
              {cartProducts.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Produtos Selecionados</Typography>
                  {cartProducts.map(product => (
                    <Box key={product.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ flex: 1 }}>{product.name} (x{product.quantity})</Typography>
                      <Button color="error" onClick={() => handleRemoveProduct(product.id)}>Remover</Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Inscricao; 