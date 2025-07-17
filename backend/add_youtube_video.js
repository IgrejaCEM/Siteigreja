const { db } = require(./src/database/db');

async function addYouTubeVideo() {
  try {
    console.log('Adicionando vídeo do YouTube na home...');
    
    // Buscar configuração atual
    const settings = await db('settings').first();
    
    if (settings) {
      let homeContent = settings.homeContent || '';     
      // Verificar se já tem vídeo do YouTube
      if (!homeContent.includes('youtube.com) && !homeContent.includes('youtu.be')) {       console.log('Adicionando vídeo do YouTube...');
        
        // Adicionar vídeo do YouTube após o banner e antes dos eventos
        const videoSection = `
        <section style="padding: 60px20; background: #000; text-align: center;">
          <div style=max-width:1200px; margin: 0 auto;>         <h2 style=color: #fff; font-size: 2.5rem; margin-bottom: 30px; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
              CONFIRA O TRAILER
            </h2>
            <div style="position: relative; width:100; max-width: 800px; margin: 0 auto;>           <iframe 
                width="100%"
                height="450               src="https://www.youtube.com/embed/dQw4XgXcQ?rel=0&autoplay=0             title="CONNECT CONF Trailer"
                frameborder="0             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style=border-radius: 12px; box-shadow: 0 8px 32x rgba(0,0,0,0.3);">
              </iframe>
            </div>
          </div>
        </section>
        `;
        
        // Inserir o vídeo após o banner e antes dos eventos
        const bannerEndIndex = homeContent.indexOf('</header>');
        if (bannerEndIndex !== -1) {      const beforeBanner = homeContent.substring(0, bannerEndIndex + 9);
          const afterBanner = homeContent.substring(bannerEndIndex + 9);
          
          const newContent = beforeBanner + videoSection + afterBanner;
          
          await db('settings')
            .update({ 
              homeContent: newContent,
              updated_at: new Date()
            });
          
          console.log('✅ Vídeo do YouTube adicionado com sucesso!');
        } else {
          console.log('❌ Não foi possível encontrar o header para inserir o vídeo');
        }
      } else {       console.log('✅ Vídeo do YouTube já existe na home!');
      }
    } else {
      console.log('❌ Configuração da home não encontrada');  }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

addYouTubeVideo(); 