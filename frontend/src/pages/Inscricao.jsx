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
import { openCheckout, fixMercadoPagoUrl, isValidCheckoutUrl, interceptDeepLinks, forceWebCheckout } from '../utils/checkoutUtils';
import TicketGenerator from '../components/TicketGenerator';

dayjs.locale('pt-br');

  const steps = ['Inscrições', 'Confirmação', 'Pagamento'];

const Inscricao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [preventRedirect, setPreventRedirect] = useState(false);
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
    // Verificar se há parâmetro de lote na URL
    const urlParams = new URLSearchParams(window.location.search);
    const lotIdFromUrl = urlParams.get('lotId');
    
    if (lotIdFromUrl) {
      console.log('🎯 Lote selecionado via URL:', lotIdFromUrl);
      setSelectedLotId(parseInt(lotIdFromUrl));
    } else {
      // Carregar seleções salvas do localStorage
      const savedSelections = localStorage.getItem('eventSelections');
      if (savedSelections) {
        try {
          const selections = JSON.parse(savedSelections);
          setSelectedLotId(selections.selectedLotId);
          setCartProducts(selections.cartProducts || []);
          console.log('🛒 Seleções carregadas:', selections);
        } catch (error) {
          console.error('Erro ao carregar seleções:', error);
        }
      }
    }
  }, []);

  const clearSelections = () => {
    localStorage.removeItem('eventSelections');
    setSelectedLotId(null);
    setCartProducts([]);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
        console.log('✅ Evento carregado:', response.data);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        setError('Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
    fetchEvent();
    }

      const handleBeforeUnload = (e) => {
      if (preventRedirect) {
          e.preventDefault();
          e.returnValue = '';
        }
      };

      const handlePopState = (e) => {
      if (preventRedirect) {
          e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
  }, [id, preventRedirect]);

  const checkPaymentStatus = async () => {
    if (registrationCode) {
      try {
        const response = await api.get(`/payments/${registrationCode}`);
        if (response.data.status === 'completed') {
          setPaymentPending(false);
          setPaymentStatus('completed');
          setActiveStep(2);
        }
      } catch (err) {
        console.log('Erro ao verificar status do pagamento:', err);
      }
    }
  };

  useInterval(async () => {
    if (paymentPending && registrationCode) {
      try {
        const response = await api.get(`/payments/${registrationCode}`);
        if (response.data.status === 'completed') {
          setPaymentPending(false);
          setPaymentStatus('completed');
          setActiveStep(2);
        }
      } catch (err) {
        // Ignora erros de polling
      }
    }
  }, paymentPending ? 5000 : null);

  useEffect(() => {
    interceptDeepLinks();
  }, []);

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

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!selectedLotId) {
        setError('Por favor, selecione um lote antes de continuar.');
        return;
      }
      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }
    if (activeStep === 1) {
      const total = calculateTotal();
      if (total > 0) {
        // Validação removida - método será escolhido no checkout
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
    for (let i = 0; i < inscricoes.length; i++) {
      const inscricao = inscricoes[i];
      if (!inscricao.nome || !inscricao.email || !inscricao.telefone) {
        return false;
      }
    }
    return true;
  };

  const handleAddProduct = (product, quantity = 1) => {
    console.log('🛍️ Adicionando produto ao carrinho:', { product, quantity });
    setCartProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        const updated = prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
        console.log(' Produto existente, atualizando quantidade:', updated);
        return updated;
      }
      const newCart = [...prev, { ...product, quantity }];
      console.log('➕ Novo produto adicionado:', newCart);
      return newCart;
    });
  };

  const handleRemoveProduct = (productId) => {
    setCartProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
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

      const response = await api.post(`/events/${event.id}/teste-ultra-simples`, {
        participantes: participantesToSend,
        payment_method: 'CHECKOUT_PRO',
        lote_id: selectedLotId,
        products: cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))
      });

      setRegistrationCode(response.data.registration_code);
      setRegistrationComplete(true);
      setError('');
      if (response.data.payment_info && response.data.payment_info.payment_url) {
        setPaymentUrl(response.data.payment_info.payment_url);
        setPaymentPending(true);
      } else {
        setPaymentUrl('');
        setPaymentPending(false);
      }
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

  const handleCopyPaymentUrl = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateTotal = () => {
    if (!event.lots || event.lots.length === 0) return 0;
    const price = Number(selectedLot?.price) || 0;
    const inscriptionsTotal = price * inscricoes.length;
    
    const productsTotal = cartProducts.reduce((total, product) => {
      return total + (Number(product.price) * product.quantity);
    }, 0);
    
    const total = inscriptionsTotal + productsTotal;
    console.log('💰 Cálculo do total:', {
      selectedLot,
      price,
      inscriptionsTotal,
      productsTotal,
      total
    });
    return total;
  };

  const handleLotChange = (lotId) => {
    setSelectedLotId(lotId);
    const lot = event.lots.find(l => l.id === lotId);
    console.log('🎯 Lote selecionado:', lot);
  };

  const handleCheckoutAndNext = async () => {
    console.log('🚀 Iniciando processo de checkout...');
    setLoading(true);
    
    try {
      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }
      
      const participantesToSend = inscricoes.map(inscricao => ({
        name: inscricao.nome,
        email: inscricao.email,
        phone: inscricao.telefone,
        cpf: inscricao.cpf || null,
        age: inscricao.idade || null,
        gender: inscricao.genero || null,
        address: inscricao.endereco || null,
        image_authorization: inscricao.autorizacao_imagem || false,
        custom_fields: inscricao.custom_fields || {}
      }));

      // Verificar se é lote gratuito ANTES de enviar
      const isFree = selectedLot && (selectedLot?.price === 0 || selectedLot?.price === '0' || selectedLot?.price === 0.00 || selectedLot?.price === '0.00' || parseFloat(selectedLot?.price) === 0) && cartProducts.length === 0;
      
      console.log('🆓 VERIFICAÇÃO FINAL - Lote gratuito:', {
        selectedLot,
        price: selectedLot?.price,
        priceType: typeof selectedLot?.price,
        cartProductsLength: cartProducts.length,
        isFree
      });

      const requestData = {
        participantes: participantesToSend,
        payment_method: isFree ? 'FREE' : 'CHECKOUT_PRO',
        lote_id: selectedLotId,
        products: cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))
      };

      console.log('📦 Dados sendo enviados para a API:', JSON.stringify(requestData, null, 2));

      const response = await api.post(`/events/${event.id}/inscricao-unificada`, requestData);

      console.log('✅ Resposta da API:', response.data);
      setRegistrationCode(response.data.registration_code);
      setRegistrationComplete(true);
      
      console.log('🆓 Verificação de lote gratuito:', {
        selectedLot,
        price: selectedLot?.price,
        priceType: typeof selectedLot?.price,
        cartProductsLength: cartProducts.length,
        isFree
      });
      
      if (isFree) {
        // Para lotes gratuitos, ir direto para a última etapa
        console.log('✅ Lote gratuito detectado - finalizando inscrição');
        setPaymentStatus('completed');
        setActiveStep(2);
        setLoading(false);
        return; // IMPORTANTE: Sair da função aqui!
      } else if (response.data.payment_info && response.data.payment_info.payment_url) {
        // Para lotes pagos, verificar se há link de pagamento
        if (response.data.payment_info && response.data.payment_info.payment_url) {
          setPaymentUrl(response.data.payment_info.payment_url);
          setPaymentPending(true);
          
          // Abrir checkout automaticamente
          console.log('🔗 Abrindo checkout do Mercado Pago...');
          console.log('📦 URL do checkout:', response.data.payment_info.payment_url);
          
          // Detectar se é iPhone/Safari
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
          
          console.log('📱 Detecção de dispositivo:', { isIOS, isSafari });
          
          // Para iPhone/Safari, usar múltiplas estratégias
          if (isIOS || isSafari) {
            console.log('📱 iPhone/Safari detectado - usando estratégia múltipla');
            
            // Estratégia 1: Tentar window.open primeiro
            try {
              const popup = window.open(response.data.payment_info.payment_url, '_blank');
              if (popup) {
                console.log('✅ Checkout aberto em popup no iPhone!');
                return;
              }
            } catch (error) {
              console.log('⚠️ Popup falhou no iPhone:', error);
            }
            
            // Estratégia 2: Criar link e clicar automaticamente
            try {
              const link = document.createElement('a');
              link.href = response.data.payment_info.payment_url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              console.log('✅ Checkout aberto via link automático!');
              return;
            } catch (error) {
              console.log('⚠️ Link automático falhou:', error);
            }
            
            // Estratégia 3: Redirecionamento direto
            console.log('📱 Redirecionando diretamente no iPhone...');
            setTimeout(() => {
              window.location.href = response.data.payment_info.payment_url;
            }, 100);
            
          } else {
            // Para outros dispositivos, tentar popup primeiro
            try {
              const popup = window.open(response.data.payment_info.payment_url, '_blank', 'width=800,height=600');
              if (!popup) {
                console.log('⚠️ Popup bloqueado, redirecionando na mesma aba');
                window.location.href = response.data.payment_info.payment_url;
              } else {
                console.log('✅ Checkout aberto em popup!');
              }
            } catch (error) {
              console.error('❌ Erro ao abrir checkout:', error);
              window.location.href = response.data.payment_info.payment_url;
            }
          }
        } else {
          setPaymentUrl('');
          setPaymentPending(false);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao fazer inscrição:', error);
      console.error('📊 Status:', error.response?.status);
      console.error('📦 Data do erro:', error.response?.data);
      
      setError('Erro ao fazer inscrição. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  let selectedLot = null;
  if (event && event.lots && selectedLotId) {
    selectedLot = event.lots.find(lot => lot.id === selectedLotId) || event.lots[0];
  } else if (event && event.lots && event.lots.length > 0) {
    selectedLot = event.lots[0];
  }
  
  // Debug: Log do lote selecionado
  console.log('🔍 DEBUG - Lote selecionado:', {
    selectedLot,
    selectedLotId,
    price: selectedLot?.price,
    priceType: typeof selectedLot?.price,
    isFree: selectedLot && (selectedLot.price === 0 || selectedLot.price === '0' || selectedLot.price === 0.00 || selectedLot.price === '0.00' || parseFloat(selectedLot?.price) === 0) && cartProducts.length === 0
  });

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
          size="medium"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={inscricoes[index].email}
          onChange={(e) => handleInputChange(index, e)}
          required
          size="medium"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Telefone"
          name="telefone"
          value={inscricoes[index].telefone}
          onChange={(e) => handleInputChange(index, e)}
          required
          size="medium"
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
                {field.options?.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
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

  const renderLotSelection = () => {
    if (!event || !event.lots || event.lots.length === 0) {
      return (
        <Alert severity="warning">
          Nenhum lote disponível para este evento.
        </Alert>
      );
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Selecione um Lote
        </Typography>
        <Grid container spacing={2}>
          {event.lots.map((lot) => (
              <Grid item xs={12} sm={6} md={4} key={lot.id}>
                <Card
                  sx={{
                  cursor: 'pointer',
                  border: selectedLotId === lot.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  bgcolor: selectedLotId === lot.id ? '#f3f8ff' : 'transparent',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: '#f3f8ff'
                  }
                  }}
                onClick={() => handleLotChange(lot.id)}
                >
                  <CardContent>
                  <Typography variant="h6" component="div">
                    {lot.name}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {lot.price === 0 ? 'Gratuito' : `R$ ${Number(lot.price).toFixed(2)}`}
                  </Typography>
                  {lot.start_date && lot.end_date && (
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(lot.start_date).format('DD/MM/YYYY')} - {dayjs(lot.end_date).format('DD/MM/YYYY')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderStep = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Inscrições
            </Typography>
            {renderLotSelection()}
            {selectedLotId && (
              <>
                {/* Seção de Produtos */}
                {event && event.products && event.products.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      🛍️ Produtos do Evento
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Adicione produtos à sua inscrição
                    </Typography>
                    <EventProducts 
                      eventId={event.id} 
                      onAddProduct={handleAddProduct}
                    />
                    
                    {/* Carrinho de Produtos */}
                    {cartProducts.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          🛒 Produtos Selecionados
                        </Typography>
                        <Paper sx={{ p: 2 }}>
                          {cartProducts.map((product) => (
                            <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box>
                                <Typography variant="body1">
                                  {product.name} x {product.quantity}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  R$ {parseFloat(product.price).toFixed(2)} cada
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ mr: 2 }}>
                                  R$ {(parseFloat(product.price) * product.quantity).toFixed(2)}
                                </Typography>
                                <IconButton
                                  onClick={() => handleRemoveProduct(product.id)}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Paper>
                      </Box>
                    )}
                  </Box>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Participantes
                  </Typography>
            {inscricoes.map((inscricao, index) => (
                  <Paper key={index} sx={{ p: 3, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Participante {index + 1}
                </Typography>
                      {inscricoes.length > 1 && (
                        <IconButton
                          onClick={() => removeInscricao(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                {renderInscricaoForm(index)}
                  </Paper>
                ))}
                  <Button
                  startIcon={<AddIcon />}
                  onClick={addInscricao}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                  Adicionar Participante
                  </Button>
                {renderValueSummary()}
              </Box>
                )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Confirme sua inscrição
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumo da Inscrição:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary={`${inscricoes.length} participante(s)`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary={`Total: R$ ${calculateTotal().toFixed(2)}`} />
                </ListItem>
              </List>
            </Paper>
            {renderValueSummary()}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Aguardando Confirmação do Pagamento
            </Typography>
            {registrationComplete && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Sua inscrição foi realizada com sucesso!
              </Alert>
            )}
            
            {/* Ticket Generator - Só mostrar quando inscrição estiver completa */}
            {registrationComplete && registrationCode && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🎫 Seu Ingresso
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Código de inscrição: <strong>{registrationCode}</strong>
                </Typography>
                <TicketGenerator 
                  registrationData={{
                    name: inscricoes[0]?.nome || 'Participante',
                    email: inscricoes[0]?.email || '',
                    phone: inscricoes[0]?.telefone || '',
                    registration_code: registrationCode
                  }}
                  eventData={event}
                />
              </Paper>
            )}
            
            {/* Botão manual para iPhone */}
            {paymentPending && paymentUrl && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Se o checkout não abriu automaticamente, clique no botão abaixo:
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    console.log('📱 Abrindo checkout manualmente...');
                    window.open(paymentUrl, '_blank');
                  }}
                  sx={{ mt: 1 }}
                >
                  🔗 ABRIR CHECKOUT DO PAGAMENTO
                </Button>
                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
                  Ou copie o link: <code>{paymentUrl}</code>
                </Typography>
              </Alert>
            )}
            
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              VOLTAR
            </Button>
            {event && event.products && event.products.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Não há produtos disponíveis para este evento.
              </Alert>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  const renderValueSummary = () => {
    const lotPrice = selectedLot ? Number(selectedLot.price) || 0 : 0;
    const inscriptionsTotal = lotPrice * inscricoes.length;
    const productsTotal = cartProducts.reduce((total, product) => {
      return total + (Number(product.price) * product.quantity);
    }, 0);
    const total = inscriptionsTotal + productsTotal;
    const isFree = lotPrice === 0 && cartProducts.length === 0;

    return (
      <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumo dos Valores
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Inscrições ({inscricoes.length}x): {isFree ? 'Gratuito' : `R$ ${inscriptionsTotal.toFixed(2)}`}
          </Typography>
          {cartProducts.length > 0 && (
            <Typography variant="body1">
              Produtos: R$ {productsTotal.toFixed(2)}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h5" color="primary" fontWeight="bold">
          Total: {isFree ? 'Gratuito' : `R$ ${total.toFixed(2)}`}
        </Typography>
      </Box>
    );
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

  return (
    <Box>
      <ModernHeader />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {event.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
            {event.date && dayjs(event.date).format('DD [de] MMMM [de] YYYY [às] HH:mm')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
                  {event.location}
                </Typography>
          {selectedLot && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`${selectedLot.name} - R$ ${Number(selectedLot.price).toFixed(2)}`}
                color="primary"
                variant="outlined"
              />
                  </Box>
                )}
        </Paper>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
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
          <Box>
            {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
                onClick={() => navigate('/')}
            >
                Finalizar
            </Button>
            ) : (
                        <Button 
                variant="contained"
                onClick={activeStep === 1 ? handleCheckoutAndNext : handleNext}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                {activeStep === 1 ? (() => {
                  const isFree = selectedLot && (selectedLot.price === 0 || selectedLot.price === '0' || selectedLot.price === 0.00 || selectedLot.price === '0.00' || parseFloat(selectedLot?.price) === 0) && cartProducts.length === 0;
                  console.log('🔍 DEBUG - Botão:', { isFree, price: selectedLot?.price, cartProductsLength: cartProducts.length });
                  return isFree ? 'Finalizar' : 'Ir para Checkout';
                })() : 'Próximo'}
                        </Button>
              )}
            </Box>
        </Box>
      </Container>
      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default Inscricao; 