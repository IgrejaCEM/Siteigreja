import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const defaultHtml = `
  <header style="background: #222; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; flex-wrap: wrap;">
    <img src="/images_site/logo-igreja.png" alt="Logo Igreja" style="height: 56px; border-radius: 8px; max-width: 180px; object-fit: contain; background: #fff; padding: 4px;" />
    <div style="text-align: right; min-width: 180px;">
      <div style="font-size: 1.3em; font-weight: bold; color: #b39ddb;">Igreja Central</div>
      <div style="font-size: 1em; color: #fff;">Um lugar de fé, esperança e amor</div>
      <div style="font-size: 0.95em; color: #b39ddb;">Rua Exemplo, 123, São Paulo/SP</div>
    </div>
  </header>

  <section style="background: linear-gradient(135deg, #6a1b9a 0%, #000 100%); color: #fff; padding: 64px 0 48px 0; text-align: center;">
    <h1 style="font-size: 3em; font-weight: bold; margin-bottom: 16px; letter-spacing: 1px;">Prepare-se para viver algo sobrenatural!</h1>
    <h2 style="font-size: 1.5em; font-weight: 400; margin-bottom: 24px; color: #e1bee7;">Dias 12 e 13 de Julho | Igreja Central, São Paulo</h2>
    <a href="#inscricao" style="display:inline-block; background: #fff; color: #6a1b9a; font-weight: bold; padding: 16px 40px; border-radius: 32px; font-size: 1.2em; text-decoration: none; box-shadow: 0 2px 8px #0003; transition: background .2s, color .2s;">Garanta sua vaga</a>
    <div style="margin-top: 40px;">
      <img src="/images_site/evento-hero.jpg" alt="Hero" style="max-width: 100%; border-radius: 24px; box-shadow: 0 4px 32px #0007; border: 4px solid #fff;" />
    </div>
  </section>

  <section style="background: #fff; color: #222; padding: 56px 0; text-align: center;">
    <h2 style="color: #6a1b9a; font-size: 2.2em; font-weight: bold; margin-bottom: 16px;">Sobre o Evento</h2>
    <p style="max-width: 700px; margin: 0 auto 16px auto; font-size: 1.2em;">Três dias de palavra, adoração, comunhão e transformação. Um encontro para experimentar o mover de Deus, fortalecer sua fé e viver conexões profundas. Missão: "E conhecereis a verdade, e a verdade vos libertará." (João 8:32)</p>
  </section>

  <section style="background: #f3e5f5; color: #222; padding: 56px 0; text-align: center;">
    <h2 style="color: #6a1b9a; font-size: 2em; font-weight: bold; margin-bottom: 32px;">Preletores &amp; Ministrantes</h2>
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px;">
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 2px 8px #0002; padding: 24px; width: 260px;">
        <img src="/images_site/preletor1.jpg" alt="Preletor 1" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 3px solid #6a1b9a;" />
        <h3 style="color: #6a1b9a; margin-bottom: 4px;">Pr. João Silva</h3>
        <p style="font-size: 1em; color: #333;">Igreja Esperança</p>
        <p style="font-size: 0.95em; color: #6a1b9a; font-style: italic;">"Deus faz novas todas as coisas"</p>
      </div>
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 2px 8px #0002; padding: 24px; width: 260px;">
        <img src="/images_site/preletor2.jpg" alt="Preletor 2" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 3px solid #6a1b9a;" />
        <h3 style="color: #6a1b9a; margin-bottom: 4px;">Pra. Ana Souza</h3>
        <p style="font-size: 1em; color: #333;">Ministério Vida</p>
        <p style="font-size: 0.95em; color: #6a1b9a; font-style: italic;">"Transformando gerações"</p>
      </div>
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 2px 8px #0002; padding: 24px; width: 260px;">
        <img src="/images_site/preletor3.jpg" alt="Preletor 3" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 3px solid #6a1b9a;" />
        <h3 style="color: #6a1b9a; margin-bottom: 4px;">Banda LouvorVivo</h3>
        <p style="font-size: 1em; color: #333;">Louvor &amp; Adoração</p>
        <p style="font-size: 0.95em; color: #6a1b9a; font-style: italic;">"Adorando com intensidade"</p>
      </div>
    </div>
  </section>

  <section style="background: #222; color: #fff; padding: 56px 0; text-align: center;">
    <h2 style="color: #b39ddb; font-size: 2em; font-weight: bold; margin-bottom: 32px;">Programação</h2>
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px;">
      <div style="background: #333; border-radius: 12px; padding: 24px; min-width: 220px; color: #fff;">
        <h3 style="color: #fff;">Dia 1</h3>
        <p>Abertura + Ministração Pr. João</p>
      </div>
      <div style="background: #333; border-radius: 12px; padding: 24px; min-width: 220px; color: #fff;">
        <h3 style="color: #fff;">Dia 2</h3>
        <p>Workshops + Culto à noite</p>
      </div>
      <div style="background: #333; border-radius: 12px; padding: 24px; min-width: 220px; color: #fff;">
        <h3 style="color: #fff;">Dia 3</h3>
        <p>Encerramento profético</p>
      </div>
    </div>
  </section>

  <section style="background: #fff; color: #222; padding: 56px 0; text-align: center;">
    <h2 style="color: #6a1b9a; font-size: 2em; font-weight: bold; margin-bottom: 32px;">Informações Importantes</h2>
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; max-width: 900px; margin: 0 auto;">
      <div style="flex: 1 1 200px; min-width: 200px;">
        <p>📍 Localização: <a href="https://goo.gl/maps/xyz" target="_blank" style="color: #6a1b9a;">Ver no mapa</a></p>
        <p>🚗 Estacionamento disponível</p>
        <p>🧒 Espaço kids</p>
      </div>
      <div style="flex: 1 1 200px; min-width: 200px;">
        <p>🍽️ Praça de alimentação</p>
        <p>🎥 Transmissão online</p>
        <p>🏨 Hospedagem para visitantes</p>
      </div>
    </div>
  </section>

  <section id="inscricao" style="background: linear-gradient(135deg, #6a1b9a 0%, #000 100%); color: #fff; padding: 56px 0; text-align: center;">
    <h2 style="font-size: 2em; font-weight: bold; margin-bottom: 24px; color: #fff;">Inscreva-se Agora</h2>
    <form style="max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
      <input type="text" placeholder="Nome completo" style="padding: 12px; border-radius: 8px; border: none; font-size: 1em;" />
      <input type="email" placeholder="E-mail" style="padding: 12px; border-radius: 8px; border: none; font-size: 1em;" />
      <input type="tel" placeholder="Telefone" style="padding: 12px; border-radius: 8px; border: none; font-size: 1em;" />
      <input type="text" placeholder="Cidade" style="padding: 12px; border-radius: 8px; border: none; font-size: 1em;" />
      <button type="submit" style="background: #fff; color: #6a1b9a; font-weight: bold; padding: 14px 0; border-radius: 8px; font-size: 1.1em; border: none; margin-top: 8px; cursor: pointer;">Quero me inscrever</button>
    </form>
    <p style="margin-top: 16px; color: #b39ddb;">Pagamento via Pix, cartão ou boleto disponível.</p>
  </section>

  <section style="background: #f3e5f5; color: #222; padding: 56px 0; text-align: center;">
    <h2 style="color: #6a1b9a; font-size: 2em; font-weight: bold; margin-bottom: 32px;">Depoimentos</h2>
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 32px;">
      <blockquote style="background: #fff; border-radius: 12px; padding: 24px; max-width: 320px; margin: 0 auto; font-style: italic; box-shadow: 0 2px 8px #0001;">"Foi um divisor de águas na minha vida espiritual."<br /><span style="display:block; margin-top: 12px; font-weight: bold; color: #6a1b9a;">— Maria</span></blockquote>
      <blockquote style="background: #fff; border-radius: 12px; padding: 24px; max-width: 320px; margin: 0 auto; font-style: italic; box-shadow: 0 2px 8px #0001;">"Nunca senti tanta presença de Deus!"<br /><span style="display:block; margin-top: 12px; font-weight: bold; color: #6a1b9a;">— José</span></blockquote>
    </div>
  </section>

  <section style="background: #fff; color: #222; padding: 56px 0; text-align: center;">
    <h2 style="color: #6a1b9a; font-size: 2em; font-weight: bold; margin-bottom: 32px;">Fale Conosco / FAQ</h2>
    <div style="max-width: 700px; margin: 0 auto; text-align: left;">
      <p><b>Como faço para me inscrever?</b><br />Clique no botão "Quero me inscrever" e preencha o formulário.</p>
      <p><b>Onde será o evento?</b><br />Igreja Central, São Paulo. Veja o mapa acima.</p>
      <p><b>O evento é pago?</b><br />Sim, mas há opções de Pix, cartão e boleto.</p>
      <p><b>Tem espaço kids?</b><br />Sim, para crianças de 3 a 10 anos.</p>
      <p><b>Como entro em contato?</b><br />WhatsApp: <a href="https://wa.me/5511999999999" style="color: #6a1b9a;">Clique aqui</a></p>
    </div>
  </section>

  <footer style="background: #222; color: #fff; padding: 32px 0; text-align: center;">
    <div style="margin-bottom: 12px;">
      <a href="#" style="color: #b39ddb; margin: 0 12px; text-decoration: none;">Instagram</a>
      <a href="#" style="color: #b39ddb; margin: 0 12px; text-decoration: none;">Facebook</a>
      <a href="#" style="color: #b39ddb; margin: 0 12px; text-decoration: none;">YouTube</a>
    </div>
    <div style="margin-bottom: 8px;">Igreja Central — Rua Exemplo, 123, São Paulo/SP</div>
    <div style="font-size: 0.95em; color: #b39ddb;">© 2025 Igreja Central. Todos os direitos reservados.</div>
    <div style="margin-top: 8px;">
      <a href="#inscricao" style="color: #fff; margin: 0 8px; text-decoration: underline;">Inscrição</a> |
      <a href="#" style="color: #fff; margin: 0 8px; text-decoration: underline;">Programação</a> |
      <a href="#" style="color: #fff; margin: 0 8px; text-decoration: underline;">Fale conosco</a>
    </div>
  </footer>
`;

export default function EditorHome() {
  const gjsContainer = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorInstance, setEditorInstance] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [initError, setInitError] = useState(null);
  const [containerMounted, setContainerMounted] = useState(false);

  // Buscar eventos reais ao carregar o editor
  useEffect(() => {
    async function fetchEventos() {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        setEventos(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setEventos([]);
      }
    }
    fetchEventos();
  }, []);

  // Detectar montagem do container
  useEffect(() => {
    if (gjsContainer.current) {
      setContainerMounted(true);
      console.log('Container do GrapesJS montado!');
    }
  }, [gjsContainer]);

  // Timeout para loading infinito
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
        setInitError('Timeout: O editor não pôde ser carregado. Verifique dependências e console.');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Inicializa o GrapesJS só quando o container estiver pronto
  useEffect(() => {
    if (editorInstance) {
      console.log('Editor já inicializado.');
      return;
    }
    if (!containerMounted || !gjsContainer.current) {
      console.log('Aguardando container do GrapesJS...');
      return;
    }
    let editor;
    setLoading(true);
    try {
      console.log('Inicializando GrapesJS...');
      editor = grapesjs.init({
        container: gjsContainer.current,
        height: 'calc(100vh - 64px)',
        width: '100%',
        storageManager: false,
        draggable: true,
        droppable: true,
        blockManager: { appendTo: '#blocks' },
        styleManager: { appendTo: '#styles' },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css?family=Roboto:400,500,700',
            'https://fonts.googleapis.com/icon?family=Material+Icons'
          ],
          scripts: [],
        },
        domComponents: { processor: (obj) => obj },
      });
      setEditorInstance(editor);
      setEditorReady(true);
      setLoading(false);
      setInitError(null);
      console.log('Editor GrapesJS inicializado com sucesso!');
    } catch (err) {
      console.error('Erro ao inicializar GrapesJS:', err);
      setInitError('Erro ao inicializar o editor. Veja o console para detalhes.');
      setLoading(false);
    }
    return () => {
      if (editor) editor.destroy();
    };
    // eslint-disable-next-line
  }, [containerMounted]);

  const handleSave = async () => {
    if (!editorInstance) return;
    try {
      const content = editorInstance.getHtml();
      const css = editorInstance.getCss();
      await axios.post(`${API_BASE_URL}/settings/home-content`, 
        { content, css },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Página salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar a página');
    }
  };

  const handleCommand = (command) => {
    if (editorInstance && editorReady) {
      editorInstance.runCommand(command);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  if (initError) {
    return <Box sx={{ color: 'red', textAlign: 'center', mt: 8 }}>{initError}</Box>;
  }

  return (
    <Paper sx={{ p: 0, minHeight: '100vh', background: '#f5f5f5' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>Salvar</Button>
        <Button variant="outlined" onClick={() => handleCommand('core:preview')}>Visualizar</Button>
        <Button variant="outlined" onClick={() => handleCommand('core:undo')}>Desfazer</Button>
        <Button variant="outlined" onClick={() => handleCommand('core:redo')}>Refazer</Button>
      </Box>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 64px)', minHeight: '600px' }}>
        <Box id="blocks" sx={{ 
          width: 250, 
          p: 2, 
          borderRight: 1, 
          borderColor: 'divider', 
          overflowY: 'auto',
          bgcolor: 'white',
          zIndex: 1
        }} />
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          minHeight: '100%',
          background: '#e3e3e3',
          '& .gjs-cv-canvas': {
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
          }
        }}>
          {/* Debug visual: sempre renderizar esse bloco */}
          <div id="debug-gjs" style={{height:'40px',background:'#f00',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>DEBUG: Render do React OK</div>
          <div ref={gjsContainer} style={{ height: '100%', minHeight: '600px', width: '100%', background: '#fff' }} />
        </Box>
        <Box id="styles" sx={{ 
          width: 250, 
          p: 2, 
          borderLeft: 1, 
          borderColor: 'divider', 
          overflowY: 'auto',
          bgcolor: 'white',
          zIndex: 1
        }} />
      </Box>
      {loading && <div style={{ position: 'fixed', top: 80, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>Carregando editor...</div>}
      {!loading && !editorReady && <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Erro ao carregar o editor. Veja o console para detalhes.</div>}
    </Paper>
  );
} 