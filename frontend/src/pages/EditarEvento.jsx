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
    status: 'active'
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

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const res = await api.get(`/admin/events/${id}`);
        setForm({
          title: res.data.title || '',
          date: res.data.date || '',
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
      status: 'active'
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
      start_date: dayjs(lot.start_date).format('YYYY-MM-DDTHH:mm'),
      end_date: dayjs(lot.end_date).format('YYYY-MM-DDTHH:mm')
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
        status: lot.status || 'active'
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

  // Função utilitária para formatar datas para o input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
                <TextField
                  fullWidth
                  label="Banner Principal"
                  name="banner"
                  value={form.banner}
                  onChange={handleChange}
                  helperText="URL da imagem principal do evento"
                />
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
                <TextField
                  fullWidth
                  label="Banner da Página Inicial"
                  name="banner_home"
                  value={form.banner_home}
                  onChange={handleChange}
                  helperText="URL da imagem que aparecerá na página inicial"
                />
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
                <TextField
                  fullWidth
                  label="Banner Específico do Evento"
                  name="banner_evento"
                  value={form.banner_evento}
                  onChange={handleChange}
                  helperText="URL da imagem específica para a página do evento"
                />
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
                        status: 'active'
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