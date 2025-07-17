const { db } = require('./database/db');

async function updateHomeContent() {
  try {
    const homeContent = `
      <!-- Banner Hero com Vídeo -->
      <div style="position: relative; width: 100%; height: 100vh; overflow: hidden; background: #000;">
        <video 
          autoplay 
          muted 
          loop 
          style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;"
        >
          <source src="/uploads/banners/herogif.mp4" type="video/mp4">
          <img src="/uploads/banners/hero.png" alt="CONNECT CONF" style="width: 100%; height: 100%; object-fit: cover;">
        </video>
        
        <!-- Overlay escuro para melhorar legibilidade -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); z-index: 2;"></div>
        
        <!-- Conteúdo centralizado sobre o vídeo -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 3; color: #fff; width: 90%; max-width: 800px;">
          <h1 style="font-size: 4rem; font-weight: 900; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); letter-spacing: 2px;">
            CONNECT CONF
          </h1>
          <h2 style="font-size: 1.8rem; font-weight: 400; margin-bottom: 2rem; color: #3b82f6; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
            1ª CONFERÊNCIA DE ADOLESCENTES
          </h2>
          <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #e5e7eb; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
            Viva o novo tempo • Não fique de fora
          </p>
          <button style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 1rem 2.5rem; font-size: 1.1rem; font-weight: 600; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.3s ease;">
            GARANTA SUA VAGA
          </button>
        </div>
      </div>

      <!-- Faixa animada com informações -->
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #3b82f6; font-size: 1.1rem; font-weight: 700; padding: 1rem 0; overflow: hidden; white-space: nowrap; position: relative;">
        <div style="display: inline-block; white-space: nowrap; animation: marquee 20s linear infinite;">
          🎯 CONNECT CONF 2025 • 🎯 CONFERÊNCIA DE ADOLESCENTES • 🎯 VIVA O NOVO TEMPO • 🎯 NÃO FIQUE DE FORA • 🎯 CONNECT CONF 2025 • 🎯 CONFERÊNCIA DE ADOLESCENTES • 🎯 VIVA O NOVO TEMPO • 🎯 NÃO FIQUE DE FORA •
        </div>
      </div>
      <style>
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      </style>

      <!-- Seção de informações -->
      <div style="background: #f8fafc; padding: 4rem 0;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
          <div style="text-align: center; margin-bottom: 3rem;">
            <h2 style="font-size: 2.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">
              SOBRE O EVENTO
            </h2>
            <p style="font-size: 1.2rem; color: #64748b; max-width: 600px; margin: 0 auto;">
              Uma experiência única para adolescentes se conectarem, crescerem e viverem algo sobrenatural!
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
            <div style="background: #fff; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-left: 4px solid #3b82f6;">
              <h3 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem;">🎯 MISSÃO</h3>
              <p style="color: #64748b; line-height: 1.6;">
                Conectar adolescentes com Deus e uns com os outros, criando uma geração transformada.
              </p>
            </div>
            
            <div style="background: #fff; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-left: 4px solid #3b82f6;">
              <h3 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem;">🌟 EXPERIÊNCIA</h3>
              <p style="color: #64748b; line-height: 1.6;">
                Momentos de adoração, pregação, comunhão e muito mais em um ambiente incrível.
              </p>
            </div>
            
            <div style="background: #fff; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-left: 4px solid #3b82f6;">
              <h3 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem;">🚀 TRANSFORMAÇÃO</h3>
              <p style="color: #64748b; line-height: 1.6;">
                Prepare-se para viver algo sobrenatural e sair transformado desta experiência.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de eventos dinâmica -->
      <div id="proximos-eventos" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 4rem 0;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; color: #fff; text-align: center; margin-bottom: 3rem;">
            PRÓXIMOS EVENTOS
          </h2>
          <!-- Os eventos serão carregados dinamicamente aqui pelo frontend -->
        </div>
      </div>

      <!-- FAQ -->
      <div style="background: #f1f5f9; padding: 4rem 0;">
        <div style="max-width: 800px; margin: 0 auto; padding: 0 2rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 3rem;">
            PERGUNTAS FREQUENTES
          </h2>
          
          <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="padding: 2rem; border-bottom: 1px solid #e2e8f0;">
              <h3 style="font-size: 1.2rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">Quando será o evento?</h3>
              <p style="color: #64748b;">2025 - Data a ser confirmada. Fique ligado nas nossas redes sociais!</p>
            </div>
            
            <div style="padding: 2rem; border-bottom: 1px solid #e2e8f0;">
              <h3 style="font-size: 1.2rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">Onde será realizado?</h3>
              <p style="color: #64748b;">Local a ser definido. Será anunciado em breve!</p>
            </div>
            
            <div style="padding: 2rem; border-bottom: 1px solid #e2e8f0;">
              <h3 style="font-size: 1.2rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">Quem pode participar?</h3>
              <p style="color: #64748b;">Todos os adolescentes e jovens! É um evento aberto para todos.</p>
            </div>
            
            <div style="padding: 2rem;">
              <h3 style="font-size: 1.2rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">Como faço minha inscrição?</h3>
              <p style="color: #64748b;">As inscrições serão abertas em breve. Fique atento às nossas redes sociais!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <div style="background: #0f172a; color: #64748b; text-align: center; padding: 2rem 0;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #3b82f6; margin-bottom: 1rem;">CONNECT CONF</h3>
          <p style="margin-bottom: 1rem;">© 2025 CONNECT CONF • Realização: Igreja CEM</p>
          <p style="font-size: 0.9rem;">Uma experiência sobrenatural para adolescentes</p>
        </div>
      </div>
    `;

    const homeLayout = [
      {
        id: 1,
        type: 'hero',
        content: {
          title: 'CONNECT CONF',
          subtitle: '1ª CONFERÊNCIA DE ADOLESCENTES',
          description: 'Viva o novo tempo • Não fique de fora',
          buttonText: 'GARANTA SUA VAGA',
          backgroundVideo: '/uploads/banners/herogif.mp4',
          backgroundImage: '/uploads/banners/hero.png'
        },
        styles: {
          height: '100vh',
          background: '#000',
          color: '#fff'
        }
      },
      {
        id: 2,
        type: 'events',
        content: {
          title: 'PRÓXIMOS EVENTOS'
        },
        styles: {
          padding: '4rem 0',
          backgroundColor: '#1e293b'
        }
      }
    ];

    await db('settings').update({
      homeContent: homeContent,
      homeLayout: JSON.stringify(homeLayout),
      homeCss: '',
      updated_at: new Date().toISOString()
    });
    console.log('Home CONNECT CONF atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar home content/layout:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

updateHomeContent(); 