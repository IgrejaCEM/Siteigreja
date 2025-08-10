import { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Paper, 
  Grid, 
  InputAdornment,
  Divider,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';
import dayjs from 'dayjs';
import EventStore from '../components/EventStore';

export default function EditarEvento() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    banner: '',
    banner_home: '',
    banner_evento: '',
    price: '',
    status: 'active',
    registration_form: {
      cpf: false,
      idade: false,
      genero: false,
      endereco: false,
      autorizacao_imagem: false,
      custom_fields: []
    },
    lots: []
  });
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openLotDialog, setOpenLotDialog] = useState(false);
  const [editingLotIndex, setEditingLotIndex] = useState(null);
  const [newLot, setNewLot] = useState({
    name: '',
    price: '',
    quantity: '',
    start_date: '',
    end_date: '',
    status: 'active',
    kit_includes: []
  });
  const [openCustomFieldDialog, setOpenCustomFieldDialog] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    label: '',
    type: 'text',
    required: false,
    options: [] // for select type fields
  });
  const [isFree, setIsFree] = useState(false);
  
  const navigate = useNavigate();

  // Função utilitária para formatar datas para o input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Criar data e ajustar para timezone local
      const date = new Date(dateString);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dateString);
        return '';
      }
      
      // Converter para timezone local e formatar
      const pad = n => n.toString().padStart(2, '0');
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const res = await api.get(`/admin/events/${id}`);
        setForm({
          title: res.data.title || '',
          date: formatDateForInput(res.data.date) || '',
          location: res.data.location || '',
          description: res.data.description || '',
          banner: res.data.banner || '',
          banner_home: res.data.banner_home || '',
          banner_evento: res.data.banner_evento || '',
          price: res.data.price || '',
          status: res.data.status || 'active',
          registration_form: res.data.registration_form || {
            cpf: false,
            idade: false,
            genero: false,
            endereco: false,
            autorizacao_imagem: false,
            custom_fields: []
          },
          lots: res.data.lots || []
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        setError('Erro ao carregar evento. Por favor, tente novamente.');
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id]);

  useEffect(() => {
    setIsFree(newLot.price === 0);
  }, [newLot.price]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistrationFieldChange = (field) => (e) => {
    setForm(prev => ({
      ...prev,
      registration_form: {
        ...prev.registration_form,
        [field]: e.target.checked
      }
    }));
  };

  const handleAddLot = () => {
    if (editingLotIndex !== null) {
      // Editando lote existente
      setForm(prev => ({
        ...prev,
        lots: prev.lots.map((lot, index) => 
          index === editingLotIndex ? {
            ...newLot,
            price: parseFloat(newLot.price),
            quantity: parseInt(newLot.quantity)
          } : lot
        )
      }));
    } else {
      // Adicionando novo lote
      setForm(prev => ({
        ...prev,
        lots: [...prev.lots, {
          ...newLot,
          price: parseFloat(newLot.price),
          quantity: parseInt(newLot.quantity)
        }]
      }));
    }
      setNewLot({
      name: '',
      price: '',
      quantity: '',
      start_date: '',
      end_date: '',
        status: 'active',
        kit_includes: []
    });
    setEditingLotIndex(null);
    setOpenLotDialog(false);
  };

  const handleEditLot = (index) => {
    const lot = form.lots[index];
    setNewLot({
      ...lot,
      price: lot.price.toString(),
      quantity: lot.quantity.toString(),
      start_date: dayjs(lot.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(lot.end_date).format('YYYY-MM-DD')
    });
    setEditingLotIndex(index);
    setOpenLotDialog(true);
  };

  const handleRemoveLot = async (index) => {
    try {
      const lot = form.lots[index];
      
      // Se o lote já existe no banco (tem ID), tenta deletar via API
      if (lot.id) {
        await api.delete(`/lots/${lot.id}`);
      }
      
      // Atualiza o estado local
      setForm(prev => ({
        ...prev,
        lots: prev.lots.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Erro ao remover lote:', error);
      setError(error.response?.data?.error || 'Erro ao remover lote');
    }
  };

  const handleAddCustomField = () => {
    setForm(prev => ({
      ...prev,
      registration_form: {
        ...prev.registration_form,
        custom_fields: [...prev.registration_form.custom_fields, newCustomField]
      }
    }));
    setNewCustomField({
      label: '',
      type: 'text',
      required: false,
      options: []
    });
    setOpenCustomFieldDialog(false);
  };

  const handleRemoveCustomField = (index) => {
    setForm(prev => ({
      ...prev,
      registration_form: {
        ...prev.registration_form,
        custom_fields: prev.registration_form.custom_fields.filter((_, i) => i !== index)
      }
    }));
  };

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
        start_date: lot.start_date ? dayjs(lot.start_date).format('YYYY-MM-DD HH:mm:ss') : null,
        end_date: lot.end_date ? dayjs(lot.end_date).format('YYYY-MM-DD HH:mm:ss') : null,
        status: lot.status || 'active',
        kit_includes: Array.isArray(lot.kit_includes) ? lot.kit_includes : (typeof lot.kit_includes === 'string' ? lot.kit_includes.split(',').map(v => v.trim()).filter(Boolean) : [])
      }));

      const response = await api.put(`/admin/events/${id}`, {
        ...form,
        lots: formattedLots
      });

      setSuccess('Evento atualizado com sucesso!');
      navigate('/admin/eventos');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao atualizar evento');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
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

      // Atualizar o formulário com a URL real do servidor
      setForm(prev => ({
        ...prev,
        [imageType]: response.data.url
      }));

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
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

  const handleImageUrl = (imageType) => {
    const url = prompt('Digite a URL da imagem:');
    if (url && url.trim()) {
      setForm(prev => ({
        ...prev,
        [imageType]: url.trim()
      }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Editar Evento</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Informações Básicas" />
          <Tab label="Imagens" />
          <Tab label="Campos de Inscrição" />
          <Tab label="Lotes" />
          <Tab label="Loja" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          {/* Tab 1: Informações Básicas */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data"
                  type="datetime-local"
                  name="date"
                  value={formatDateForInput(form.date)}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Local"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descrição"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preço"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                    <MenuItem value="draft">Rascunho</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Imagens */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Banner Principal
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                  Tamanho recomendado: 1920x1080 pixels
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-banner-upload"
                  type="file"
                  onChange={(e) => handleBannerChange(e, 'banner')}
                />
                <label htmlFor="edit-banner-upload">
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
                  <Card sx={{ mt: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={form.banner}
                      alt="Banner Preview"
                    />
                  </Card>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Banner da Página Inicial
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                  Tamanho recomendado: 800x600 pixels
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-banner-home-upload"
                  type="file"
                  onChange={(e) => handleBannerChange(e, 'banner_home')}
                />
                <label htmlFor="edit-banner-home-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Selecionar Banner da Página Inicial
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
                  <Card sx={{ mt: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={form.banner_home}
                      alt="Banner Home Preview"
                    />
                  </Card>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Banner Específico do Evento
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                  Tamanho recomendado: 1200x400 pixels
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="edit-banner-evento-upload"
                  type="file"
                  onChange={(e) => handleBannerChange(e, 'banner_evento')}
                />
                <label htmlFor="edit-banner-evento-upload">
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
                  <Card sx={{ mt: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={form.banner_evento}
                      alt="Banner Evento Preview"
                    />
                  </Card>
                )}
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Campos de Inscrição */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Campos Obrigatórios</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.registration_form.cpf}
                      onChange={handleRegistrationFieldChange('cpf')}
                    />
                  }
                  label="CPF"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.registration_form.idade}
                      onChange={handleRegistrationFieldChange('idade')}
                    />
                  }
                  label="Idade"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.registration_form.genero}
                      onChange={handleRegistrationFieldChange('genero')}
                    />
                  }
                  label="Gênero"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.registration_form.endereco}
                      onChange={handleRegistrationFieldChange('endereco')}
                    />
                  }
                  label="Endereço"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.registration_form.autorizacao_imagem}
                      onChange={handleRegistrationFieldChange('autorizacao_imagem')}
                    />
                  }
                  label="Autorização de Imagem"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Campos Personalizados</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCustomFieldDialog(true)}
                  >
                    Adicionar Campo
                  </Button>
                </Box>
                
                {form.registration_form?.custom_fields?.map((field, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{field.label}</Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveCustomField(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Typography color="textSecondary">
                        Tipo: {field.type}
                        {field.required ? ' (Obrigatório)' : ' (Opcional)'}
                      </Typography>
                      {field.type === 'select' && field.options?.length > 0 && (
                        <Typography color="textSecondary">
                          Opções: {field.options.join(', ')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Lotes */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Lotes</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingLotIndex(null);
                      setNewLot({
                        name: '',
                        price: '',
                        quantity: '',
                        start_date: '',
                        end_date: '',
                        status: 'active',
                        kit_includes: []
                      });
                      setOpenLotDialog(true);
                    }}
                  >
                    Adicionar Lote
                  </Button>
                </Box>
                
                {form.lots.map((lot, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{lot.name}</Typography>
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditLot(index)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveLot(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography color="textSecondary">
                        Preço: R$ {lot.price}
                      </Typography>
                      <Typography color="textSecondary">
                        Quantidade: {lot.quantity} ingressos
                      </Typography>
                      <Typography color="textSecondary">
                        Período: {dayjs(lot.start_date).format('DD/MM/YYYY HH:mm')} até {dayjs(lot.end_date).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                      <Chip 
                        label={lot.status === 'active' ? 'Ativo' : 'Inativo'} 
                        color={lot.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Tab 5: Loja */}
          {activeTab === 4 && (
            <Box>
              <EventStore eventId={id} />
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/eventos')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Dialog para adicionar/editar lote */}
      <Dialog open={openLotDialog} onClose={() => setOpenLotDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLotIndex !== null ? 'Editar Lote' : 'Adicionar Novo Lote'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Lote"
                value={newLot.name}
                onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preço"
                type="number"
                value={newLot.price}
                onChange={(e) => setNewLot({ ...newLot, price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                disabled={isFree}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isFree || newLot.price === 0}
                    onChange={(e) => {
                      setIsFree(e.target.checked);
                      setNewLot({ ...newLot, price: e.target.checked ? 0 : '' });
                    }}
                  />
                }
                label="Lote Gratuito"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={newLot.quantity}
                onChange={(e) => setNewLot({ ...newLot, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                value={newLot.start_date || ''}
                onChange={(e) => setNewLot({ ...newLot, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data de Término"
                type="date"
                value={newLot.end_date || ''}
                onChange={(e) => setNewLot({ ...newLot, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Itens inclusos (separados por vírgula)"
                value={(newLot.kit_includes || []).join(', ')}
                onChange={(e) => setNewLot({ ...newLot, kit_includes: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                helperText="Ex.: Camiseta, Pulseira, Caneca"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newLot.status}
                  label="Status"
                  onChange={(e) => setNewLot({ ...newLot, status: e.target.value })}
                >
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLotDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddLot} variant="contained">
            {editingLotIndex !== null ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar novo campo personalizado */}
      <Dialog open={openCustomFieldDialog} onClose={() => setOpenCustomFieldDialog(false)}>
        <DialogTitle>Adicionar Campo Personalizado</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Campo"
                value={newCustomField.label}
                onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo do Campo</InputLabel>
                <Select
                  value={newCustomField.type}
                  onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
                  label="Tipo do Campo"
                >
                  <MenuItem value="text">Texto</MenuItem>
                  <MenuItem value="number">Número</MenuItem>
                  <MenuItem value="email">E-mail</MenuItem>
                  <MenuItem value="date">Data</MenuItem>
                  <MenuItem value="select">Seleção</MenuItem>
                  <MenuItem value="checkbox">Checkbox</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {newCustomField.type === 'select' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Opções (separadas por vírgula)"
                  value={newCustomField.options.join(',')}
                  onChange={(e) => setNewCustomField({
                    ...newCustomField,
                    options: e.target.value.split(',').map(opt => opt.trim())
                  })}
                  helperText="Digite as opções separadas por vírgula"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newCustomField.required}
                    onChange={(e) => setNewCustomField({
                      ...newCustomField,
                      required: e.target.checked
                    })}
                  />
                }
                label="Campo Obrigatório"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomFieldDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddCustomField} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 