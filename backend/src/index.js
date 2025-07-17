require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./database/db');
const config = require('./config');

const startServer = async () => {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Iniciar servidor
    const port = config.server.port;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 