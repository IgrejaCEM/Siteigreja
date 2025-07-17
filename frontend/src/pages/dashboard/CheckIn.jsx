import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  LinearProgress,
  TextField,
  Tabs,
  Tab,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Camera as CameraIcon,
  Scanner as ScannerIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../../services/api';

dayjs.locale('pt-br');

const CheckInPreview = ({ data, onConfirm, onCancel }) => {
  if (!data) return null;

  return (
    <Card sx={{ mt: 3, border: '2px solid #4caf50' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              mr: 2
            }}
          >
            {data.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" gutterBottom>
              {data.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {data.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" gutterBottom>
              <strong>Evento:</strong> {data.event_title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Data:</strong> {dayjs(data.event_date).format('DD/MM/YYYY HH:mm')}
            </Typography>
            <Typography variant="body1">
              <strong>Local:</strong> {data.event_location}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" gutterBottom>
              <strong>Ticket:</strong> #{data.ticket_code}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Lote:</strong> {data.lot_name}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong>{' '}
              <Chip 
                size="small"
                label={data.status === 'active' ? 'Ativo' : 'Já Utilizado'}
                color={data.status === 'active' ? 'success' : 'error'}
              />
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={onCancel}
            sx={{ mr: 2 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onConfirm}
            disabled={data.status !== 'active'}
            startIcon={<CheckIcon />}
          >
            Confirmar Check-in
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}.lighter`,
            borderRadius: 1,
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const CheckIn = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastCheckin, setLastCheckin] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    checked: 0,
    lastHourCheckins: 0,
    checkInRate: 0
  });
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [manualCode, setManualCode] = useState('');
  const manualInputRef = useRef(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    if (selectedEvent) {
      try {
        const response = await api.get(`/admin/events/${selectedEvent}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setError('Erro ao carregar estatísticas. Tente novamente.');
      }
    }
  };

  // Efeito para focar no input manual
  useEffect(() => {
    if (activeTab === 0 && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  }, [activeTab]);

  // Carregar eventos ativos
  useEffect(() => {
    const loadActiveEvents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/admin/events/active');
        if (response.data.length > 0) {
          setEvents(response.data);
          setSelectedEvent(response.data[0].id);
        } else {
          setError('Nenhum evento ativo encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        setError('Erro ao carregar eventos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    loadActiveEvents();
  }, []);

  // Atualizar estatísticas em tempo real
  useEffect(() => {
    if (!selectedEvent) return;

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const handleScan = async (data) => {
    if (!data || !selectedEvent) return;

    try {
      setIsLoading(true);
      const ticketData = typeof data === 'string' ? JSON.parse(data) : data;
      const response = await api.get(`/admin/tickets/${ticketData.ticketCode}`);
      
      if (response.data.event_id !== selectedEvent) {
        throw new Error('Este ticket é para outro evento');
      }

      setPreviewData(response.data);
      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Erro ao ler ticket:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao ler ticket');
      setPreviewData(null);
      const audio = new Audio('/sounds/error.mp3');
      audio.play();
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode || !selectedEvent) return;

    try {
      setIsLoading(true);
      let ticketCode;
      
      try {
        const jsonData = JSON.parse(manualCode);
        ticketCode = jsonData.ticketCode;
      } catch {
        ticketCode = manualCode;
      }
      
      const response = await api.get(`/admin/tickets/${ticketCode}`);
      
      if (response.data.event_id !== selectedEvent) {
        throw new Error('Este ticket é para outro evento');
      }

      setPreviewData(response.data);
      setError('');
      setSuccess('');
      setManualCode('');
    } catch (error) {
      console.error('Erro ao ler ticket:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao ler ticket');
      setPreviewData(null);
      const audio = new Audio('/sounds/error.mp3');
      audio.play();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!previewData || !selectedEvent) return;

    try {
      setIsLoading(true);
      const response = await api.post('/admin/checkin', {
        ticketCode: previewData.ticket_code,
        eventId: selectedEvent
      });

      setSuccess('Check-in realizado com sucesso!');
      setLastCheckin(response.data);
      setPreviewData(null);

      const audio = new Audio('/sounds/success.mp3');
      audio.play();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

      if (activeTab === 0 && manualInputRef.current) {
        manualInputRef.current.focus();
      }

    } catch (error) {
      console.error('Erro ao processar check-in:', error);
      setError(error.response?.data?.error || 'Erro ao processar check-in');
      const audio = new Audio('/sounds/error.mp3');
      audio.play();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCheckIn = () => {
    setPreviewData(null);
    if (activeTab === 0 && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  };

  const handleError = (err) => {
    console.error('Erro na câmera:', err);
    setError('Erro ao acessar a câmera. Verifique as permissões.');
  };

  const toggleCamera = () => {
    setScanning(!scanning);
    setError('');
    setSuccess('');
  };

  const toggleCameraFacing = () => {
    setUseFrontCamera(!useFrontCamera);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (scanning) {
      setScanning(false);
    }
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
    setPreviewData(null);
    setError('');
    setSuccess('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Check-in de Participantes
        </Typography>

        <Grid container spacing={4}>
          {/* Seletor de Eventos */}
          <Grid item xs={12}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Selecione o Evento</InputLabel>
              <Select
                value={selectedEvent}
                onChange={handleEventChange}
                label="Selecione o Evento"
              >
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title} - {dayjs(event.date).format('DD/MM/YYYY HH:mm')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Estatísticas */}
          {selectedEvent && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Estatísticas do Check-in
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total de Inscritos"
                  value={stats.total}
                  icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Check-ins Realizados"
                  value={stats.checked}
                  icon={<CheckCircleIcon sx={{ color: 'success.main' }} />}
                  color="success"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Faltam Chegar"
                  value={stats.total - stats.checked}
                  icon={<AccessTimeIcon sx={{ color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Check-ins na Última Hora"
                  value={stats.lastHourCheckins}
                  icon={<TrendingUpIcon sx={{ color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                      <CircularProgress
                        variant="determinate"
                        value={(stats.checked / stats.total) * 100}
                        size={120}
                        thickness={4}
                        sx={{ color: 'success.main' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h4" component="div">
                          {Math.round((stats.checked / stats.total) * 100)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Progresso
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Taxa média de check-in: {stats.checkInRate} pessoas/hora
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Leitor de Código */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  centered
                  sx={{ mb: 3 }}
                >
                  <Tab 
                    icon={<ScannerIcon />} 
                    label="Leitor Físico" 
                    sx={{ textTransform: 'none' }}
                  />
                  <Tab 
                    icon={<CameraIcon />} 
                    label="Câmera" 
                    sx={{ textTransform: 'none' }}
                  />
                </Tabs>

                {activeTab === 0 && (
                  <Box component="form" onSubmit={handleManualSubmit}>
                    <TextField
                      fullWidth
                      inputRef={manualInputRef}
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Aguardando leitura do código..."
                      variant="outlined"
                      autoFocus
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Posicione o leitor sobre o código QR ou código de barras
                    </Typography>
                  </Box>
                )}

                {activeTab === 1 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useFrontCamera}
                            onChange={toggleCameraFacing}
                            disabled={!scanning}
                          />
                        }
                        label="Câmera Frontal"
                      />
                      <Button
                        variant={scanning ? "outlined" : "contained"}
                        onClick={toggleCamera}
                        startIcon={scanning ? <CloseIcon /> : <QrCodeIcon />}
                        sx={{ ml: 2 }}
                      >
                        {scanning ? 'Parar Leitor' : 'Iniciar Leitor'}
                      </Button>
                    </Box>

                    {scanning && (
                      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                        <QrReader
                          constraints={{
                            facingMode: useFrontCamera ? 'user' : 'environment'
                          }}
                          onResult={handleScan}
                          onError={handleError}
                          style={{ width: '100%' }}
                        />
                      </Box>
                    )}
                  </>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Último Check-in */}
          {lastCheckin && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Último Check-in
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Nome:</strong> {lastCheckin.name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>E-mail:</strong> {lastCheckin.email}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Ticket:</strong> #{lastCheckin.ticket_code}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Evento:</strong> {lastCheckin.event_title}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Lote:</strong> {lastCheckin.lot_name}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Check-in:</strong> {dayjs(lastCheckin.checkin_time).format('DD/MM/YYYY HH:mm:ss')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Preview do Check-in */}
          {previewData && (
            <CheckInPreview
              data={previewData}
              onConfirm={handleConfirmCheckIn}
              onCancel={handleCancelCheckIn}
            />
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

const MemoizedCheckIn = React.memo(CheckIn);
export default MemoizedCheckIn; 