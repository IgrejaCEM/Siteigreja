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
  
  // Proteção contra redirecionamento não intencional
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
  // paymentMethod state removido - método será escolhido no checkout do Mercado Pago
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
    // Carregar seleções salvas
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
  }, []);

  // Limpar seleções após inscrição bem-sucedida
  const clearSelections = () => {
    localStorage.removeItem('eventSelections');
  };

  useEffect(() => {
    console.log('🎯 Inscricao component mounted/updated, event ID:', id);
    const fetchEvent = async () => {
      try {
        console.log('📡 Carregando dados do evento:', id);
        const response = await api.get(`/events/${id}`);
        console.log('✅ Evento carregado:', response.data.title);
        setEvent(response.data);
        // Não seleciona lote automaticamente - usuário deve escolher
        if (response.data.lots && response.data.lots.length > 0) {
          console.log('📋 Lotes disponíveis:', response.data.lots.map(l => `${l.name} - R$ ${l.price}`));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar evento:', error);
        setError('Erro ao carregar evento');
      } finally {
        setLoading(false);
        
        // Verificar se é lote gratuito
        const isFree = selectedLot && selectedLot?.price === 0 && cartProducts.length === 0;
        
        if (isFree) {
          // Para lotes gratuitos, ir direto para a última etapa
          setPaymentStatus('completed');
          setActiveStep(2);
        }
        // Para lotes pagos, aguardar confirmação do pagamento
      }
    };

    fetchEvent();
  }, [id]);

  // Proteção contra redirecionamento durante checkout
  useEffect(() => {
    if (preventRedirect) {
      console.log('🛡️ Proteção contra redirecionamento ativada');
      
      // Intercepta tentativas de redirecionamento
      const handleBeforeUnload = (e) => {
        if (activeStep >= 1) {
          console.log('⚠️ Tentativa de sair da página detectada');
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      };

      // Intercepta mudanças de URL
      const handlePopState = (e) => {
        if (activeStep >= 1) {
          console.log('⚠️ Tentativa de navegação detectada');
          e.preventDefault();
          window.history.pushState(null, '', window.location.pathname);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [preventRedirect, activeStep]);

  // Limpa o flag de checkout quando o componente for desmontado
  useEffect(() => {
    return () => {
      console.log('🧹 Limpando flags de checkout...');
      sessionStorage.removeItem('checkout_in_progress');
    };
  }, []);

  // Função para verificar status do pagamento
  const checkPaymentStatus = async () => {
    if (registrationCode) {
      try {
        const response = await api.get(`/payments/${registrationCode}`);
        if (response.data.status === 'completed') {
          setPaymentPending(false);
          setPaymentStatus('completed');
          // Limpa o flag de checkout em andamento
          sessionStorage.removeItem('checkout_in_progress');
          setPreventRedirect(false);
          // Ir para a última etapa quando pagamento for confirmado
          setActiveStep(2);
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
          // Ir para a última etapa quando pagamento for confirmado
          setActiveStep(2);
        }
      } catch (err) {
        // Ignora erros de polling
      }
    }
  }, paymentPending ? 5000 : null);

  useEffect(() => {
    // Interceptar deep links automaticamente
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

      const response = await api.post(`/events/${event.id}/inscricao-simples`, {
        participantes: participantesToSend,
        payment_method: 'CHECKOUT_PRO', // Método genérico para Checkout Pro
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
    const price = Number(selectedLot?.price) || 0;
    const inscriptionsTotal = price * inscricoes.length;
    
    // Calcular total dos produtos
    const productsTotal = cartProducts.reduce((total, product) => {
      return total + (Number(product.price) * product.quantity);
    }, 0);
    
    const total = inscriptionsTotal + productsTotal;
    console.log('💰 Cálculo do total:', {
      selectedLot,
      price,
      inscriptionsTotal,
      cartProducts,
      productsTotal,
      total
    });
    return total;
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
    console.log('🚀 Iniciando processo de checkout...');
    setPreventRedirect(true); // Ativa proteção contra redirecionamento
    sessionStorage.setItem('checkout_in_progress', 'true'); // Marca checkout em andamento
    setLoading(true);
    setError('');
    try {
      if (!isAllInscricoesValid()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }
      // Removida validação de paymentMethod - método será escolhido no checkout do Mercado Pago
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
        }),
        form_data: {
          nome: inscricao.nome,
          email: inscricao.email,
          telefone: inscricao.telefone,
          cpf: inscricao.cpf,
          idade: inscricao.idade,
          genero: inscricao.genero,
          endereco: inscricao.endereco,
          autorizacao_imagem: inscricao.autorizacao_imagem,
          custom_fields: inscricao.custom_fields
        }
      }));

      const requestData = {
        participantes: participantesToSend,
        payment_method: 'CHECKOUT_PRO', // Método genérico para Checkout Pro
        lot_id: selectedLotId,
        products: cartProducts.map(p => ({ id: p.id, quantity: p.quantity }))
      };

      console.log('📦 Dados sendo enviados para a API:', JSON.stringify(requestData, null, 2));

      const response = await api.post(`/events/${event.id}/inscricao-simples`, requestData);

      console.log('✅ Resposta da API:', response.data);
      setRegistrationCode(response.data.registration_code);
      setRegistrationComplete(true);
      setError('');
      
      // Verificar se é lote gratuito
      const isFree = selectedLot && selectedLot?.price === 0 && cartProducts.length === 0;
      
      if (isFree) {
        // Para lotes gratuitos, ir direto para a última etapa
        setPaymentStatus('completed');
        setActiveStep(2);
      } else {
        // Para lotes pagos, verificar se há link de pagamento
        if (response.data.payment_info && response.data.payment_info.payment_url) {
          setPaymentUrl(response.data.payment_info.payment_url);
          setPaymentPending(true);
        } else {
          setPaymentUrl('');
          setPaymentPending(false);
        }
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
    } catch (error) {
      console.error('❌ Erro ao fazer inscrição:', error);
      console.error('📊 Status:', error.response?.status);
      console.error('📦 Data do erro:', error.response?.data);
      
      setError(
        error.response?.data?.error ||
        error.response?.data?.details ||
        'Erro ao fazer inscrição. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Adicionar esta função para renderizar o resumo
  const renderValueSummary = () => {
    const inscriptionsTotal = (Number(selectedLot?.price) || 0) * inscricoes.length;
    const productsTotal = cartProducts.reduce((total, product) => {
      return total + (Number(product.price) * product.quantity);
    }, 0);
    const total = inscriptionsTotal + productsTotal;
    const isFree = selectedLot && selectedLot?.price === 0 && cartProducts.length === 0;

    return (
      <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumo dos Valores
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Inscrições ({inscricoes.length}x): {selectedLot && selectedLot?.price === 0 ? 'Gratuito' : `R$ ${inscriptionsTotal.toFixed(2)}`}
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

  // Verificação de segurança para lots
  if (!event.lots || event.lots.length === 0) {
    return (
      <Box>
        <ModernHeader />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Nenhum lote disponível
            </Typography>
            <Typography>
              Este evento não possui lotes disponíveis para inscrição.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Voltar para Home
            </Button>
          </Alert>
        </Box>
        <Footer />
      </Box>
    );
  }

  // Verificação global de selectedLot para evitar erros
  const selectedLot = event?.lots?.find(lot => lot.id === selectedLotId) || event?.lots?.[0];

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

  const renderLotSelection = () => {
    const now = dayjs();
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Selecione o Lote
        </Typography>
        <Grid container spacing={2}>
          {event.lots.map((lot) => {
            const isAvailable = 
              lot.status === 'active' &&
              lot.quantity > 0 &&
              dayjs(lot.start_date).isBefore(now) &&
              dayjs(lot.end_date).isAfter(now);
            
            const isSoldOut = lot.quantity <= 0;
            const isExpired = dayjs(lot.end_date).isBefore(now);
            const isFuture = dayjs(lot.start_date).isAfter(now);

            return (
              <Grid item xs={12} sm={6} md={4} key={lot.id}>
                <Card
                  sx={{
                    cursor: isAvailable ? 'pointer' : 'default',
                    bgcolor: selectedLotId === lot.id ? 'action.selected' : 'background.paper',
                    opacity: isAvailable ? 1 : 0.6,
                    '&:hover': isAvailable ? { bgcolor: 'action.hover' } : {}
                  }}
                  onClick={() => isAvailable && handleLotChange(lot.id)}
                >
                  <CardContent>
                    <Typography variant="h6">{lot.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Preço: {lot.price === 0 ? 'Gratuito' : `R$ ${lot.price}`}
                    </Typography>

                    {!isAvailable && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {isSoldOut ? '🔴 Esgotado' : 
                         isExpired ? '⏰ Período encerrado' :
                         isFuture ? '⏳ Em breve' : '❌ Indisponível'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderStep = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {renderLotSelection()}
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography variant="h6">Inscrições ({inscricoes.length})</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addInscricao}
                fullWidth={false}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
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
                    fullWidth={false}
                  >
                    Remover Inscrição
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        );

      case 1:
        // Passo de confirmação e pagamento
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirme sua inscrição
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Resumo da Inscrição:</strong>
              </Typography>
              <Typography variant="body2">
                • {inscricoes.length} participante(s)
              </Typography>
              {cartProducts.length > 0 && (
                <Typography variant="body2">
                  • {cartProducts.length} produto(s) selecionado(s)
                </Typography>
              )}
              <Typography variant="body2">
                • Total: R$ {calculateTotal().toFixed(2)}
              </Typography>
            </Alert>

            {/* Resumo detalhado dos valores */}
            {renderValueSummary()}

            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedLot && selectedLot?.price === 0 && cartProducts.length === 0 
                ? 'Clique no botão "Confirmar Inscrição" abaixo para finalizar sua inscrição gratuita.'
                : 'Clique no botão "Ir para o Checkout" abaixo para ir ao checkout do Mercado Pago, onde você poderá escolher a forma de pagamento (PIX, Cartão de Crédito, Boleto, etc.).'
              }
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {paymentStatus === 'completed' ? 'Inscrição Confirmada!' : 'Aguardando Confirmação do Pagamento'}
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
            {registrationCode && paymentStatus === 'completed' && (
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Código de Inscrição: {registrationCode}
                </Typography>
                <QRCode value={registrationCode} size={200} />
              </Box>
            )}
            {paymentStatus === 'completed' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 3 }}>
                {console.log('🎫 Dados para ticket:', {
                  registrationCode,
                  inscricoes: inscricoes[0],
                  event
                })}
                <TicketGenerator 
                  registrationData={{
                    name: inscricoes[0]?.nome,
                    email: inscricoes[0]?.email,
                    phone: inscricoes[0]?.telefone,
                    registration_code: registrationCode
                  }}
                  eventData={event}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/')}
                  sx={{ mt: 2 }}
                >
                  Voltar para Home
                </Button>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  console.log('🎨 Renderizando página de inscrição, step:', activeStep, 'loading:', loading);
  
  return (
    <Box>
      <ModernHeader />
      
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
            Inscrição para {event?.title || 'Carregando...'}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 2, md: 0 } }}>
                    <Typography variant="subtitle1" color="primary">
                      {event.lots.find(lot => 
                        dayjs(lot.end_date).isAfter(dayjs()) && lot.quantity > 0
                      ).name}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {event.lots.find(lot => 
                        dayjs(lot.end_date).isAfter(dayjs()) && lot.quantity > 0
                      ).price > 0 ? `R$ ${calculateTotal()}` : 'Gratuito'}
                    </Typography>

                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Stepper activeStep={activeStep} sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Stepper mobile */}
          <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Passo {activeStep + 1} de {steps.length}: {steps[activeStep]}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              {steps.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                    transition: 'background-color 0.3s'
                  }}
                />
              ))}
            </Box>
          </Box>

          {renderStep(activeStep)}

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            mt: 4,
            gap: { xs: 2, sm: 0 }
          }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              fullWidth={false}
              sx={{ 
                order: { xs: 2, sm: 1 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Voltar
            </Button>
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={
                  activeStep === 1 ? handleCheckoutAndNext : 
                  handleNext
                }
                disabled={loading}
                fullWidth={false}
                sx={{ 
                  order: { xs: 1, sm: 2 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 
                  activeStep === 1 
                    ? (selectedLot && selectedLot?.price === 0 && cartProducts.length === 0 
                        ? 'Confirmar Inscrição' 
                        : 'Ir para o Checkout'
                      )
                    : 'Próximo'}
              </Button>
            )}
          </Box>

          {event && (
            <Box sx={{ mt: 4 }}>
              <EventProducts eventId={event.id} onAddProduct={handleAddProduct} />
              
              {cartProducts.length > 0 && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Produtos Selecionados
                  </Typography>
                  {cartProducts.map(product => (
                    <Box key={product.id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantidade: {product.quantity} | R$ {product.price.toFixed(2)} cada
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" fontWeight="bold">
                          R$ {(product.price * product.quantity).toFixed(2)}
                        </Typography>
                        <Button 
                          color="error" 
                          size="small"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          Remover
                        </Button>
                      </Box>
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