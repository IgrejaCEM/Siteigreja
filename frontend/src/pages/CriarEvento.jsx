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
    logo: '', // ✅ NOVO: Campo para logo do evento
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
            date: event.date ? dayjs(event.date) : null, // ✅ CORRIGIDO: Converter para objeto dayjs
            location: event.location,
            banner: event.banner,
            banner_home: event.banner_home,
            banner_evento: event.banner_evento,
            logo: event.logo, // ✅ NOVO: Campo para logo do evento
            status: event.status,
            has_payment: event.has_payment,
            payment_gateway: event.payment_gateway,
            currency: event.currency,
            registration_form: event.registration_form,
            lots: event.lots ? event.lots.map(lot => ({
              ...lot,
              start_date: lot.start_date ? dayjs(lot.start_date).format('YYYY-MM-DD') : '',
              end_date: lot.end_date ? dayjs(lot.end_date).format('YYYY-MM-DD') : ''
            })) : [{
              name: '',
              price: '',
              quantity: '',
              start_date: '',
              end_date: ''
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

  const handleImageUpload = async (file, imageType) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'events');

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Construir URL completa do servidor
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://siteigreja-1.onrender.com' 
        : 'http://localhost:3005';
      
      const fullImageUrl = baseUrl + response.data.url;

      // Atualizar o formulário com a URL real do servidor
      setForm(prev => ({
        ...prev,
        [imageType]: fullImageUrl
      }));

      console.log('✅ Imagem enviada com sucesso:', fullImageUrl);

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
    }
  };

  const handleImageUrl = (imageType) => {
    const url = prompt('Digite a URL da imagem:');
    if (url && url.trim()) {
      setForm(prev => ({
        ...prev,
        [imageType]: url.trim()
      }));
    }
  };

  const handleBannerChange = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).');
      return;
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10MB.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await handleImageUpload(file, imageType);
    } catch (error) {
      setError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
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

      console.log('📅 Dados do formulário:', {
        date: form.date,
        dateFormatted: form.date ? dayjs(form.date).format('YYYY-MM-DD HH:mm:ss') : null,
        isDayjs: form.date ? dayjs.isDayjs(form.date) : false
      });

      const formData = {
        ...form,
        date: form.date ? dayjs(form.date).format('YYYY-MM-DD HH:mm:ss') : null, // ✅ CORRIGIDO: Formato correto
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
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="banner-upload"
                          type="file"
                          onChange={(e) => handleBannerChange(e, 'banner')}
                        />
                        <label htmlFor="banner-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Selecionar Banner Principal
                          </Button>
                        </label>
                        <Button
                          variant="text"
                          fullWidth
                          onClick={() => handleImageUrl('banner')}
                          sx={{ mb: 2 }}
                        >
                          Ou inserir URL
                        </Button>
                        {form.banner && (
                          <Box sx={{ mt: 2 }}>
                            <img
                              src={form.banner}
                              alt="Preview"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                      
                      {/* Logo do Evento */}
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Logo do Evento
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Tamanho recomendado: 200x200 pixels (quadrada)
                        </Typography>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="logo-upload"
                          type="file"
                          onChange={(e) => handleBannerChange(e, 'logo')}
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Selecionar Logo
                          </Button>
                        </label>
                        <Button
                          variant="text"
                          fullWidth
                          onClick={() => handleImageUrl('logo')}
                          sx={{ mb: 2 }}
                        >
                          Ou inserir URL
                        </Button>
                        {form.logo && (
                          <Box sx={{ mt: 2 }}>
                            <img
                              src={form.logo}
                              alt="Logo Preview"
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Banner Home
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Tamanho recomendado: 800x600 pixels
                        </Typography>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="banner-home-upload"
                          type="file"
                          onChange={(e) => handleBannerChange(e, 'banner_home')}
                        />
                        <label htmlFor="banner-home-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Selecionar Banner Home
                          </Button>
                        </label>
                        <Button
                          variant="text"
                          fullWidth
                          onClick={() => handleImageUrl('banner_home')}
                          sx={{ mb: 2 }}
                        >
                          Ou inserir URL
                        </Button>
                        {form.banner_home && (
                          <Box sx={{ mt: 2 }}>
                            <img
                              src={form.banner_home}
                              alt="Preview"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Banner Evento
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                          Tamanho recomendado: 1200x400 pixels
                        </Typography>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="banner-evento-upload"
                          type="file"
                          onChange={(e) => handleBannerChange(e, 'banner_evento')}
                        />
                        <label htmlFor="banner-evento-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Selecionar Banner Evento
                          </Button>
                        </label>
                        <Button
                          variant="text"
                          fullWidth
                          onClick={() => handleImageUrl('banner_evento')}
                          sx={{ mb: 2 }}
                        >
                          Ou inserir URL
                        </Button>
                        {form.banner_evento && (
                          <Box sx={{ mt: 2 }}>
                            <img
                              src={form.banner_evento}
                              alt="Preview"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        )}
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