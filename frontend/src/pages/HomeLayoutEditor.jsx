import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Grid,
  AppBar,
  Toolbar,
  Alert,
  Card,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Slider,
  InputAdornment,
  Container,
  ListItemButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  SmartButton as ButtonIcon,
  ViewModule as SectionIcon,
  ViewCarousel as HeroIcon,
  Dashboard as CardsIcon,
  FormatColorFill as ColorIcon,
  BorderAll as BorderIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { SketchPicker } from 'react-color';
import { API_BASE_URL } from '../config';
import EventCard from '../components/EventCard';
import HeroImageUpload from '../components/HeroImageUpload';

const COMPONENT_TYPES = {
  HERO: 'hero',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  SECTION: 'section',
  CARDS: 'cards',
  EVENTS: 'events',
};

const DEFAULT_STYLES = {
  [COMPONENT_TYPES.HERO]: {
    height: '500px',
    backgroundColor: '#f5f5f5',
    padding: '40px',
    textAlign: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  [COMPONENT_TYPES.TEXT]: {
    padding: '20px',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  [COMPONENT_TYPES.IMAGE]: {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  [COMPONENT_TYPES.BUTTON]: {
    margin: '10px',
    padding: '10px 20px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  [COMPONENT_TYPES.SECTION]: {
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  [COMPONENT_TYPES.CARDS]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
};

const COMPONENT_ICONS = {
  [COMPONENT_TYPES.HERO]: <HeroIcon />,
  [COMPONENT_TYPES.TEXT]: <TextIcon />,
  [COMPONENT_TYPES.IMAGE]: <ImageIcon />,
  [COMPONENT_TYPES.BUTTON]: <ButtonIcon />,
  [COMPONENT_TYPES.SECTION]: <SectionIcon />,
  [COMPONENT_TYPES.CARDS]: <CardsIcon />,
};

export default function HomeLayoutEditor() {
  const [layout, setLayout] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingComponent, setEditingComponent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [message, setMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(100);
  const [drawerWidth] = useState(320);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar o layout atual
              const layoutResponse = await axios.get(`${API_BASE_URL}/settings/home-layout`);
      const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
        
        // Se não houver layout salvo, criar um layout padrão com a seção de eventos
        const savedLayout = layoutResponse.data?.layout || [];
        const hasEventsSection = savedLayout.some(item => item.type === COMPONENT_TYPES.EVENTS);
        
        if (!hasEventsSection) {
          savedLayout.push({
            id: 'events-section',
            type: COMPONENT_TYPES.EVENTS,
            content: {
              title: 'Eventos',
              events: eventsResponse.data
            },
            isLocked: true // Marcar como bloqueado
          });
        }
        
        setLayout(savedLayout);
        setEvents(eventsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Forçar modo edição sempre
  useEffect(() => {
    if (previewMode) setPreviewMode(false);
  }, [previewMode]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout(items);
  };

  const saveLayout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/settings/home-layout`, {
        layout: layout
      });
      setMessage('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      setMessage('Erro ao salvar layout');
    }
  };

  const addComponent = (type) => {
    const newComponent = {
      id: Date.now().toString(),
      type,
      content: type === COMPONENT_TYPES.HERO ? {
        title: 'Título Principal',
        subtitle: 'Subtítulo',
        buttonText: 'Clique Aqui',
        backgroundImage: '',
      } : type === COMPONENT_TYPES.TEXT ? 'Novo texto aqui' : 
        type === COMPONENT_TYPES.IMAGE ? {
          src: 'https://via.placeholder.com/800x400',
          alt: 'Descrição da imagem'
        } : type === COMPONENT_TYPES.BUTTON ? {
          text: 'Novo Botão',
          color: 'primary',
          link: '#'
        } : type === COMPONENT_TYPES.SECTION ? {
          title: 'Nova Seção',
          text: 'Conteúdo da seção'
        } : type === COMPONENT_TYPES.CARDS ? {
          cards: [
            { title: 'Card 1', text: 'Conteúdo do card 1' },
            { title: 'Card 2', text: 'Conteúdo do card 2' },
            { title: 'Card 3', text: 'Conteúdo do card 3' }
          ]
        } : {},
      styles: { ...DEFAULT_STYLES[type] },
    };
    setLayout([...layout, newComponent]);
  };

  const deleteComponent = (id) => {
    setLayout(layout.filter((c) => c.id !== id));
  };

  const editComponent = (component) => {
    setEditingComponent(component);
    setOpenDialog(true);
  };

  const handleSaveEdit = () => {
    setLayout(
      layout.map((c) => (c.id === editingComponent.id ? editingComponent : c))
    );
    setOpenDialog(false);
    setEditingComponent(null);
  };

  const renderComponent = (component, isPreview = false) => {
    const commonProps = isPreview ? {} : {
      onClick: () => editComponent(component),
      style: { cursor: 'pointer' }
    };

    switch (component.type) {
      case COMPONENT_TYPES.HERO:
        return (
          <Box 
            sx={{ 
              ...component.styles,
              backgroundImage: component.content.backgroundImage ? 
                `url(${component.content.backgroundImage})` : undefined,
            }}
            {...commonProps}
          >
            <Typography variant="h1" sx={{ color: component.styles.color || '#000' }}>
              {component.content.title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 2, color: component.styles.color || '#000' }}>
              {component.content.subtitle}
            </Typography>
            {component.content.buttonText && (
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 4 }}
              >
                {component.content.buttonText}
              </Button>
            )}
          </Box>
        );

      case COMPONENT_TYPES.TEXT:
        return (
          <Typography sx={{ ...component.styles }} {...commonProps}>
            {component.content}
          </Typography>
        );

      case COMPONENT_TYPES.IMAGE:
        return (
          <Box
            component="img"
            src={component.content.src}
            alt={component.content.alt}
            sx={{ ...component.styles }}
            {...commonProps}
          />
        );

      case COMPONENT_TYPES.BUTTON:
        return (
          <Button
            variant="contained"
            color={component.content.color || 'primary'}
            sx={{ ...component.styles }}
            {...commonProps}
            component={component.content.link ? 'a' : 'button'}
            href={component.content.link}
          >
            {component.content.text}
          </Button>
        );

      case COMPONENT_TYPES.SECTION:
        return (
          <Box sx={{ ...component.styles }} {...commonProps}>
            <Typography variant="h3" sx={{ mb: 3 }}>
              {component.content.title}
            </Typography>
            <Typography>
              {component.content.text}
            </Typography>
          </Box>
        );

      case COMPONENT_TYPES.CARDS:
        return (
          <Box sx={{ ...component.styles }} {...commonProps}>
            <Grid container spacing={3}>
              {component.content.cards?.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography>
                        {card.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case COMPONENT_TYPES.EVENTS:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Seção de Eventos (Bloqueada)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderEditDialog = () => {
    if (!editingComponent) return null;

    return (
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Editar {editingComponent.type.charAt(0).toUpperCase() + editingComponent.type.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {editingComponent.type === COMPONENT_TYPES.HERO && (
              <>
                <TextField
                  fullWidth
                  label="Título"
                  value={editingComponent.content.title || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, title: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Subtítulo"
                  value={editingComponent.content.subtitle || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, subtitle: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Texto do Botão"
                  value={editingComponent.content.buttonText || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, buttonText: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Imagem de Fundo
                </Typography>
                <HeroImageUpload
                  currentImage={editingComponent.content.backgroundImage}
                  onImageUploaded={(url) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, backgroundImage: url },
                    })
                  }
                />
              </>
            )}

            {editingComponent.type === COMPONENT_TYPES.TEXT && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Texto"
                value={editingComponent.content || ''}
                onChange={(e) =>
                  setEditingComponent({
                    ...editingComponent,
                    content: e.target.value,
                  })
                }
              />
            )}

            {editingComponent.type === COMPONENT_TYPES.IMAGE && (
              <>
                <TextField
                  fullWidth
                  label="URL da Imagem"
                  value={editingComponent.content.src || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, src: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Texto Alternativo"
                  value={editingComponent.content.alt || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, alt: e.target.value },
                    })
                  }
                />
              </>
            )}

            {editingComponent.type === COMPONENT_TYPES.BUTTON && (
              <>
                <TextField
                  fullWidth
                  label="Texto do Botão"
                  value={editingComponent.content.text || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, text: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Link"
                  value={editingComponent.content.link || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, link: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <Select
                  fullWidth
                  value={editingComponent.content.color || 'primary'}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, color: e.target.value },
                    })
                  }
                >
                  <MenuItem value="primary">Primária</MenuItem>
                  <MenuItem value="secondary">Secundária</MenuItem>
                  <MenuItem value="error">Erro</MenuItem>
                  <MenuItem value="warning">Aviso</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Sucesso</MenuItem>
                </Select>
              </>
            )}

            {editingComponent.type === COMPONENT_TYPES.SECTION && (
              <>
                <TextField
                  fullWidth
                  label="Título da Seção"
                  value={editingComponent.content.title || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, title: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Texto da Seção"
                  value={editingComponent.content.text || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, text: e.target.value },
                    })
                  }
                />
              </>
            )}

            {editingComponent.type === COMPONENT_TYPES.CARDS && (
              <Box>
                {editingComponent.content.cards?.map((card, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Card {index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Título do Card"
                      value={card.title || ''}
                      onChange={(e) => {
                        const newCards = [...editingComponent.content.cards];
                        newCards[index] = { ...card, title: e.target.value };
                        setEditingComponent({
                          ...editingComponent,
                          content: { ...editingComponent.content, cards: newCards },
                        });
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Texto do Card"
                      value={card.text || ''}
                      onChange={(e) => {
                        const newCards = [...editingComponent.content.cards];
                        newCards[index] = { ...card, text: e.target.value };
                        setEditingComponent({
                          ...editingComponent,
                          content: { ...editingComponent.content, cards: newCards },
                        });
                      }}
                    />
                    <Button
                      color="error"
                      onClick={() => {
                        const newCards = editingComponent.content.cards.filter((_, i) => i !== index);
                        setEditingComponent({
                          ...editingComponent,
                          content: { ...editingComponent.content, cards: newCards },
                        });
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remover Card
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => {
                    const newCards = [...(editingComponent.content.cards || [])];
                    newCards.push({ title: 'Novo Card', text: 'Conteúdo do card' });
                    setEditingComponent({
                      ...editingComponent,
                      content: { ...editingComponent.content, cards: newCards },
                    });
                  }}
                >
                  Adicionar Card
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Estilização
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ColorIcon sx={{ mr: 1 }} />
                  <Button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    variant="outlined"
                    sx={{ 
                      mr: 1,
                      backgroundColor: editingComponent.styles.backgroundColor || '#ffffff',
                      '&:hover': {
                        backgroundColor: editingComponent.styles.backgroundColor || '#ffffff',
                      }
                    }}
                  >
                    Cor de Fundo
                  </Button>
                  {showColorPicker && (
                    <Box sx={{ position: 'absolute', zIndex: 2 }}>
                      <Box
                        sx={{
                          position: 'fixed',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                        }}
                        onClick={() => setShowColorPicker(false)}
                      />
                      <SketchPicker
                        color={editingComponent.styles.backgroundColor || '#ffffff'}
                        onChange={(color) => {
                          setEditingComponent({
                            ...editingComponent,
                            styles: {
                              ...editingComponent.styles,
                              backgroundColor: color.hex,
                            },
                          });
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Padding"
                  value={editingComponent.styles?.padding || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      styles: { ...editingComponent.styles, padding: e.target.value },
                    })
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Margin"
                  value={editingComponent.styles?.margin || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      styles: { ...editingComponent.styles, margin: e.target.value },
                    })
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Border Radius"
                  value={editingComponent.styles?.borderRadius || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      styles: { ...editingComponent.styles, borderRadius: e.target.value },
                    })
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Text Color"
                  value={editingComponent.styles?.color || ''}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      styles: { ...editingComponent.styles, color: e.target.value },
                    })
                  }
                />
              </Grid>

              {editingComponent.type === COMPONENT_TYPES.TEXT && (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Font Size"
                      value={editingComponent.styles?.fontSize || ''}
                      onChange={(e) =>
                        setEditingComponent({
                          ...editingComponent,
                          styles: { ...editingComponent.styles, fontSize: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Line Height"
                      value={editingComponent.styles?.lineHeight || ''}
                      onChange={(e) =>
                        setEditingComponent({
                          ...editingComponent,
                          styles: { ...editingComponent.styles, lineHeight: e.target.value },
                        })
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Barra lateral de componentes */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Componentes
          </Typography>
          <List>
            {Object.entries(COMPONENT_TYPES).map(([key, type]) => (
              <ListItemButton
                key={key}
                onClick={() => addComponent(type)}
              >
                <ListItemIcon>
                  {COMPONENT_ICONS[type]}
                </ListItemIcon>
                <ListItemText primary={type.charAt(0).toUpperCase() + type.slice(1)} />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Zoom
          </Typography>
          <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
            <ZoomOutIcon />
            <Slider
              value={zoom}
              onChange={(e, newValue) => setZoom(newValue)}
              min={50}
              max={150}
              sx={{ mx: 2 }}
            />
            <ZoomInIcon />
          </Box>
        </Box>
      </Drawer>

      {/* Área principal */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Editor de Layout da Home
            </Typography>
            <Button
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode(!previewMode)}
              sx={{ mr: 2 }}
            >
              {previewMode ? 'Modo Edição' : 'Visualizar'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveLayout}
            >
              Salvar Layout
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3, mt: 8 }}>
          {message && (
            <Alert
              severity={message.includes('sucesso') ? 'success' : 'error'}
              onClose={() => setMessage('')}
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box
            sx={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease',
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="layout" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      minHeight: 200,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    {layout.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                        isDragDisabled={Boolean(component.isLocked)}
                      >
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ 
                              mb: 2,
                              position: 'relative',
                              '&:hover': !previewMode ? {
                                outline: '2px solid #1976d2',
                              } : {},
                              opacity: component.isLocked ? 0.8 : 1,
                              cursor: component.isLocked ? 'not-allowed' : 'grab'
                            }}
                          >
                            {!previewMode && (
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  position: 'absolute',
                                  right: 8,
                                  top: 8,
                                  zIndex: 1,
                                  display: 'flex',
                                  gap: 1,
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  borderRadius: 1,
                                  padding: '4px',
                                }}
                              >
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => editComponent(component)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir">
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteComponent(component.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Arrastar">
                                  <IconButton size="small">
                                    <DragIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                            {renderComponent(component, previewMode)}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Box>
      </Box>

      {renderEditDialog()}
    </Box>
  );
} 