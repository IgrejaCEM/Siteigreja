import { useState } from 'react';
import { Box, Button, Typography, Drawer, TextField, IconButton, Divider } from '@mui/material';
import { Rnd } from 'react-rnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const blocosDisponiveis = [
  { type: 'text', label: 'Texto' },
  { type: 'image', label: 'Imagem' },
  { type: 'button', label: 'Botão' },
];

const defaultStyles = {
  text: { fontSize: 32, color: '#222', fontFamily: 'Arial', fontWeight: 400, textAlign: 'center' },
  image: { width: 300, height: 200 },
  button: { fontSize: 20, color: '#fff', background: '#1976d2', border: 'none', borderRadius: 8, padding: '12px 32px' },
};

export default function SiteBuilder() {
  const [blocos, setBlocos] = useState([]);
  const [selected, setSelected] = useState(null);

  const addBloco = (type) => {
    const id = `bloco-${Date.now()}`;
    let content = '';
    if (type === 'text') content = '<b>Edite seu texto</b>';
    if (type === 'image') content = '';
    if (type === 'button') content = 'Clique aqui';
    setBlocos([...blocos, {
      id,
      type,
      content,
      style: { ...defaultStyles[type] },
      position: { x: 100, y: 100, width: type === 'image' ? 300 : 400, height: type === 'image' ? 200 : 80 },
    }]);
    setSelected(id);
  };

  const updateBloco = (id, changes) => {
    setBlocos(blocos.map(b => b.id === id ? { ...b, ...changes } : b));
  };

  const updateBlocoStyle = (id, style) => {
    setBlocos(blocos.map(b => b.id === id ? { ...b, style: { ...b.style, ...style } } : b));
  };

  const removeBloco = (id) => {
    setBlocos(blocos.filter(b => b.id !== id));
    if (selected === id) setSelected(null);
  };

  const renderBloco = (bloco) => {
    switch (bloco.type) {
      case 'text':
        return (
          <Box
            sx={{ ...bloco.style, width: '100%', height: '100%', outline: selected === bloco.id ? '2px solid #1976d2' : 'none', p: 1, cursor: 'pointer', background: 'transparent' }}
            onClick={e => { e.stopPropagation(); setSelected(bloco.id); }}
            dangerouslySetInnerHTML={{ __html: bloco.content }}
          />
        );
      case 'image':
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: 2, cursor: 'pointer', outline: selected === bloco.id ? '2px solid #1976d2' : 'none' }} onClick={e => { e.stopPropagation(); setSelected(bloco.id); }}>
            {bloco.content ? <img src={bloco.content} alt="img" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} /> : <Typography color="text.secondary">Clique para adicionar imagem</Typography>}
          </Box>
        );
      case 'button':
        return (
          <Button variant="contained" sx={{ ...bloco.style, width: '100%', height: '100%', outline: selected === bloco.id ? '2px solid #1976d2' : 'none' }} onClick={e => { e.stopPropagation(); setSelected(bloco.id); }}>{bloco.content}</Button>
        );
      default:
        return null;
    }
  };

  const renderPainelPropriedades = () => {
    const bloco = blocos.find(b => b.id === selected);
    if (!bloco) return null;
    return (
      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}>
        <Box sx={{ width: 340, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Propriedades</Typography>
            <IconButton color="error" onClick={() => removeBloco(bloco.id)}><DeleteIcon /></IconButton>
          </Box>
          <Divider />
          {bloco.type === 'text' && (
            <>
              <Typography variant="subtitle2">Texto</Typography>
              <ReactQuill theme="snow" value={bloco.content} onChange={val => updateBloco(bloco.id, { content: val })} />
              <TextField label="Fonte" value={bloco.style.fontFamily} onChange={e => updateBlocoStyle(bloco.id, { fontFamily: e.target.value })} />
              <TextField label="Cor" type="color" value={bloco.style.color} onChange={e => updateBlocoStyle(bloco.id, { color: e.target.value })} />
              <TextField label="Tamanho" type="number" value={bloco.style.fontSize} onChange={e => updateBlocoStyle(bloco.id, { fontSize: Number(e.target.value) })} />
              <TextField label="Peso" type="number" value={bloco.style.fontWeight} onChange={e => updateBlocoStyle(bloco.id, { fontWeight: Number(e.target.value) })} />
              <TextField label="Alinhamento" select value={bloco.style.textAlign} onChange={e => updateBlocoStyle(bloco.id, { textAlign: e.target.value })} SelectProps={{ native: true }}>
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </TextField>
            </>
          )}
          {bloco.type === 'image' && (
            <>
              <Typography variant="subtitle2">Imagem</Typography>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => updateBloco(bloco.id, { content: ev.target.result });
                  reader.readAsDataURL(file);
                }
              }} />
              <TextField label="Largura" type="number" value={bloco.position.width} onChange={e => updateBloco(bloco.id, { position: { ...bloco.position, width: Number(e.target.value) } })} />
              <TextField label="Altura" type="number" value={bloco.position.height} onChange={e => updateBloco(bloco.id, { position: { ...bloco.position, height: Number(e.target.value) } })} />
            </>
          )}
          {bloco.type === 'button' && (
            <>
              <Typography variant="subtitle2">Texto do Botão</Typography>
              <TextField value={bloco.content} onChange={e => updateBloco(bloco.id, { content: e.target.value })} />
              <TextField label="Cor do Texto" type="color" value={bloco.style.color} onChange={e => updateBlocoStyle(bloco.id, { color: e.target.value })} />
              <TextField label="Cor de Fundo" type="color" value={bloco.style.background} onChange={e => updateBlocoStyle(bloco.id, { background: e.target.value })} />
              <TextField label="Tamanho" type="number" value={bloco.style.fontSize} onChange={e => updateBlocoStyle(bloco.id, { fontSize: Number(e.target.value) })} />
              <TextField label="Raio da Borda" type="number" value={bloco.style.borderRadius} onChange={e => updateBlocoStyle(bloco.id, { borderRadius: Number(e.target.value) })} />
            </>
          )}
        </Box>
      </Drawer>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Barra lateral de blocos */}
      <Box sx={{ width: 120, bgcolor: '#fff', p: 2, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Blocos</Typography>
        {blocosDisponiveis.map(b => (
          <Button key={b.type} variant="outlined" startIcon={<AddIcon />} onClick={() => addBloco(b.type)}>{b.label}</Button>
        ))}
      </Box>
      {/* Área central de edição visual */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: '#e9e9e9', overflow: 'auto' }} onClick={() => setSelected(null)}>
        {blocos.map(bloco => (
          <Rnd
            key={bloco.id}
            size={{ width: bloco.position.width, height: bloco.position.height }}
            position={{ x: bloco.position.x, y: bloco.position.y }}
            onDragStop={(e, d) => updateBloco(bloco.id, { position: { ...bloco.position, x: d.x, y: d.y } })}
            onResizeStop={(e, direction, ref, delta, position) => updateBloco(bloco.id, {
              position: {
                ...bloco.position,
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: position.x,
                y: position.y,
              }
            })}
            bounds="parent"
            style={{ zIndex: selected === bloco.id ? 10 : 1 }}
            onClick={e => { e.stopPropagation(); setSelected(bloco.id); }}
          >
            {renderBloco(bloco)}
          </Rnd>
        ))}
      </Box>
      {/* Painel de propriedades */}
      {renderPainelPropriedades()}
    </Box>
  );
} 