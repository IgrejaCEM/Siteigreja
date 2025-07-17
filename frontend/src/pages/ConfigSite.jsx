import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, Alert, IconButton, List, ListItem, ListItemText, Divider, Paper, Dialog, DialogTitle, DialogContent, DialogActions, ListItemIcon } from '@mui/material';
import { Add, Delete, Edit, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import ModernHeader from '../components/ModernHeader';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Rnd } from 'react-rnd';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const blocosDisponiveis = [
  { type: 'text', label: 'Texto' },
  { type: 'image', label: 'Imagem' },
  { type: 'button', label: 'Botão' },
];

function Bloco({ bloco, onChange }) {
  switch (bloco.type) {
    case 'text':
      return <TextField fullWidth multiline value={bloco.content || ''} onChange={e => onChange({ ...bloco, content: e.target.value })} label="Texto" sx={{ mb: 2 }} />;
    case 'image':
      return (
        <Box sx={{ mb: 2 }}>
          {bloco.url ? <img src={bloco.url} alt="" style={{ maxWidth: 200, display: 'block', marginBottom: 8 }} /> : null}
          <input type="file" accept="image/*" onChange={e => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = ev => onChange({ ...bloco, url: ev.target.result });
              reader.readAsDataURL(file);
            }
          }} />
        </Box>
      );
    case 'button':
      return <TextField fullWidth value={bloco.label || ''} onChange={e => onChange({ ...bloco, label: e.target.value })} label="Texto do Botão" sx={{ mb: 2 }} />;
    default:
      return null;
  }
}

const componentesHome = [
  { id: 'header', nome: 'Cabeçalho', componente: <ModernHeader /> },
  { id: 'hero', nome: 'Hero Section', componente: <HeroSection /> },
  { id: 'eventos', nome: 'Eventos', componente: <EventosHome /> },
  { id: 'oque-e', nome: 'O Que É', componente: <OqueEHome /> },
  { id: 'faq', nome: 'FAQ', componente: <FAQHome /> },
  { id: 'localizacao', nome: 'Localização', componente: <LocalizacaoHome /> },
  { id: 'whatsapp', nome: 'WhatsApp', componente: <WhatsAppButton /> },
  { id: 'footer', nome: 'Rodapé', componente: <Footer /> },
];

function EventosHome() {
  // Exemplo simplificado, pode ser adaptado para edição
  return <Box sx={{ mb: 8 }}><Typography variant="h3">PRÓXIMOS EVENTOS</Typography></Box>;
}
function OqueEHome() {
  return <Box sx={{ mb: 8 }}><Typography variant="h3">O QUE É</Typography></Box>;
}
function FAQHome() {
  return <Box sx={{ mb: 8 }}><Typography variant="h4">FAQ</Typography></Box>;
}
function LocalizacaoHome() {
  return <Box sx={{ mb: 8 }}><Typography variant="h5">Local do Evento</Typography></Box>;
}

function HeroEditPanel({ value, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
      <Typography variant="subtitle1">Texto do Hero</Typography>
      <ReactQuill theme="snow" value={value.texto || ''} onChange={val => onChange({ ...value, texto: val })} />
      <TextField label="Fonte" value={value.fonte || ''} onChange={e => onChange({ ...value, fonte: e.target.value })} />
      <TextField label="Cor do texto" type="color" value={value.cor || '#222222'} onChange={e => onChange({ ...value, cor: e.target.value })} />
      <TextField label="Tamanho da fonte (px)" type="number" value={value.tamanho || 32} onChange={e => onChange({ ...value, tamanho: e.target.value })} />
      <TextField label="Alinhamento" select value={value.alinhamento || 'center'} onChange={e => onChange({ ...value, alinhamento: e.target.value })} SelectProps={{ native: true }}>
        <option value="left">Esquerda</option>
        <option value="center">Centro</option>
        <option value="right">Direita</option>
      </TextField>
      <Box>
        <Typography variant="subtitle2">Imagem de Fundo</Typography>
        <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = ev => onChange({ ...value, bg: ev.target.result });
            reader.readAsDataURL(file);
          }
        }} />
        {value.bg && <img src={value.bg} alt="bg" style={{ width: '100%', marginTop: 8, borderRadius: 8 }} />}
      </Box>
    </Box>
  );
}

export default function ConfigSite() {
  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [componentes, setComponentes] = useState(componentesHome);
  const [editando, setEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } });
        const obj = {};
        res.data.forEach(s => { obj[s.key] = s.value; });
        setSettings(obj);
      } catch (e) {
        setMsg('Erro ao carregar configurações.');
      }
      setLoadingSettings(false);
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key, value, type = 'string') => {
    setSaving(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/settings`, { key, value, type }, { headers: { Authorization: `Bearer ${token}` } });
      setSettings(s => ({ ...s, [key]: value }));
      setMsg('Configuração salva!');
    } catch (e) {
      setMsg('Erro ao salvar configuração.');
    }
    setSaving(false);
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-configuracoes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(componentes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setComponentes(items);
  };

  const handleEditar = (id) => {
    const comp = componentes.find(c => c.id === id);
    setEditando(id);
    setDadosEdicao(comp?.dados || {});
  };

  const handleSalvarEdicao = () => {
    setComponentes(componentes.map(c =>
      c.id === editando ? { ...c, dados: dadosEdicao } : c
    ));
    setEditando(null);
  };

  const renderFormEdicao = (id) => {
    switch (id) {
      case 'header':
        return (
          <TextField label="Título do Cabeçalho" fullWidth value={dadosEdicao.titulo || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, titulo: e.target.value })} sx={{ mb: 2 }} />
        );
      case 'hero':
        return <HeroEditPanel value={dadosEdicao} onChange={setDadosEdicao} />;
      case 'eventos':
        return (
          <TextField label="Título da Seção de Eventos" fullWidth value={dadosEdicao.titulo || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, titulo: e.target.value })} sx={{ mb: 2 }} />
        );
      case 'oque-e':
        return (
          <TextField label="Texto O Que É" fullWidth value={dadosEdicao.texto || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, texto: e.target.value })} sx={{ mb: 2 }} />
        );
      case 'faq':
        return (
          <TextField label="Perguntas FAQ (separe por ponto e vírgula)" fullWidth value={dadosEdicao.faq || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, faq: e.target.value })} sx={{ mb: 2 }} />
        );
      case 'localizacao':
        return (
          <TextField label="Endereço" fullWidth value={dadosEdicao.endereco || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, endereco: e.target.value })} sx={{ mb: 2 }} />
        );
      case 'whatsapp':
        return (
          <TextField label="Número do WhatsApp" fullWidth value={dadosEdicao.numero || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, numero: e.target.value })} sx={{ mb: 2 }} />
        );
      case 'footer':
        return (
          <TextField label="Texto do Rodapé" fullWidth value={dadosEdicao.texto || ''} onChange={e => setDadosEdicao({ ...dadosEdicao, texto: e.target.value })} sx={{ mb: 2 }} />
        );
      default:
        return null;
    }
  };

  if (loadingSettings) return <Box sx={{ p: 4 }}>Carregando configurações...</Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Editor Visual da Home</Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="componentes-home">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {componentes.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {prov => (
                    <Box ref={prov.innerRef} {...prov.draggableProps} sx={{ mb: 3, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fafafa', p: 2 }}>
                      <Box {...prov.dragHandleProps} sx={{ mb: 1, cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">{item.nome}</Typography>
                        <Button size="small" variant="outlined" onClick={() => handleEditar(item.id)} style={{ marginLeft: 16, minWidth: 80 }}>Editar</Button>
                      </Box>
                      <Box>
                        {item.id === 'hero' && item.dados ? (
                          <Rnd
                            default={{ x: 0, y: 0, width: 600, height: 300 }}
                            bounds="parent"
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: item.dados.alinhamento || 'center',
                                background: item.dados.bg ? `url(${item.dados.bg}) center/cover no-repeat` : '#eee',
                                color: item.dados.cor || '#222',
                                fontFamily: item.dados.fonte || 'inherit',
                                fontSize: item.dados.tamanho ? `${item.dados.tamanho}px` : '32px',
                                borderRadius: 4,
                                overflow: 'hidden',
                                p: 2,
                              }}
                              dangerouslySetInnerHTML={{ __html: item.dados.texto || '<b>Edite o texto do Hero</b>' }}
                            />
                          </Rnd>
                        ) : (
                          item.componente
                        )}
                      </Box>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Dialog open={!!editando} onClose={() => setEditando(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Seção</DialogTitle>
        <DialogContent>
          {renderFormEdicao(editando)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button onClick={handleSalvarEdicao} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 