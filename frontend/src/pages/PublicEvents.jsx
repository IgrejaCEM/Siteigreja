import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardContent, CardActions, Button, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions as MuiDialogActions, Alert, Box, Paper, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Divider, TextField, CircularProgress, Container, IconButton, Stepper, Step, StepLabel, MenuItem, Checkbox, Avatar
} from "@mui/material";
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import "../PublicEvents.css";
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

const steps = ['Formulário de Inscrição', 'Pagamento', 'Confirmação'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function PublicEvents() {
  const { slug } = useParams();
  const [evento, setEvento] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState([{}]);
  const [message, setMessage] = useState("");
  const [selectedLote, setSelectedLote] = useState(null);
  const [paymentType, setPaymentType] = useState('pix');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticketIds, setTicketIds] = useState([]);
  const [cupom, setCupom] = useState("");
  const [cupomStatus, setCupomStatus] = useState(null); // {success:bool, msg:string, desconto:number}
  const [cupomAplicado, setCupomAplicado] = useState(null); // {desconto:number, valorOriginal:number, valorComDesconto:number}

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/events/${slug}`)
      .then(res => setEvento(res.data))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    document.body.classList.add('event-dark');
    document.getElementById('root')?.classList.add('event-dark');
    document.documentElement.classList.add('event-dark');
    return () => {
      document.body.classList.remove('event-dark');
      document.getElementById('root')?.classList.remove('event-dark');
      document.documentElement.classList.remove('event-dark');
    };
  }, []);

  const handleOpen = (lote) => {
    setSelectedLote(lote);
    setOpen(true);
    setMessage("");
    setActiveStep(0);
    setPaymentConfirmed(false);
    const initialFormData = {};
    if (Array.isArray(evento.registration_form)) {
      evento.registration_form.forEach(field => {
        initialFormData[field.field] = '';
      });
    }
    setFormData([initialFormData]);
    setTicketIds([]);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    setFormData([{}]);
    setSelectedLote(null);
    setPaymentConfirmed(false);
    setTicketIds([]);
    setCupom("");
    setCupomStatus(null);
    setCupomAplicado(null);
  };

  const handleNext = () => {
    const hasRequiredFields = formData.every(data => {
      return evento.registration_form.every(field => {
        if (field.required) {
          return data[field.field] !== undefined && data[field.field] !== '';
        }
        return true;
      });
    });

    if (!hasRequiredFields) {
      setMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    if (activeStep === 1) {
      setCupom("");
      setCupomStatus(null);
      setCupomAplicado(null);
    }
  };

  const handleFormChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], [field]: value };
    setFormData(newFormData);
  };

  const addParticipant = () => {
    const initialFormData = {};
    if (Array.isArray(evento.registration_form)) {
      evento.registration_form.forEach(field => {
        initialFormData[field.field] = '';
      });
    }
    setFormData([...formData, initialFormData]);
  };

  const removeParticipant = (index) => {
    if (formData.length > 1) {
      const newFormData = formData.filter((_, i) => i !== index);
      setFormData(newFormData);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      let userId = null;
      const token = localStorage.getItem("token");
      if (!token) {
        const userRes = await axios.post(`${API_BASE_URL}/register`, {
          nome: formData[0].nome,
          email: formData[0].email,
          senha: "123456",
          is_admin: false
        });
        userId = userRes.data.id;
      } else {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      }

      // Gerar ticket IDs únicos para cada participante
      const newTicketIds = formData.map(() => `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      setTicketIds(newTicketIds);

      // Calcular valor final (com ou sem desconto)
      const valorOriginal = selectedLote ? selectedLote.price * formData.length : 0;
      const valorFinal = cupomAplicado ? cupomAplicado.valorComDesconto : valorOriginal;

      // Registrar cada participante - MODO FAKE: pagamento sempre aprovado
      await Promise.all(formData.map(async (data, index) => {
        const formDataWithTicket = {
          ...data,
          ticket_id: newTicketIds[index],
          forma_pagamento: paymentType,
          cupom_aplicado: cupomAplicado ? cupom : null,
          desconto_aplicado: cupomAplicado ? cupomAplicado.desconto : 0,
          valor_original: valorOriginal,
          valor_final: valorFinal
        };

        return axios.post(`${API_BASE_URL}/register-event`, {
          user_id: userId,
          event_id: evento.id,
          lote_id: selectedLote?.id,
          form_data: formDataWithTicket
        });
      }));

      setPaymentConfirmed(true);
      setActiveStep(2);
      setMessage("Inscrições realizadas com sucesso! (Pagamento simulado - sempre aprovado)");
    } catch (err) {
      setMessage("Erro ao realizar inscrições. Tente novamente.");
    }
  };

  const handleExportRegistrations = async (eventId, eventTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/registrations/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participantes-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar inscrições:', error);
      setMessage('Erro ao exportar inscrições. Tente novamente.');
    }
  };

  const handleApplyCupom = async () => {
    setCupomStatus(null);
    if (!cupom) {
      setCupomStatus({ success: false, msg: "Digite o código do cupom." });
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/aplicar-cupom`, { code: cupom, event_id: evento?.id });
      const desconto = res.data.discount;
      const valorOriginal = selectedLote ? selectedLote.price * formData.length : 0;
      const valorComDesconto = valorOriginal * (1 - desconto / 100);
      setCupomAplicado({ desconto, valorOriginal, valorComDesconto });
      setCupomStatus({ success: true, msg: `Cupom aplicado! Desconto de ${desconto}%`, desconto });
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao validar cupom.";
      setCupomStatus({ success: false, msg });
      setCupomAplicado(null);
    }
  };

  if (loading) return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <img src="https://s3.us-east-1.wasabisys.com/wasabi.e-inscricao.tech/ei/output-onlinegiftools.gif" alt="Carregando..." style={{ width: 64, height: 64 }} />
    </Box>
  );
  if (!evento) return <div>Evento não encontrado.</div>;

  const locationToUse = evento.location || 'Local a ser definido';

  const registrationFields = (() => {
    if (Array.isArray(evento.registration_form)) return evento.registration_form;
    if (typeof evento.registration_form === 'string') {
      try { return JSON.parse(evento.registration_form); } catch { return []; }
    }
    return [];
  })();

  const renderFormField = (field, pIndex) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <TextField
            label={field.label}
            type={field.type}
            fullWidth
            required={field.required}
            value={formData[pIndex]?.[field.field] || ''}
            onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
            sx={{ mb: 2 }}
          />
        );
      case 'date':
        return (
          <TextField
            label={field.label}
            type="date"
            fullWidth
            required={field.required}
            value={formData[pIndex]?.[field.field] || ''}
            onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        );
      case 'select':
        return (
          <TextField
            select
            label={field.label}
            fullWidth
            required={field.required}
            value={formData[pIndex]?.[field.field] || ''}
            onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
            sx={{ mb: 2 }}
          >
            {(field.options || []).map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        );
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!formData[pIndex]?.[field.field]}
                onChange={e => handleFormChange(pIndex, field.field, e.target.checked)}
              />
            }
            label={field.label}
            sx={{ mb: 2 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', py: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Banner grande centralizado, ocupando 100vw */}
      <div className="banner-evento">
        <img
          src={(evento.banner_evento || evento.banner || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjVmNWY1Ii8+CiAgPHRleHQgeD0iNjAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhbm5lciBkbyBFdmVudG88L3RleHQ+Cjwvc3ZnPg==').startsWith('http')
            ? (evento.banner_evento || evento.banner || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjVmNWY1Ii8+CiAgPHRleHQgeD0iNjAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhbm5lciBkbyBFdmVudG88L3RleHQ+Cjwvc3ZnPg==')
            : `${API_BASE_URL}${evento.banner_evento || evento.banner || '/uploads/banners/default.jpg'}`}
          alt="Banner"
        />
      </div>
      <div className="event-content-container">
        <div className="event-info-block">
          <h1>{evento.title}</h1>
          <div className="event-info-row">
            <div><CalendarMonthIcon /> {new Date(evento.date).toLocaleDateString('pt-BR')}</div>
            <div><PlaceIcon /> {locationToUse}</div>
          </div>
        </div>
        <div className="event-details-row">
          <div className="event-card description-card">
            <h2>Descrição do evento</h2>
            <p>{evento.description}</p>
          </div>
          <div className="event-card tickets-card">
            <h2>Ingressos</h2>
            {(evento.lots || []).map(lote => (
              <div className="ticket-lot" key={lote.id}>
                <div className="ticket-lot-title">{lote.name}</div>
                <div className="ticket-lot-date">De {new Date(lote.start_date).toLocaleDateString('pt-BR')} até {new Date(lote.end_date).toLocaleDateString('pt-BR')}</div>
                <div className="ticket-lot-price">R$ {lote.price}</div>
                <button className="ticket-lot-btn" onClick={() => handleOpen(lote)}>Inscrever-se</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <WhatsAppButton />
      <Footer />
      {/* Modal de inscrição */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Inscrição no Evento</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              {formData.map((data, pIndex) => (
                <Paper key={pIndex} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9', borderRadius: 2, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{pIndex + 1}</Avatar>
                    <Typography variant="subtitle1" fontWeight={700}>Participante {pIndex + 1}</Typography>
                    {formData.length > 1 && (
                      <IconButton size="small" color="error" sx={{ ml: 'auto' }} onClick={() => removeParticipant(pIndex)}>
                        <RemoveCircleIcon />
                      </IconButton>
                    )}
                  </Box>
                  {registrationFields.length === 0 && (
                    <Alert severity="info">Nenhum campo de formulário configurado para este evento.</Alert>
                  )}
                  {registrationFields.map((field, idx) => (
                    <Box key={idx}>
                      {field.type === 'text' && (
                        <TextField
                          label={field.label}
                          fullWidth
                          required={field.required}
                          value={formData[pIndex]?.[field.field] || ''}
                          onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      )}
                      {field.type === 'email' && (
                        <TextField
                          label={field.label}
                          type="email"
                          fullWidth
                          required={field.required}
                          value={formData[pIndex]?.[field.field] || ''}
                          onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      )}
                      {field.type === 'number' && (
                        <TextField
                          label={field.label}
                          type="number"
                          fullWidth
                          required={field.required}
                          value={formData[pIndex]?.[field.field] || ''}
                          onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      )}
                      {field.type === 'date' && (
                        <TextField
                          label={field.label}
                          type="date"
                          fullWidth
                          required={field.required}
                          value={formData[pIndex]?.[field.field] || ''}
                          onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ mb: 2 }}
                        />
                      )}
                      {field.type === 'select' && (
                        <TextField
                          select
                          label={field.label}
                          fullWidth
                          required={field.required}
                          value={formData[pIndex]?.[field.field] || ''}
                          onChange={(e) => handleFormChange(pIndex, field.field, e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          {(field.options || []).map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </TextField>
                      )}
                      {field.type === 'checkbox' && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!formData[pIndex]?.[field.field]}
                              onChange={(e) => handleFormChange(pIndex, field.field, e.target.checked)}
                            />
                          }
                          label={field.label}
                          sx={{ mb: 2 }}
                        />
                      )}
                    </Box>
                  ))}
                </Paper>
              ))}
              <Button startIcon={<AddCircleIcon />} onClick={addParticipant} sx={{ mb: 2 }}>
                Adicionar Participante
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleClose} sx={{ mr: 2 }}>Cancelar</Button>
                <Button variant="contained" color="primary" onClick={handleNext} disabled={registrationFields.length === 0}>Próximo</Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Resumo da Inscrição</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Modo de Teste:</strong> O pagamento está sendo simulado. Todas as inscrições serão automaticamente aprovadas.
                </Typography>
              </Alert>
              <Typography variant="subtitle1" fontWeight={700}>Lote: {selectedLote?.name}</Typography>
              <Typography variant="subtitle2">Valor por participante: R$ {selectedLote?.price}</Typography>
              <Typography variant="subtitle2">Total: R$ {selectedLote ? selectedLote.price * formData.length : 0}</Typography>
              {cupomAplicado && (
                <>
                  <Typography variant="subtitle2" color="success.main">Desconto aplicado: {cupomAplicado.desconto}%</Typography>
                  <Typography variant="subtitle2" color="success.main" fontWeight={700}>Valor com desconto: R$ {cupomAplicado.valorComDesconto.toFixed(2)}</Typography>
                </>
              )}
              <Divider sx={{ my: 2 }} />
              {/* O método de pagamento será escolhido dentro do checkout da AbacatePay após clicar em pagar. */}
              <TextField label="Cupom de Desconto" value={cupom} onChange={e => setCupom(e.target.value)} sx={{ mb: 2 }} fullWidth />
              <Button variant="outlined" onClick={handleApplyCupom} sx={{ mb: 2 }}>Aplicar Cupom</Button>
              {cupomStatus && (
                <Alert severity={cupomStatus.success ? "success" : "error"}>{cupomStatus.msg}</Alert>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleBack} sx={{ mr: 2 }}>Voltar</Button>
                <Button variant="contained" color="primary" onClick={handleConfirmPayment}>Confirmar Inscrição</Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {paymentConfirmed ? (
                <>
                  <Alert severity="success" sx={{ mb: 3 }}>Inscrição realizada com sucesso!</Alert>
                  <Typography variant="h6" sx={{ mb: 2 }}>Confira seu e-mail para mais informações.</Typography>
                  <QRCode value={ticketIds.join(',')} size={128} style={{ margin: '0 auto' }} />
                  <Typography variant="body2" sx={{ mt: 2 }}>Apresente este QR Code no evento.</Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleClose}>Fechar</Button>
                </>
              ) : (
                <Alert severity="error">{message || 'Erro ao processar inscrição.'}</Alert>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 