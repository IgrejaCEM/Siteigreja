const { db } = require('./database/db');

async function updateHomeContent() {
  try {
    const homeContent = `
      <section>
        <h1>Bem-vindo à Igreja CEM</h1>
        <p>Um lugar de fé, esperança e amor.</p>
      </section>
      <div id="proximos-eventos"></div>
      <section>
        <h2>Sobre Nós</h2>
        <p>Conheça nossa missão, visão e valores.</p>
      </section>
      <section>
        <h2>Participe</h2>
        <p>Veja como se envolver em nossos ministérios e eventos.</p>
      </section>
    `;
    const homeLayout = [
      {
        id: 1,
        type: 'hero',
        content: {
          title: 'Bem-vindo à Igreja CEM',
          subtitle: 'Um lugar de fé, esperança e amor',
          buttonText: 'Conheça Nossos Eventos',
          backgroundImage: '/images_site/banner-home.png'
        },
        styles: {
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }
      },
      {
        id: 2,
        type: 'events',
        content: {
          title: 'Próximos Eventos'
        },
        styles: {
          padding: '4rem 0',
          backgroundColor: '#f5f5f5'
        }
      }
    ];
    await db('settings').update({
      homeContent: homeContent,
      homeLayout: JSON.stringify(homeLayout),
      homeCss: '',
      updated_at: new Date().toISOString()
    });
    console.log('Home content e layout atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar home content/layout:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

updateHomeContent(); 