import { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { useNavigate, Routes, Route, Outlet } from "react-router-dom";
import api from "../services/api";
import {
  Box, Typography, Grid, Card, CardContent, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Tabs, Tab, Chip, Divider, GlobalStyles, MenuItem,
  CardHeader, List, ListItem, ListItemText, ListItemSecondaryAction,
  FormControl, InputLabel, Select
} from "@mui/material";
import {
  Event as EventIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon
} from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CriarEvento from './CriarEvento';
import "../AdminEvents.css";
import Financeiro from './dashboard/Financeiro';
import ConfigSite from './ConfigSite';
import { AdminLayout } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "create", "edit", "delete"
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    banner: "",
    status: "active"
  });
  const [participantFilters, setParticipantFilters] = useState({
    eventId: '',
    status: '',
    startDate: null,
    endDate: null,
    loteId: '',
    name: '',
    email: ''
  });
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const [openParticipantDetails, setOpenParticipantDetails] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalRevenue: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [filterEventId, setFilterEventId] = useState('');

  useEffect(() => {
    console.log('useEffect do AdminDashboard rodou');
    fetchData();
  }, []);

  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener('registration-updated', handler);
    return () => window.removeEventListener('registration-updated', handler);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Buscar eventos
      const eventsRes = await api.get('/admin/events');
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);

      // Buscar estatísticas
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data || {
        totalEvents: 0,
        activeEvents: 0,
        totalParticipants: 0,
        totalRevenue: 0
      });

      // Buscar eventos recentes
      const recentEventsRes = await api.get('/admin/events/active');
      setRecentEvents(Array.isArray(recentEventsRes.data) ? recentEventsRes.data : []);

      // Buscar inscrições recentes
      const recentRegistrationsRes = await api.get('/admin/registrations/recent');
      setRecentRegistrations(Array.isArray(recentRegistrationsRes.data) ? recentRegistrationsRes.data : []);

      // Buscar todas as inscrições
      const registrationsRes = await api.get('/admin/registrations');
      setRegistrations(Array.isArray(registrationsRes.data) ? registrationsRes.data : []);

      // Buscar participantes
      const participantsRes = await api.get('/admin/participants');
      setParticipants(Array.isArray(participantsRes.data) ? participantsRes.data : []);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(
          error.response?.data?.error || 
          "Erro ao carregar dados. Por favor, tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dashboardPinOk");
    window.location.reload();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type, event = null) => {
    setDialogType(type);
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        price: event.price,
        banner: event.banner,
        status: event.status || "active"
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
        banner: "",
        status: "active"
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      price: "",
      banner: "",
      status: "active"
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (dialogType === "create") {
        await api.post('/admin/events', formData);
      } else if (dialogType === "edit") {
        await api.put(`/admin/events/${selectedEvent.id}`, formData);
      } else if (dialogType === "delete") {
        await api.delete(`/admin/events/${selectedEvent.id}`);
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error("Error saving event:", error);
      setError("Erro ao salvar evento. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${selectedEvent.id}`);
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Erro ao deletar evento. Tente novamente.");
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const eventMatch = !participantFilters.eventId || r.event_id === Number(participantFilters.eventId);
      const statusMatch = !participantFilters.status || r.payment_status === participantFilters.status;
      const startDateMatch = !participantFilters.startDate || dayjs(r.created_at).isAfter(dayjs(participantFilters.startDate).subtract(1, 'day'));
      const endDateMatch = !participantFilters.endDate || dayjs(r.created_at).isBefore(dayjs(participantFilters.endDate).add(1, 'day'));
      const loteMatch = !participantFilters.loteId || r.lote_id === Number(participantFilters.loteId);
      const nameMatch = !participantFilters.name || (participants.find(p => p.id === r.user_id)?.name || '').toLowerCase().includes(participantFilters.name.toLowerCase());
      const emailMatch = !participantFilters.email || (participants.find(p => p.id === r.user_id)?.email || '').toLowerCase().includes(participantFilters.email.toLowerCase());
      return eventMatch && statusMatch && startDateMatch && endDateMatch && loteMatch && nameMatch && emailMatch;
    });
  }, [registrations, participantFilters, participants]);

  const handleFilterChange = (field, value) => {
    setParticipantFilters(f => ({ ...f, [field]: value }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedParticipantIds(filteredRegistrations.map(r => r.id));
    } else {
      setSelectedParticipantIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    setSelectedParticipantIds(ids => checked ? [...ids, id] : ids.filter(i => i !== id));
  };

  const handleExportParticipants = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedParticipantIds.length > 0) {
        params.append('ids', selectedParticipantIds.join(','));
      } else {
        Object.entries(participantFilters).forEach(([k, v]) => {
          if (v) params.append(k, v instanceof Date ? dayjs(v).format('YYYY-MM-DD') : v);
        });
      }
      const token = localStorage.getItem('token');
      const response = await api.get('/participants/export', {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participantes-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Erro ao exportar participantes. Tente novamente.');
    }
  };

  const handleViewParticipantDetails = (registrationId) => {
    const registration = registrations.find(r => r.id === registrationId);
    setSelectedRegistration(registration);
    setOpenParticipantDetails(true);
  };

  const handleCloseParticipantDetails = () => {
    setOpenParticipantDetails(false);
    setSelectedRegistration(null);
  };

  const renderRegistrations = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Inscrições</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AssessmentIcon />}
          onClick={() => handleExportRegistrations()}
        >
          Exportar CSV
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Evento</TableCell>
              <TableCell>Participante</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Idade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Dados do Formulário</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => {
              const event = events.find(e => e.id === registration.event_id);
              const participant = participants.find(p => p.id === registration.user_id);
              let formData = {};
              try {
                formData = registration.form_data ? (typeof registration.form_data === 'string' ? JSON.parse(registration.form_data) : registration.form_data) : {};
              } catch { formData = {}; }
              // Prioriza nome/email do form_data se existir
              const nome = formData.nome || formData.name || participant?.name || registration.name || '-';
              const email = formData.email || participant?.email || registration.email || '-';
              const cpf = formData.cpf || registration.cpf || '-';
              const idade = formData.idade || registration.idade || '-';
              return (
                <TableRow key={registration.id}>
                  <TableCell>{event?.title}</TableCell>
                  <TableCell>{nome}</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>{cpf}</TableCell>
                  <TableCell>{idade}</TableCell>
                  <TableCell>
                    <Chip
                      label={registration.payment_status}
                      color={registration.payment_status === 'paid' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(registration.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {Object.entries(formData).map(([key, value]) => (
                      <Typography key={key} variant="body2">
                        <b>{key}:</b> {value}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleUpdateRegistrationStatus(registration.id)}
                    >
                      Atualizar Status
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderParticipants = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Participantes</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField select label="Evento" size="small" value={participantFilters.eventId} onChange={e => handleFilterChange('eventId', e.target.value)} sx={filterInputSx}>
          <MenuItem value="">Todos</MenuItem>
          {events.map(ev => <MenuItem key={ev.id} value={ev.id}>{ev.title}</MenuItem>)}
        </TextField>
        <TextField select label="Status" size="small" value={participantFilters.status} onChange={e => handleFilterChange('status', e.target.value)} sx={filterInputSx}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="paid">Pago</MenuItem>
          <MenuItem value="pending">Pendente</MenuItem>
        </TextField>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Data início" value={participantFilters.startDate} onChange={v => handleFilterChange('startDate', v)} renderInput={(params) => <TextField {...params} size="small" sx={filterInputSx} />} />
          <DatePicker label="Data fim" value={participantFilters.endDate} onChange={v => handleFilterChange('endDate', v)} renderInput={(params) => <TextField {...params} size="small" sx={filterInputSx} />} />
        </LocalizationProvider>
        <TextField select label="Lote" size="small" value={participantFilters.loteId} onChange={e => handleFilterChange('loteId', e.target.value)} sx={filterInputSx}>
          <MenuItem value="">Todos</MenuItem>
          {events.flatMap(ev => (ev.lots || [])).map(lote => <MenuItem key={lote.id} value={lote.id}>{lote.name}</MenuItem>)}
        </TextField>
        <TextField label="Nome" size="small" value={participantFilters.name} onChange={e => handleFilterChange('name', e.target.value)} sx={filterInputSx} />
        <TextField label="E-mail" size="small" value={participantFilters.email} onChange={e => handleFilterChange('email', e.target.value)} sx={filterInputSx} />
        <Button variant="contained" color="primary" onClick={handleExportParticipants} sx={{ ml: 'auto', height: 40 }}>Exportar</Button>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: 3, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)' }}>
              <TableCell padding="checkbox" sx={{ color: '#fff', fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Nome</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Evento</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Data</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Lote</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRegistrations.map((registration, idx) => {
              const participant = participants.find(p => p.id === registration.user_id);
              const event = events.find(e => e.id === registration.event_id);
              const lote = event?.lots?.find(l => l.id === registration.lote_id);
              return (
                <TableRow key={registration.id} sx={{ background: idx % 2 === 0 ? '#fff7f7' : '#ffece3', '&:hover': { background: '#fff0e0' } }}>
                  <TableCell padding="checkbox">
                    <input type="checkbox" checked={selectedParticipantIds.includes(registration.id)} onChange={e => handleSelectOne(registration.id, e.target.checked)} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#222 !important', bgcolor: '#fff !important' }}>{participant?.name || (() => { try { const d = registration.form_data ? (typeof registration.form_data === 'string' ? JSON.parse(registration.form_data) : registration.form_data) : {}; return d.nome || '-'; } catch { return '-'; } })()}</TableCell>
                  <TableCell sx={{ color: '#222 !important', bgcolor: '#fff !important' }}>{participant?.email || (() => { try { const d = registration.form_data ? (typeof registration.form_data === 'string' ? JSON.parse(registration.form_data) : registration.form_data) : {}; return d.email || '-'; } catch { return '-'; } })()}</TableCell>
                  <TableCell>{event?.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={registration.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      color={registration.payment_status === 'paid' ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>{new Date(registration.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{lote?.name || '-'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 2 }} onClick={() => handleViewParticipantDetails(registration.id)}>Ver Detalhes</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderReports = () => {
    const chartData = {
      labels: events.map(e => e.title),
      datasets: [
        {
          label: 'Inscrições por Evento',
          data: events.map(event =>
            registrations.filter(r => r.event_id === event.id).length
          ),
          backgroundColor: '#1976d2'
        }
      ]
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Relatórios</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total de Eventos</Typography>
                <Typography variant="h4">{events.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total de Inscrições</Typography>
                <Typography variant="h4">{registrations.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Inscrições por Evento</Typography>
                <Bar data={chartData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const handleExportRegistrations = async () => {
    try {
      const response = await api.get('/events/registrations/export');
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inscricoes-${selectedEvent?.title}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar inscrições:', error);
      setError('Erro ao exportar inscrições. Tente novamente.');
    }
  };

  const handleExportExcel = () => {
    const filteredData = filterEventId
      ? registrations.filter(r => r.event_id === Number(filterEventId))
      : registrations;
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Evento,Participante,Email,Status,Data de Inscrição,Lote\n" +
      filteredData.map(r => {
        const event = events.find(e => e.id === r.event_id);
        const participant = participants.find(p => p.id === r.user_id);
        const lote = event?.lots?.find(l => l.id === r.lot_id);
        return `${r.id},${event?.title || '-'},${participant?.name || '-'},${participant?.email || '-'},${r.payment_status},${new Date(r.created_at).toLocaleDateString()},${lote?.name || '-'}`;
      }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inscricoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterInputSx = {
    bgcolor: '#fff !important',
    borderRadius: 2,
    minWidth: 120,
    color: '#222 !important',
    fontWeight: 500,
    '& .MuiInputBase-root': { bgcolor: '#fff !important', color: '#222 !important', fontWeight: 500 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eee !important' },
    '& .MuiSelect-select': { color: '#222 !important', fontWeight: 500, bgcolor: '#fff !important' },
    '& .MuiInputLabel-root': { color: '#222 !important', fontWeight: 600 },
    '& option': { color: '#222', background: '#fff' },
  };

  const globalStyles = <GlobalStyles styles={{
    'select, option, input, .MuiInputBase-root, .MuiOutlinedInput-root': {
      backgroundColor: '#fff !important',
      color: '#222 !important',
      fontWeight: 500,
      border: 'none',
    },
    '.MuiInputLabel-root': {
      color: '#222 !important',
      fontWeight: 600,
    },
    '.MuiTableCell-root': {
      color: '#222 !important',
      backgroundColor: '#fff !important',
    },
  }} />;

  useImperativeHandle(ref, () => ({
    setActiveTab,
  }));

  const renderDashboard = () => (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Estatísticas Gerais */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total de Eventos</Typography>
                </Box>
                <Typography variant="h4">{stats.totalEvents}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {stats.activeEvents} eventos ativos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Participantes</Typography>
                </Box>
                <Typography variant="h4">{stats.totalParticipants}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Total de inscritos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Receita Total</Typography>
                </Box>
                <Typography variant="h4">
                  R$ {(stats.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Valor total arrecadado
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Taxa de Conversão</Typography>
                </Box>
                <Typography variant="h4">
                  {stats.totalEvents > 0 
                    ? Math.round((stats.totalParticipants / stats.totalEvents) * 10) / 10
                    : 0}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Média de participantes por evento
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Inscrições</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Evento</InputLabel>
                <Select
                  value={filterEventId}
                  onChange={(e) => setFilterEventId(e.target.value)}
                  label="Filtrar por Evento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {events.map(event => (
                    <MenuItem key={event.id} value={event.id}>{event.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleExportExcel}>
                Exportar Excel
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Evento</TableCell>
                    <TableCell>Participante</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data de Inscrição</TableCell>
                    <TableCell>Lote</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(filterEventId ? registrations.filter(r => r.event_id === Number(filterEventId)) : registrations).map((registration) => {
                    const event = events.find(e => e.id === registration.event_id);
                    const participant = participants.find(p => p.id === registration.user_id);
                    const lote = event?.lots?.find(l => l.id === registration.lot_id);
                    return (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.id}</TableCell>
                        <TableCell>{event?.title || '-'}</TableCell>
                        <TableCell>{participant?.name || '-'}</TableCell>
                        <TableCell>{participant?.email || '-'}</TableCell>
                        <TableCell>{registration.payment_status}</TableCell>
                        <TableCell>{new Date(registration.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{lote?.name || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      )}
    </Box>
  );

  return (
    <ErrorBoundary>
      {renderDashboard()}
    </ErrorBoundary>
  );
});

export default AdminDashboard;