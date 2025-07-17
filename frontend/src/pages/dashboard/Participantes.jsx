import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import api from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import * as XLSX from 'xlsx';

dayjs.locale('pt-br');

export default function Participantes() {
  const [participantes, setParticipantes] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    withEvents: 0,
    withPhone: 0,
    recentlyAdded: 0
  });
  const [expanded, setExpanded] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [inscricaoDetalhe, setInscricaoDetalhe] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchParticipantes = async () => {
    try {
      setLoading(true);
      setError('');
      const [respPart, respReg] = await Promise.all([
        api.get('/admin/participants'),
        api.get('/admin/registrations')
      ]);
      const participants = respPart.data || [];
      const regs = respReg.data || [];
      // Calcular estatísticas
      const now = dayjs();
      const stats = {
        total: participants.length,
        withEvents: participants.filter(p => p.total_eventos > 0).length,
        withPhone: participants.filter(p => p.phone).length,
        recentlyAdded: participants.filter(p => 
          dayjs(p.created_at).isAfter(now.subtract(30, 'day'))
        ).length
      };
      setParticipantes(participants);
      setRegistrations(regs);
      setStats(stats);
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
      setError(err.response?.data?.error || 'Erro ao carregar participantes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipantes();
  }, []);

  // Buscar eventos para cruzar lotes
  useEffect(() => {
    api.get('/admin/events').then(res => setEventos(res.data || []));
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Novo filtro de evento
  const handleEventChange = (event) => {
    setSelectedEventId(event.target.value);
    setExpanded(null);
    setSelectedRows([]);
  };

  // Seleção de linhas
  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(paginatedParticipantes.flatMap(p => getInscricoesDoParticipante(p).map(i => i.id)));
    } else {
      setSelectedRows([]);
    }
  };
  // Exportação para Excel
  const handleExportExcel = () => {
    // Coletar inscrições filtradas/selecionadas
    let exportList = [];
    paginatedParticipantes.forEach(p => {
      const inscricoes = getInscricoesDoParticipante(p);
      inscricoes.forEach(i => {
        if (selectedRows.length === 0 || selectedRows.includes(i.id)) {
          exportList.push({
            Nome: i.name,
            Email: i.email,
            Telefone: i.phone,
            Evento: i.event_title,
            Lote: i.lot_name || getNomeLote(i) || '-',
            Status: traduzirStatusPagamento(i.payment_status),
            Data: dayjs(i.created_at).format('DD/MM/YYYY HH:mm'),
            CPF: i.cpf || '-',
          });
        }
      });
    });
    if (exportList.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(exportList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participantes');
    XLSX.writeFile(wb, 'participantes.xlsx');
  };

  const filteredParticipantes = participantes.filter(participante => {
    if (!selectedEventId) return true;
    const inscricoes = registrations.filter(r =>
      r.name === participante.name &&
      r.email === participante.email &&
      r.phone === participante.phone &&
      r.event_id === selectedEventId
    );
    return inscricoes.length > 0;
  });

  const paginatedParticipantes = filteredParticipantes
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Função para buscar inscrições do participante
  const getInscricoesDoParticipante = (p) => {
    return registrations.filter(r =>
      (r.name === p.name && r.email === p.email && r.phone === p.phone)
    );
  };

  // Função utilitária para traduzir status de pagamento
  const traduzirStatusPagamento = (status) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  // Função para buscar nome do lote
  const getNomeLote = (inscricao) => {
    const evento = eventos.find(e => e.id === inscricao.event_id);
    if (!evento || !evento.lots) return '-';
    const lote = evento.lots.find(l => l.id === inscricao.lote_id);
    return lote ? lote.name : '-';
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.lighter`,
              borderRadius: 1,
              p: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Participantes
      </Typography>

      {/* Cards de Estatísticas */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total de Participantes</Typography>
                </Box>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Com Eventos</Typography>
                </Box>
                <Typography variant="h4">{stats.withEvents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {((stats.withEvents / stats.total) * 100).toFixed(1)}% do total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Com Telefone</Typography>
                </Box>
                <Typography variant="h4">{stats.withPhone}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {((stats.withPhone / stats.total) * 100).toFixed(1)}% do total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Novos (30 dias)</Typography>
                </Box>
                <Typography variant="h4">{stats.recentlyAdded}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {((stats.recentlyAdded / stats.total) * 100).toFixed(1)}% do total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filtro de Evento */}
      <Box sx={{ mb: 2, maxWidth: 400, display: 'flex', gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="evento-select-label">Filtrar por Evento</InputLabel>
          <Select
            labelId="evento-select-label"
            value={selectedEventId}
            label="Filtrar por Evento"
            onChange={handleEventChange}
          >
            <MenuItem value="">Todos</MenuItem>
            {eventos.map(ev => (
              <MenuItem key={ev.id} value={ev.id}>{ev.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="success" onClick={handleExportExcel} disabled={paginatedParticipantes.length === 0}>
          Exportar para Excel
        </Button>
      </Box>

      {/* Barra de Busca */}
      {participantes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={fetchParticipantes}
            >
              Tentar Novamente
            </IconButton>
          }
        >
          {error}
        </Alert>
      ) : participantes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <PersonIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum Participante Cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ainda não há participantes cadastrados no sistema.
            Os participantes aparecerão aqui quando começarem a se cadastrar nos eventos.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.length > 0 && paginatedParticipantes.every(p => getInscricoesDoParticipante(p).every(i => selectedRows.includes(i.id)))}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Eventos Inscritos</TableCell>
                <TableCell>Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedParticipantes.map((p, idx) => {
                const inscricoes = getInscricoesDoParticipante(p);
                return (
                  <>
                    <TableRow key={p.email + p.phone + idx}>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={inscricoes.every(i => selectedRows.includes(i.id)) && inscricoes.length > 0}
                          onChange={e => inscricoes.forEach(i => handleSelectRow(i.id))}
                        />
                      </TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{inscricoes.length > 0 ? inscricoes.map(i => i.event_title).join(', ') : 'Sem Eventos'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => setExpanded(expanded === idx ? null : idx)}>
                          {expanded === idx ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {expanded === idx && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ bgcolor: '#f9f9f9' }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>Inscrições deste participante:</Typography>
                          {inscricoes.length === 0 ? (
                            <Typography color="text.secondary">Nenhuma inscrição encontrada.</Typography>
                          ) : (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Evento</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Data</TableCell>
                                  <TableCell>Lote</TableCell>
                                  <TableCell>Ações</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {inscricoes.map((i) => (
                                  <TableRow key={i.id}>
                                    <TableCell>{i.event_title}</TableCell>
                                    <TableCell>{traduzirStatusPagamento(i.payment_status)}</TableCell>
                                    <TableCell>{dayjs(i.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                                    <TableCell>{i.lot_name || getNomeLote(i) || '-'}</TableCell>
                                    <TableCell>
                                      <Button size="small" variant="outlined" onClick={() => { setInscricaoDetalhe(i); setOpenModal(true); }}>Ver Detalhes</Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Modal de detalhes da inscrição */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Inscrição</DialogTitle>
        <DialogContent>
          {inscricaoDetalhe && (
            <Box>
              <Typography><b>Evento:</b> {inscricaoDetalhe.event_title}</Typography>
              <Typography><b>Status:</b> {traduzirStatusPagamento(inscricaoDetalhe.payment_status)}</Typography>
              <Typography><b>Data:</b> {dayjs(inscricaoDetalhe.created_at).format('DD/MM/YYYY HH:mm')}</Typography>
              <Typography><b>Lote:</b> {inscricaoDetalhe.lot_name || getNomeLote(inscricaoDetalhe) || '-'}</Typography>
              <Typography><b>Nome:</b> {inscricaoDetalhe.name}</Typography>
              <Typography><b>Email:</b> {inscricaoDetalhe.email}</Typography>
              <Typography><b>Telefone:</b> {inscricaoDetalhe.phone}</Typography>
              <Typography><b>CPF:</b> {inscricaoDetalhe.cpf || '-'}</Typography>
              {/* Adicione outros campos relevantes aqui */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 