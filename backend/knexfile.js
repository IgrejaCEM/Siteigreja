require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'src', 'database', 'migrations')
    }
  }
}; 