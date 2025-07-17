import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Popover,
  TextField,
  Slider,
  Select,
  MenuItem,
  Button,
  Grid,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EmojiPicker from 'emoji-picker-react';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatColorText,
  FormatSize,
  DragIndicator,
  AddPhotoAlternate,
  EmojiEmotions,
  Edit,
  Save,
  Preview,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Add,
  AutoFixHigh,
  Undo,
  Redo,
  LineWeight,
  ViewStream,
  Image
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';

const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Ubuntu',
  'Raleway',
  'Nunito',
  'Dancing Script',
  'Pacifico'
];

const templates = [
  {
    name: 'Moderno',
    elements: [
      {
        id: 'banner',
        type: 'image',
        content: '',
        style: { width: '100%', height: '500px', objectFit: 'cover' }
      },
      {
        id: 'title',
        type: 'text',
        content: 'Título do Evento',
        style: {
          fontSize: '64px',
          fontWeight: 'bold',
          color: '#2C3E50',
          fontFamily: 'Montserrat',
          textAlign: 'center',
          padding: '40px',
          letterSpacing: '2px'
        }
      },
      {
        id: 'divider',
        type: 'divider',
        style: { margin: '20px auto', width: '100px', borderColor: '#3498DB', borderWidth: '3px' }
      },
      {
        id: 'description',
        type: 'text',
        content: 'Descrição do evento',
        style: {
          fontSize: '20px',
          color: '#34495E',
          fontFamily: 'Open Sans',
          textAlign: 'center',
          padding: '20px 15%',
          lineHeight: '1.8'
        }
      }
    ]
  },
  {
    name: 'Clássico',
    elements: [
      {
        id: 'banner',
        type: 'image',
        content: '',
        style: { width: '100%', height: '400px', objectFit: 'cover' }
      },
      {
        id: 'title',
        type: 'text',
        content: 'Título do Evento',
        style: {
          fontSize: '48px',
          fontWeight: 'normal',
          color: '#1A1A1A',
          fontFamily: 'Playfair Display',
          textAlign: 'center',
          padding: '30px',
          fontStyle: 'italic'
        }
      },
      {
        id: 'description',
        type: 'text',
        content: 'Descrição do evento',
        style: {
          fontSize: '18px',
          color: '#4A4A4A',
          fontFamily: 'Merriweather',
          textAlign: 'justify',
          padding: '20px',
          lineHeight: '1.6'
        }
      }
    ]
  }
];

const EventoPreview = ({ eventData, onUpdate }) => {
  const [elements, setElements] = useState([
    {
      id: 'banner',
      type: 'image',
      content: eventData.banner_evento || eventData.banner,
      style: { width: '100%', height: '400px', objectFit: 'cover' }
    },
    {
      id: 'title',
      type: 'text',
      content: eventData.title,
      style: {
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Roboto',
        textAlign: 'center',
        padding: '20px'
      }
    },
    {
      id: 'description',
      type: 'text',
      content: eventData.description,
      style: {
        fontSize: '18px',
        color: '#666',
        fontFamily: 'Arial',
        textAlign: 'left',
        padding: '20px',
        lineHeight: '1.6'
      }
    }
  ]);

  const [selectedElement, setSelectedElement] = useState(null);
  const [styleAnchor, setStyleAnchor] = useState(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState(null);

  const [history, setHistory] = useState([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      onUpdate({ ...eventData, previewElements: history[historyIndex - 1] });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      onUpdate({ ...eventData, previewElements: history[historyIndex + 1] });
    }
  };

  const handleAddElement = (type) => {
    const newElement = {
      id: `${type}_${Date.now()}`,
      type,
      content: type === 'text' ? 'Novo texto' : '',
      style: type === 'text' ? {
        fontSize: '16px',
        color: '#333',
        fontFamily: 'Arial',
        textAlign: 'left',
        padding: '10px'
      } : type === 'image' ? {
        width: '100%',
        height: '300px',
        objectFit: 'cover'
      } : {
        margin: '20px 0',
        borderColor: '#ddd'
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    onUpdate({ ...eventData, previewElements: newElements });
    setAddMenuAnchor(null);
  };

  const handleApplyTemplate = (template) => {
    const newElements = template.elements.map(el => ({
      ...el,
      content: el.type === 'image' ? (eventData.banner_evento || eventData.banner) :
               el.id === 'title' ? eventData.title :
               el.id === 'description' ? eventData.description : el.content
    }));
    
    setElements(newElements);
    addToHistory(newElements);
    onUpdate({ ...eventData, previewElements: newElements });
    setTemplateMenuAnchor(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setElements(items);
    addToHistory(items);
    onUpdate({ ...eventData, previewElements: items });
  };

  const handleStyleChange = (property, value) => {
    if (!selectedElement) return;

    const updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          style: { ...el.style, [property]: value }
        };
      }
      return el;
    });

    setElements(updatedElements);
    addToHistory(updatedElements);
    onUpdate({ ...eventData, previewElements: updatedElements });
  };

  const handleEmojiSelect = (emojiData) => {
    if (!selectedElement || selectedElement.type !== 'text') return;

    const updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          content: el.content + emojiData.emoji
        };
      }
      return el;
    });

    setElements(updatedElements);
    addToHistory(updatedElements);
    onUpdate({ ...eventData, previewElements: updatedElements });
    setEmojiAnchor(null);
  };

  const renderStyleEditor = () => (
    <Popover
      open={Boolean(styleAnchor)}
      anchorEl={styleAnchor}
      onClose={() => setStyleAnchor(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 2, width: 300 }}>
        <Typography variant="subtitle2" gutterBottom>Estilo do Texto</Typography>
        
        <Select
          fullWidth
          size="small"
          value={selectedElement?.style?.fontFamily || 'Arial'}
          onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
          sx={{ mb: 2 }}
        >
          {fontFamilies.map(font => (
            <MenuItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </MenuItem>
          ))}
        </Select>

        <Typography variant="caption">Tamanho da Fonte</Typography>
        <Slider
          value={parseInt(selectedElement?.style?.fontSize) || 16}
          onChange={(_, value) => handleStyleChange('fontSize', `${value}px`)}
          min={12}
          max={72}
          sx={{ mb: 2 }}
        />

        <Typography variant="caption">Espaçamento entre Linhas</Typography>
        <Slider
          value={parseFloat(selectedElement?.style?.lineHeight) || 1.5}
          onChange={(_, value) => handleStyleChange('lineHeight', value)}
          min={1}
          max={3}
          step={0.1}
          sx={{ mb: 2 }}
        />

        <Typography variant="caption">Espaçamento entre Letras</Typography>
        <Slider
          value={parseInt(selectedElement?.style?.letterSpacing) || 0}
          onChange={(_, value) => handleStyleChange('letterSpacing', `${value}px`)}
          min={-2}
          max={10}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" display="block" gutterBottom>
          Alinhamento
        </Typography>
        <ToggleButtonGroup
          value={selectedElement?.style?.textAlign || 'left'}
          exclusive
          onChange={(_, value) => value && handleStyleChange('textAlign', value)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="left">
            <FormatAlignLeft />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenter />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRight />
          </ToggleButton>
          <ToggleButton value="justify">
            <FormatAlignJustify />
          </ToggleButton>
        </ToggleButtonGroup>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item>
            <IconButton size="small" onClick={() => handleStyleChange('fontWeight', selectedElement?.style?.fontWeight === 'bold' ? 'normal' : 'bold')}>
              <FormatBold />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={() => handleStyleChange('fontStyle', selectedElement?.style?.fontStyle === 'italic' ? 'normal' : 'italic')}>
              <FormatItalic />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={() => handleStyleChange('textDecoration', selectedElement?.style?.textDecoration === 'underline' ? 'none' : 'underline')}>
              <FormatUnderlined />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton size="small" onClick={(e) => setColorPickerAnchor(e.currentTarget)}>
              <FormatColorText />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </Popover>
  );

  const renderAddMenu = () => (
    <Menu
      anchorEl={addMenuAnchor}
      open={Boolean(addMenuAnchor)}
      onClose={() => setAddMenuAnchor(null)}
    >
      <MenuItem onClick={() => handleAddElement('text')}>
        <ListItemIcon>
          <ViewStream fontSize="small" />
        </ListItemIcon>
        <ListItemText>Texto</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAddElement('image')}>
        <ListItemIcon>
          <Image fontSize="small" />
        </ListItemIcon>
        <ListItemText>Imagem</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAddElement('divider')}>
        <ListItemIcon>
          <LineWeight fontSize="small" />
        </ListItemIcon>
        <ListItemText>Divisor</ListItemText>
      </MenuItem>
    </Menu>
  );

  const renderTemplateMenu = () => (
    <Menu
      anchorEl={templateMenuAnchor}
      open={Boolean(templateMenuAnchor)}
      onClose={() => setTemplateMenuAnchor(null)}
    >
      {templates.map((template, index) => (
        <MenuItem key={index} onClick={() => handleApplyTemplate(template)}>
          <ListItemText primary={template.name} />
        </MenuItem>
      ))}
    </Menu>
  );

  const renderElement = (element, index) => (
    <Draggable key={element.id} draggableId={element.id} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => setSelectedElement(element)}
          sx={{
            position: 'relative',
            cursor: 'pointer',
            '&:hover': {
              outline: '2px dashed #1976d2'
            },
            ...(selectedElement?.id === element.id && {
              outline: '2px solid #1976d2'
            })
          }}
        >
          <Box {...provided.dragHandleProps} sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
            <DragIndicator />
          </Box>
          
          {element.type === 'image' ? (
            <img
              src={element.content}
              alt=""
              style={element.style}
            />
          ) : element.type === 'divider' ? (
            <Divider style={element.style} />
          ) : (
            <Typography style={element.style}>
              {element.content}
            </Typography>
          )}

          {selectedElement?.id === element.id && (
            <Box sx={{ position: 'absolute', right: 8, bottom: 8, zIndex: 1 }}>
              <IconButton size="small" onClick={(e) => setStyleAnchor(e.currentTarget)}>
                <Edit />
              </IconButton>
              {element.type === 'text' && (
                <IconButton size="small" onClick={(e) => setEmojiAnchor(e.currentTarget)}>
                  <EmojiEmotions />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      )}
    </Draggable>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Preview do Evento</Typography>
          <Box>
            <Tooltip title="Desfazer">
              <IconButton onClick={undo} disabled={historyIndex === 0}>
                <Undo />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refazer">
              <IconButton onClick={redo} disabled={historyIndex === history.length - 1}>
                <Redo />
              </IconButton>
            </Tooltip>
            <Tooltip title="Adicionar Elemento">
              <IconButton onClick={(e) => setAddMenuAnchor(e.currentTarget)}>
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip title="Aplicar Template">
              <IconButton onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}>
                <AutoFixHigh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Salvar Layout">
              <IconButton>
                <Save />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="evento-preview">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ minHeight: 500 }}
              >
                {elements.map((element, index) => renderElement(element, index))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>

      {renderStyleEditor()}
      {renderAddMenu()}
      {renderTemplateMenu()}

      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <EmojiPicker onEmojiClick={handleEmojiSelect} />
      </Popover>

      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => setColorPickerAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <SketchPicker
          color={selectedElement?.style?.color || '#000'}
          onChange={(color) => handleStyleChange('color', color.hex)}
        />
      </Popover>
    </Box>
  );
};

export default EventoPreview; 