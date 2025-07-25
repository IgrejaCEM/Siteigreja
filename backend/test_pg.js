const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

client.connect()
  .then(() => {
    console.log('Conexão bem-sucedida!');
    return client.end();
  })
  .catch(err => {
    console.error('Erro ao conectar:', err);
  }); 