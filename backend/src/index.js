require('dotenv').config();
const app = require('./server');
const { initializeDatabase } = require('./database/db');
const config = require('./config');

const startServer = async () => {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Iniciar servidor
    const port = config.server.port || process.env.PORT || 3005;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Server URL: https://igreja-backend.onrender.com`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 