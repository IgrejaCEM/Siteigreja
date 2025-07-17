import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const VisualEditor = () => {
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        return [];
      }
    };

    const initEditor = async () => {
      try {
        // Carregar eventos
        const eventsData = await loadEvents();
        setEvents(eventsData);

        // Carregar o conteúdo atual da página
        const response = await axios.get(`${API_BASE_URL}/settings/home-content`);
        const savedContent = response.data?.content || '';
        const savedCss = response.data?.css || '';

        // Configurar o editor
        const editor = grapesjs.init({
          container: '#gjs',
          height: '100vh',
          width: 'auto',
          storageManager: false,
          panels: { defaults: [] },
          deviceManager: {
            devices: [
              {
                name: 'Desktop',
                width: '',
              },
              {
                name: 'Tablet',
                width: '768px',
                widthMedia: '768px',
              },
              {
                name: 'Mobile',
                width: '320px',
                widthMedia: '480px',
              },
            ],
          },
          blockManager: {
            appendTo: '#blocks',
            blocks: [
              {
                id: 'hero-section',
                label: 'Hero Section',
                category: 'Seções',
                content: `
                  <section class="hero" style="background-color: #f5f5f5; padding: 80px 0; text-align: center;">
                    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                      <h1 style="font-size: 3em; margin-bottom: 20px;">Bem-vindo à Nossa Igreja</h1>
                      <p style="font-size: 1.2em; margin-bottom: 30px;">Um lugar de fé, esperança e amor</p>
                      <button style="background-color: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer;">Saiba Mais</button>
                    </div>
                  </section>
                `,
              },
              {
                id: 'events-section',
                label: 'Seção de Eventos',
                category: 'Seções',
                content: `
                  <section class="events" style="padding: 60px 0; background-color: white;">
                    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                      <h2 style="text-align: center; margin-bottom: 40px;">Próximos Eventos</h2>
                      <div class="events-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                        ${eventsData.map(event => `
                          <div class="event-card" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                            <img src="${event.banner || 'https://via.placeholder.com/400x200'}" alt="${event.title}" style="width: 100%; height: 200px; object-fit: cover;">
                            <div style="padding: 20px;">
                              <h3 style="margin: 0 0 10px;">${event.title}</h3>
                              <p style="margin: 0 0 20px; color: #666;">${event.description}</p>
                              <button style="background-color: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Saiba Mais</button>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </section>
                `,
              },
              {
                id: 'text-section',
                label: 'Seção de Texto',
                category: 'Seções',
                content: `
                  <section style="padding: 60px 0;">
                    <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 20px;">
                      <h2 style="text-align: center; margin-bottom: 30px;">Título da Seção</h2>
                      <p style="font-size: 1.1em; line-height: 1.6; color: #444;">
                        Adicione seu texto aqui. Este é um exemplo de uma seção de texto que você pode usar para compartilhar informações importantes sobre sua igreja.
                      </p>
                    </div>
                  </section>
                `,
              },
              {
                id: 'image-text',
                label: 'Imagem com Texto',
                category: 'Seções',
                content: `
                  <section style="padding: 60px 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; gap: 40px;">
                      <div style="flex: 1;">
                        <img src="https://via.placeholder.com/600x400" alt="Imagem" style="width: 100%; border-radius: 8px;">
                      </div>
                      <div style="flex: 1;">
                        <h2 style="margin-bottom: 20px;">Título da Seção</h2>
                        <p style="line-height: 1.6; color: #444;">
                          Adicione seu texto aqui. Esta seção combina uma imagem com texto para criar um layout mais dinâmico e atraente.
                        </p>
                      </div>
                    </div>
                  </section>
                `,
              },
            ],
          },
          styleManager: {
            appendTo: '#styles',
            sectors: [
              {
                name: 'Dimensões',
                open: false,
                properties: ['width', 'height', 'padding', 'margin'],
              },
              {
                name: 'Tipografia',
                open: false,
                properties: [
                  'font-family',
                  'font-size',
                  'font-weight',
                  'letter-spacing',
                  'color',
                  'line-height',
                  'text-align',
                  'text-decoration',
                  'text-shadow',
                ],
              },
              {
                name: 'Decorações',
                open: false,
                properties: [
                  'background-color',
                  'border',
                  'border-radius',
                  'box-shadow',
                ],
              },
              {
                name: 'Extra',
                open: false,
                properties: [
                  'transition',
                  'transform',
                  'opacity',
                  'cursor',
                ],
              },
            ],
          },
        });

        // Carregar o conteúdo salvo
        if (savedContent) {
          editor.setComponents(savedContent);
        }
        if (savedCss) {
          editor.setStyle(savedCss);
        }

        setEditor(editor);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar o editor:', error);
        setLoading(false);
      }
    };

    initEditor();

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  const handleSave = async () => {
    if (!editor) return;

    try {
      const content = editor.getHtml();
      const css = editor.getCss();

              await axios.post(`${API_BASE_URL}/settings/home-content`, {
        content,
        css,
      });

      alert('Página salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar a página:', error);
      alert('Erro ao salvar a página');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Salvar
        </Button>
        <Button variant="outlined" onClick={() => editor.runCommand('core:preview')}>
          Visualizar
        </Button>
        <Button variant="outlined" onClick={() => editor.runCommand('core:undo')}>
          Desfazer
        </Button>
        <Button variant="outlined" onClick={() => editor.runCommand('core:redo')}>
          Refazer
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box
          id="blocks"
          sx={{
            width: 250,
            p: 2,
            borderRight: 1,
            borderColor: 'divider',
            overflowY: 'auto',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <div id="gjs" />
        </Box>
        <Box
          id="styles"
          sx={{
            width: 250,
            p: 2,
            borderLeft: 1,
            borderColor: 'divider',
            overflowY: 'auto',
          }}
        />
      </Box>
    </Box>
  );
};

export default VisualEditor; 