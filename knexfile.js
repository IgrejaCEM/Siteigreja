const path = require('path');

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './src/database/migrations'
  }
}; 