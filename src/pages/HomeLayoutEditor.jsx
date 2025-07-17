import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Typography, Button, Alert, AppBar, Toolbar } from '@mui/material';
import { API_BASE_URL } from '../config';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';

const COMPONENT_TYPES = {
  HERO: 'hero',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  SECTION: 'section',
  CARDS: 'cards',
  EVENTS: 'events'
};

const DEFAULT_STYLES = {
  // ... existing styles ...
};

export default function HomeLayoutEditor() {
  const [layout, setLayout] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching home layout data...');
        const layoutResponse = await axios.get(`${API_BASE_URL}/api/settings/home-layout`);
        console.log('Layout response:', layoutResponse.data);
        
        const eventsResponse = await axios.get(`${API_BASE_URL}/api/events`);
        console.log('Events response:', eventsResponse.data);
        
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
            isLocked: true
          });
        }
        
        setLayout(savedLayout);
        setEvents(eventsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout(items);
  };

  const saveLayout = async () => {
    try {
      console.log('Saving layout:', layout);
      const response = await axios.post(`${API_BASE_URL}/api/settings/home-layout`, {
        layout: layout
      });
      console.log('Save response:', response.data);
      setMessage('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setMessage('Erro ao salvar layout: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editor de Layout da Home
          </Typography>
          <Button
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewMode(!previewMode)}
            sx={{ mr: 2 }}
            color="inherit"
          >
            {previewMode ? 'Modo Edição' : 'Visualizar'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SaveIcon />}
            onClick={saveLayout}
          >
            Salvar Layout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, mt: 8, p: 3 }}>
        {message && (
          <Alert
            severity={message.includes('sucesso') ? 'success' : 'error'}
            onClose={() => setMessage('')}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="layout">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ minHeight: 200, bgcolor: 'background.paper', borderRadius: 1, p: 2 }}
              >
                {layout.map((component, index) => (
                  <Draggable
                    key={component.id}
                    draggableId={component.id}
                    index={index}
                    isDragDisabled={component.isLocked || false}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: snapshot.isDragging ? 'action.hover' : 'background.default',
                          borderRadius: 1,
                          boxShadow: 1
                        }}
                      >
                        <Typography>{component.type}</Typography>
                        {/* Render component content based on type */}
                      </Box>
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
  );
} 