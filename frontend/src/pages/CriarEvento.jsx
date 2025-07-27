import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../services/api';
import { styled } from '@mui/material/styles';
import FormFieldsManager from '../components/FormFieldsManager';
import EventoPreview from '../components/EventoPreview';
import EventImageUpload from '../components/EventImageUpload';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const CriarEvento = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Para edição de evento
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Estado principal do evento
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    banner: '',
    banner_home: '',
    banner_evento: '',
    status: 'active',
    has_payment: false,
    payment_gateway: '',
    currency: 'BRL',
    registration_form: {
      cpf: false,
      idade: false,
      genero: false,
      endereco: false,
      autorizacao_imagem: false,
      custom_fields: []
    },
    lots: [{
      name: '',
      price: 0,
      quantity: 0,
      start_date: null,
      end_date: null,
      status: 'active'
    }],
    payment_methods: ['credit_card', 'pix', 'boleto']
  });

  // Estado para campos do formulário
  const [requiredFields, setRequiredFields] = useState({
    cpf: false,
    idade: false,
    genero: false,
    endereco: false,
    autorizacao_imagem: false
  });

  const [customFields, setCustomFields] = useState([]);

  // Estado para configurações de pagamento
  const [paymentSettings, setPaymentSettings] = useState({
    stripe_key: '',
    mercadopago_key: '',
    pagseguro_key: '',
    payment_methods: ['credit_card', 'pix', 'boleto']
  });

  const [previewMode, setPreviewMode] = useState(false);

  // Adicione ao estado do lote:
  const [freeLots, setFreeLots] = useState({});

  // Carregar dados do evento para edição
  useEffect(() => {
    const loadEventData = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await api.get(`/admin/events/${id}`);
          const event = response.data;

          setForm({
            title: event.title,
            description: event.description,
            date: dayjs(event.date).format('YYYY-MM-DD'),
            location: event.location,
            banner: event.banner,
            banner_home: event.banner_home,
            banner_evento: event.banner_evento,
            status: event.status,
            has_payment: event.has_payment,
            payment_gateway: event.payment_gateway,
            currency: event.currency,
            registration_form: event.registration_form,
            lots: event.lots || [{
              name: '',
              price: '',
              quantity: '',
              start_date: null,
              end_date: null
            }],
            payment_methods: event.payment_methods || ['credit_card', 'pix', 'boleto']
          });

          setRequiredFields(event.required_fields || {
            cpf: false,
            idade: false,
            genero: false,
            endereco: false,
            autorizacao_imagem: false
          });

          setCustomFields(event.custom_fields || []);

          setPaymentSettings(event.payment_settings || {
            stripe_key: '',
            mercadopago_key: '',
            pagseguro_key: '',
            payment_methods: ['credit_card', 'pix', 'boleto']
          });
        } catch (error) {
          setError('Erro ao carregar dados do evento. Tente novamente.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadEventData();
  }, [id]);

  // Handler para validar URLs de imagem
  const validateImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
  };

  // Handler para lotes
  const handleAddLot = () => {
    setForm(prev => ({
      ...prev,
      lots: [...prev.lots, {
        name: '',
        price: '',
        quantity: '',
        start_date: null,
        end_date: null
      }]
    }));
  };

  const handleRemoveLot = (index) => {
    setForm(prev => ({
      ...prev,
      lots: prev.lots.filter((_, i) => i !== index)
    }));
  };

  const handleLotChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      lots: prev.lots.map((lot, i) =>
        i === index ? { ...lot, [field]: value } : lot
      )
    }));
  };

  const handleFreeLotChange = (index, checked) => {
    setFreeLots(prev => ({ ...prev, [index]: checked }));
    handleLotChange(index, 'price', checked ? 0 : '');
  };

  // Handler para salvar evento
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!form.title || !form.description || !form.date || !form.location) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      // Validar lotes
      const validLots = form.lots.every(lot => 
        lot.name && 
        lot.price >= 0 && 
        lot.quantity >= 0 && 
        lot.start_date && 
        lot.end_date
      );

      if (!validLots) {
        throw new Error('Por favor, preencha todos os campos dos lotes corretamente');
      }

      // Formatar datas para o formato esperado pelo backend
      const formattedLots = form.lots.map(lot => ({
        ...lot,
        price: parseFloat(lot.price) || 0,
        quantity: parseInt(lot.quantity) || 0,
        start_date: lot.start_date ? dayjs(lot.start_date).format('YYYY-MM-DD') : null,
        end_date: lot.end_date ? dayjs(lot.end_date).format('YYYY-MM-DD') : null,
        status: lot.status || 'active'
      }));

      const formData = {
        ...form,
        date: dayjs(form.date).format('YYYY-MM-DD HH:mm:ss'),
        registration_form: {
          ...form.registration_form,
          custom_fields: form.registration_form.custom_fields.map(field => ({
            ...field,
            options: field.type === 'select' ? field.options : undefined
          }))
        },
        lots: formattedLots,
        has_payment: Boolean(form.has_payment),
        payment_gateway: form.has_payment ? form.payment_gateway : null
      };

      const response = await api.post('/admin/events', formData);
      setSuccess('Evento criado com sucesso!');
      navigate('/admin/events');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewUpdate = (updatedEventData) => {
    setForm(prev => ({
      ...prev,
      ...updatedEventData
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Editar Evento' : 'Criar Novo Evento'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Evento criado com sucesso! Redirecionando...
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setPreviewMode(!previewMode)}
          startIcon={previewMode ? <EditIcon /> : <PreviewIcon />}
          sx={{ mb: 2 }}
        >
          {previewMode ? 'Voltar para Edição' : 'Modo Preview'}
        </Button>

        {previewMode ? (
          <EventoPreview
            eventData={form}
            onUpdate={handlePreviewUpdate}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Informações Básicas */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informações Básicas
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Título do Evento"
                          value={form.title || ''}
                          onChange={(e) => setForm({...form, title: e.target.value})}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Descrição"
                          value={form.description || ''}
                          onChange={(e) => setForm({...form, description: e.target.value})}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Data do Evento"
                            value={form.date || ''}
                            onChange={(newValue) => setForm({...form, date: newValue})}
                            format="DD/MM/YYYY"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Local"
                          value={form.location || ''}
                          onChange={(e) => setForm({...form, location: e.target.value})}
                          required
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Banners */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Banners e Imagens
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Banner Principal
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Tamanho recomendado: 1920x1080 pixels
                        </Typography>
                        <EventImageUpload
                          currentImage={form.banner}
                          onImageUploaded={(url) => setForm({...form, banner: url})}
                          label="Selecionar Banner Principal"
                          folder="events"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Banner Home
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Tamanho recomendado: 800x600 pixels
                        </Typography>
                        <EventImageUpload
                          currentImage={form.banner_home}
                          onImageUploaded={(url) => setForm({...form, banner_home: url})}
                          label="Selecionar Banner Home"
                          folder="events"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Banner Evento
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Tamanho recomendado: 1200x400 pixels
                        </Typography>
                        <EventImageUpload
                          currentImage={form.banner_evento}
                          onImageUploaded={(url) => setForm({...form, banner_evento: url})}
                          label="Selecionar Banner Evento"
                          folder="events"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Lotes */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Lotes
                      </Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddLot}
                        variant="contained"
                        size="small"
                      >
                        Adicionar Lote
                      </Button>
                    </Box>
                    
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Preço</TableCell>
                            <TableCell>Quantidade</TableCell>
                            <TableCell>Data de Início</TableCell>
                            <TableCell>Data de Término</TableCell>
                            <TableCell>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {form.lots.map((lot, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={lot.name || ''}
                                  onChange={(e) => handleLotChange(index, 'name', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  value={lot.price ?? 0}
                                  onChange={(e) => handleLotChange(index, 'price', e.target.value)}
                                  disabled={freeLots[index]}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!!freeLots[index] || lot.price === 0}
                                      onChange={(e) => handleFreeLotChange(index, e.target.checked)}
                                    />
                                  }
                                  label="Lote Gratuito"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  value={lot.quantity ?? 0}
                                  onChange={(e) => handleLotChange(index, 'quantity', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  label="Data de Início"
                                  type="date"
                                  value={lot.start_date || ''}
                                  onChange={(e) => handleLotChange(index, 'start_date', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  label="Data de Término"
                                  type="date"
                                  value={lot.end_date || ''}
                                  onChange={(e) => handleLotChange(index, 'end_date', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleRemoveLot(index)}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Formulário de Inscrição */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Formulário de Inscrição
                    </Typography>
                    <FormFieldsManager
                      requiredFields={requiredFields}
                      onRequiredFieldsChange={setRequiredFields}
                      customFields={customFields}
                      onCustomFieldsChange={setCustomFields}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Configurações de Pagamento */}
              {/* REMOVIDO: Bloco de configurações de pagamento (gateway, moeda, chave API) */}

              {/* Botões de Ação */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/events')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar Evento'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default CriarEvento; 