exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('settings').del();
  
  // Insere os dados iniciais
  await knex('settings').insert([
    {
      value: JSON.stringify({
        title: 'Bem-vindo à Igreja CEM',
        subtitle: 'Um lugar de fé, esperança e amor',
        description: 'Junte-se a nós em nossos eventos e celebrações'
      }),
      homeContent: JSON.stringify({
        title: 'Bem-vindo à Igreja CEM',
        subtitle: 'Um lugar de fé, esperança e amor',
        description: 'Junte-se a nós em nossos eventos e celebrações'
      }),
      homeCss: ''
    },
    {
      value: JSON.stringify([
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
      ]),
      homeContent: JSON.stringify([
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
      ]),
      homeCss: ''
    }
  ]);
}; 