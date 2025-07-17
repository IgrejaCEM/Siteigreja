const { db } = require('./src/database/db');

async function fixHomeEvents() {
  try {
    console.log('Verificando e corrigindo conteúdo da home...');
    
    // Verificar se existe configuração da home
    const settings = await db('settings').first();
    
    if (settings) {
      console.log('Configuração encontrada. Verificando conteúdo...');
      
      let homeContent = settings.homeContent || '';
      console.log('Conteúdo atual:', homeContent.substring(0, 100) + '...');
      
      // Verificar se tem o placeholder de eventos
      if (!homeContent.includes('proximos-eventos')) {
        console.log('Adicionando placeholder de eventos...');
        
        const newContent = homeContent + `
        <div id="proximos-eventos"></div>
        `;
        
        await db('settings')
          .update({ 
            homeContent: newContent,
            updated_at: new Date()
          });
        
        console.log('Placeholder de eventos adicionado!');
      } else {
        console.log('Placeholder de eventos já existe!');
      }
      
      // Verificar se tem vídeo do YouTube
      if (!homeContent.includes('youtube.com')) {
        console.log('Adicionando vídeo do YouTube...');
        
        const videoSection = `
        <section style="padding: 60px 20; background: #000; text-align: center;">
          <div style="max-width:1200px; margin: 0 auto;">         <h2 style="color: #fff; font-size: 2.5rem; margin-bottom: 30px; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
              CONFIRA O TRAILER
            </h2>
            <div style="position: relative; width:100%; max-width: 800px; margin: 0 auto;">           <iframe 
                width="100%"
                height="450"        src="https://www.youtube.com/embed/dQw4WgXcQ?rel=0&autoplay=0"        title="CONNECT CONF Trailer"
                frameborder="0"    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
              </iframe>
            </div>
          </div>
        </section>
        `;
        
        // Inserir o vídeo após o header
        const headerEndIndex = homeContent.indexOf('</header>');
        if (headerEndIndex !== -1) {
          const beforeHeader = homeContent.substring(0, headerEndIndex + 9);
          const afterHeader = homeContent.substring(headerEndIndex + 9);
          
          const newContent = beforeHeader + videoSection + afterHeader;
          
          await db('settings')
            .update({ 
              homeContent: newContent,
              updated_at: new Date()
            });
          
          console.log('✅ Vídeo do YouTube adicionado com sucesso!');
        } else {
          console.log('❌ Não foi possível encontrar o header para inserir o vídeo');
        }
      } else {
        console.log('✅ Vídeo do YouTube já existe na home!');
      }
    } else {
      console.log('Criando configuração da home...');
      
      const defaultContent = `
        <header style="background:#1976d2;color:#fff;padding:24px;text-align:center;">
          <h1>CONNECT CONF</h1>
          <p>O maior evento de tecnologia do ano</p>
        </header>
        
        <section style="padding: 60px 20; background: #000; text-align: center;">
          <div style="max-width:1200px; margin: 0 auto;">         <h2 style="color: #fff; font-size: 2.5rem; margin-bottom: 30px; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
              CONFIRA O TRAILER
            </h2>
            <div style="position: relative; width:100%; max-width: 800px; margin: 0 auto;">           <iframe 
                width="100%"
                height="450"        src="https://www.youtube.com/embed/dQw4WgXcQ?rel=0&autoplay=0"        title="CONNECT CONF Trailer"
                frameborder="0"    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
              </iframe>
            </div>
          </div>
        </section>
        
        <div id="proximos-eventos"></div>
        
        <footer style="background:#222;color:#fff;padding:24px;text-align:center;">
          © 2025 CONNECT CONF. Todos os direitos reservados.
        </footer>
      `;
      
      await db('settings').insert({
        homeContent: defaultContent,
        homeCss: '',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log('Configuração da home criada!');
    }
    
    // Verificar eventos
    const events = await db('events').select('*');
    console.log('Eventos cadastrados:', events.length);
    events.forEach(event => {
      console.log(`- ${event.title} (${event.status})`);
    });
    
    console.log('✅ Home corrigida! Agora os eventos devem aparecer.');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

fixHomeEvents(); 