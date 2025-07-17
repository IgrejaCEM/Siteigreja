import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Button, TextField, IconButton, MenuItem, Paper, Grid, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const CAMPOS_PADRAO = [
  { label: 'Nome completo', field: 'nome', type: 'text', required: true },
  { label: 'E-mail do responsável', field: 'email', type: 'email', required: true },
  { label: 'Telefone/celular', field: 'telefone', type: 'text', required: false },
  { label: 'Data de nascimento', field: 'nascimento', type: 'date', required: false },
  { label: 'Sexo', field: 'sexo', type: 'select', options: ['Masculino', 'Feminino'], required: false },
  { label: 'Cidade', field: 'cidade', type: 'text', required: false },
  { label: 'Estado/Região', field: 'estado', type: 'text', required: false },
  { label: 'País', field: 'pais', type: 'text', required: false },
  { label: 'Aceite de termos', field: 'termos', type: 'checkbox', required: true },
  { label: 'Consentimento para uso de imagem', field: 'imagem', type: 'checkbox', required: false },
  { label: 'Confirmação de leitura das regras', field: 'regras', type: 'checkbox', required: false },
];

const TIPOS_EXTRAS = [
  { label: 'Texto', value: 'text' },
  { label: 'Texto Longo', value: 'textarea' },
  { label: 'Seleção Única', value: 'select' },
  { label: 'Múltipla Escolha', value: 'multiselect' },
  { label: 'Número', value: 'number' },
  { label: 'Data', value: 'date' },
  { label: 'Checkbox', value: 'checkbox' },
];

export default function FormBuilder({ value, onChange }) {
  const [camposPadrao, setCamposPadrao] = useState(
    CAMPOS_PADRAO.map(c => ({ ...c, enabled: c.required || false }))
  );
  const [extras, setExtras] = useState([]);
  const [novoExtra, setNovoExtra] = useState({ label: '', type: 'text', required: false, options: '' });

  // Atualiza o formulário final sempre que campos mudam
  const atualizarForm = (campos, extras) => {
    const form = [
      ...campos.filter(c => c.enabled),
      ...extras
    ];
    onChange && onChange(form);
  };

  // Manipulação dos campos padrão
  const handlePadraoToggle = idx => {
    const novos = [...camposPadrao];
    novos[idx].enabled = !novos[idx].enabled;
    setCamposPadrao(novos);
    atualizarForm(novos, extras);
  };
  const handlePadraoObrigatorio = idx => {
    const novos = [...camposPadrao];
    novos[idx].required = !novos[idx].required;
    setCamposPadrao(novos);
    atualizarForm(novos, extras);
  };

  // Manipulação dos campos extras
  const handleAddExtra = () => {
    if (!novoExtra.label.trim()) return;
    let extra = { ...novoExtra };
    if ((extra.type === 'select' || extra.type === 'multiselect') && typeof extra.options === 'string') {
      extra.options = extra.options.split(',').map(o => o.trim()).filter(Boolean);
    }
    setExtras(arr => {
      const novos = [...arr, extra];
      atualizarForm(camposPadrao, novos);
      return novos;
    });
    setNovoExtra({ label: '', type: 'text', required: false, options: '' });
  };
  const handleRemoveExtra = idx => {
    setExtras(arr => {
      const novos = arr.filter((_, i) => i !== idx);
      atualizarForm(camposPadrao, novos);
      return novos;
    });
  };
  const handleExtraChange = (field, value) => {
    setNovoExtra(e => ({ ...e, [field]: value }));
  };

  // Atualiza preview ao montar
  React.useEffect(() => {
    atualizarForm(camposPadrao, extras);
    // eslint-disable-next-line
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Campos Padrão</Typography>
      <Grid container spacing={2}>
        {camposPadrao.map((c, idx) => (
          <Grid item xs={12} sm={6} md={4} key={c.field}>
            <Paper sx={{ p: 2, mb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={c.enabled} onChange={() => handlePadraoToggle(idx)} />}
                label={c.label}
              />
              <FormControlLabel
                control={<Checkbox checked={c.required} onChange={() => handlePadraoObrigatorio(idx)} disabled={!c.enabled} />}
                label="Obrigatório"
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>Adicionar Campo Extra</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField label="Título do Campo" value={novoExtra.label} onChange={e => handleExtraChange('label', e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField select label="Tipo" value={novoExtra.type} onChange={e => handleExtraChange('type', e.target.value)} fullWidth>
            {TIPOS_EXTRAS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
        </Grid>
        {(novoExtra.type === 'select' || novoExtra.type === 'multiselect') && (
          <Grid item xs={12} sm={3}>
            <TextField label="Alternativas (separadas por vírgula)" value={novoExtra.options} onChange={e => handleExtraChange('options', e.target.value)} fullWidth />
          </Grid>
        )}
        <Grid item xs={12} sm={1}>
          <FormControlLabel control={<Checkbox checked={novoExtra.required} onChange={e => handleExtraChange('required', e.target.checked)} />} label="Obrig." />
        </Grid>
        <Grid item xs={12} sm={1}>
          <IconButton color="primary" onClick={handleAddExtra}><AddCircleIcon /></IconButton>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Campos Extras Adicionados</Typography>
        {extras.map((ex, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{ex.label} ({TIPOS_EXTRAS.find(t => t.value === ex.type)?.label || ex.type}) {ex.required ? '[Obrigatório]' : ''}</Typography>
            <IconButton color="error" onClick={() => handleRemoveExtra(idx)}><RemoveCircleIcon /></IconButton>
          </Paper>
        ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>Preview do Formulário</Typography>
      <Paper sx={{ p: 3, background: '#f8fafc' }}>
        {[...camposPadrao.filter(c => c.enabled), ...extras].map((c, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>{c.label}{c.required ? ' *' : ''}</Typography>
            {c.type === 'text' && <TextField fullWidth size="small" />}
            {c.type === 'email' && <TextField fullWidth size="small" type="email" />}
            {c.type === 'number' && <TextField fullWidth size="small" type="number" />}
            {c.type === 'date' && <TextField fullWidth size="small" type="date" />}
            {c.type === 'textarea' && <TextField fullWidth size="small" multiline rows={3} />}
            {c.type === 'select' && <TextField select fullWidth size="small">{(c.options||[]).map((opt,i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}</TextField>}
            {c.type === 'multiselect' && <TextField select fullWidth size="small" SelectProps={{ multiple: true }}>{(c.options||[]).map((opt,i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}</TextField>}
            {c.type === 'checkbox' && <FormControlLabel control={<Checkbox />} label="" />}
          </Box>
        ))}
        {([...camposPadrao.filter(c => c.enabled), ...extras].length === 0) && <Typography color="text.secondary">Nenhum campo selecionado.</Typography>}
      </Paper>
    </Box>
  );
} 