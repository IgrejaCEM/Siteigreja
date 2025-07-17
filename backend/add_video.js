const[object Object] db } = require(./src/database/db');

async function addVideo() {
  try[object Object]
    console.log(Adicionando vídeo do YouTube na home...);    const settings = await db('settings').first();
    
    if (settings) {
      let homeContent = settings.homeContent || ';      
      if (!homeContent.includes(youtube.com')) {
        const videoSection = `
        <section style="padding: 60px20; background: #000; text-align: center;">
          <div style=max-width:1200px; margin: 0 auto;>         <h2 style=color: #fff; font-size: 2.5rem; margin-bottom: 30px; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
              CONFIRA O TRAILER
            </h2>
            <div style="position: relative; width:100; max-width: 800px; margin: 0 auto;>           <iframe 
                width="100%"
                height="450               src="https://www.youtube.com/embed/dQw4WgXcQ?rel=0&autoplay=0             title="CONNECT CONF Trailer"
                frameborder="0             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style=border-radius: 12px; box-shadow: 0 8px 32x rgba(0,0,0,0.3);">
              </iframe>
            </div>
          </div>
        </section>
        `;
        
        const bannerEndIndex = homeContent.indexOf('</header>');
        if (bannerEndIndex !== -1)[object Object]      const beforeBanner = homeContent.substring(0, bannerEndIndex + 9);
          const afterBanner = homeContent.substring(bannerEndIndex + 9);
          
          const newContent = beforeBanner + videoSection + afterBanner;
          
          await db(settings').update({ 
            homeContent: newContent,
            updated_at: new Date()
          });
          
          console.log('✅ Vídeo do YouTube adicionado com sucesso!);
        } else {
          console.log('❌ Não foi possível encontrar o header');
        }
      } else[object Object]       console.log('✅ Vídeo do YouTube já existe!');
      }
    } else {
      console.log('❌ Configuração não encontrada);  }
    
  } catch (error) {
    console.error(Erro:', error);
  } finally [object Object]
    process.exit(0);
  }
}

addVideo(); 