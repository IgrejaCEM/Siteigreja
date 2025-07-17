const { db } = require('./src/database/db');

async function forceVideoUpdate() {
  try {
    console.log('ATENÇÃO: Este script não deve ser executado para não sobrescrever a home!');
    process.exit(0);
    console.log('Forçando atualização da home com vídeo do YouTube...');    
    const newContent = `
        <header style="background:#1976d2;color:#fff;padding:24px;text-align:center;">
          <h1>CONNECT CONF</h1>
          <p>O maior evento de tecnologia do ano</p>
        </header>
        
        <section style="padding: 60px 20px; background: #000; text-align: center;">
          <div style="max-width:1200px; margin: 0 auto;">
            <h2 style="color: #fff; font-size: 2.5rem; margin-bottom: 30px; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
              CONFIRA O TRAILER
            </h2>
            <div style="position: relative; width:100%; max-width: 800px; margin: 0 auto;">
              <iframe 
                width="100%"
                height="450"
                src="https://www.youtube.com/embed/aNOVuL1JNYk?rel=0&autoplay=0"
                title="CONNECT CONF Trailer"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
    
    await db('settings').update({ 
      homeContent: newContent,
      updated_at: new Date()
    });
    
    console.log('✅ Home atualizada com vídeo do YouTube!');
    console.log('Recarregue a página para ver as mudanças.');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

forceVideoUpdate(); 