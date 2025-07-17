const[object Object] db } = require(./src/database/db');

async function updateHomeWithVideo() {
  try[object Object]
    console.log('Atualizando home com vídeo do YouTube...);    
    const newContent = `
        <header style=background:#1976color:#fff;padding:24px;text-align:center;">
          <h1CONNECT CONF</h1>
          <p>O maior evento de tecnologia do ano</p>
        </header>
        
        <section style=padding: 60x20; background: #000; text-align: center;">
          <div style=max-width:1200px; margin: 0 auto;>         <h2 style=color: #fff; font-size: 2.5rem; margin-bottom: 30px; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
              CONFIRA O TRAILER
            </h2>
            <div style="position: relative; width:10; max-width: 800px; margin: 0auto;>           <iframe 
                width="100%"
                height=450               src="https://www.youtube.com/embed/dQw4WgXcQ?rel=0&autoplay=0             title="CONNECT CONF Trailer"
                frameborder="0             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style=border-radius: 12px; box-shadow: 0 8px 32x rgba(0,0,0,0.3);">
              </iframe>
            </div>
          </div>
        </section>
        
        <div id="proximos-eventos></div>
        
        <footer style="background:#222;color:#fff;padding:24px;text-align:center;>
          © 2025ONNECT CONF. Todos os direitos reservados.
        </footer>
    `;
    
    await db(settings).update({ 
      homeContent: newContent,
      updated_at: new Date()
    });
    
    console.log(✅ Home atualizada com vídeo do YouTube!);
    
  } catch (error) {
    console.error(Erro:', error);
  } finally [object Object]
    process.exit(0);
  }
}

updateHomeWithVideo(); 