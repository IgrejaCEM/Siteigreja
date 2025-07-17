const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Criar instância do chalk
const log = {
  separator: chalk.dim,
  blue: chalk.blue,
  cyan: chalk.cyan,
  white: chalk.white,
  yellow: chalk.yellow,
  green: chalk.green,
  red: chalk.red,
  magenta: chalk.magenta,
  gray: chalk.dim,
  bold: {
    blue: chalk.blue.bold,
    green: chalk.green.bold,
    red: chalk.red.bold
  }
};

class DebugLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
    
    // Arquivo de log para queries SQL
    this.sqlLogStream = fs.createWriteStream(
      path.join(this.logDir, 'sql-debug.log'),
      { flags: 'a' }
    );
    
    // Arquivo de log para requisições HTTP
    this.httpLogStream = fs.createWriteStream(
      path.join(this.logDir, 'http-debug.log'),
      { flags: 'a' }
    );
    
    // Arquivo de log para erros
    this.errorLogStream = fs.createWriteStream(
      path.join(this.logDir, 'error-debug.log'),
      { flags: 'a' }
    );

    // Contador para requisições
    this.requestCount = 0;
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  timestamp() {
    return new Date().toISOString();
  }

  printSeparator() {
    console.log(log.separator('─'.repeat(100)));
  }

  // Log de queries SQL
  logQuery(query, bindings, duration) {
    const logEntry = {
      timestamp: this.timestamp(),
      type: 'SQL_QUERY',
      query,
      bindings,
      duration: duration ? `${duration}ms` : 'N/A'
    };

    // Console logging aprimorado
    this.printSeparator();
    console.log(log.bold.blue('📊 SQL QUERY'));
    console.log(log.gray('Timestamp:'), this.timestamp());
    console.log(log.white('Query:'), query);
    if (bindings && bindings.length > 0) {
      console.log(log.cyan('Parameters:'), JSON.stringify(bindings, null, 2));
    }
    console.log(log.yellow('Duration:'), duration ? `${duration}ms` : 'N/A');
    this.printSeparator();
    
    this.sqlLogStream.write(`${JSON.stringify(logEntry, null, 2)}\n`);
  }

  // Log de requisições HTTP
  logRequest(req, res, duration) {
    this.requestCount++;

    // Garantir que os objetos existam
    const query = req.query || {};
    const body = req.body || {};
    const params = req.params || {};
    const headers = req.headers || {};
    const responseHeaders = res.getHeaders ? res.getHeaders() : {};

    const logEntry = {
      timestamp: this.timestamp(),
      type: 'HTTP_REQUEST',
      method: req.method || 'UNKNOWN',
      url: req.url || '/',
      headers,
      body,
      query,
      params,
      duration: duration ? `${duration}ms` : 'N/A',
      statusCode: res.statusCode,
      responseHeaders
    };

    // Console logging aprimorado
    this.printSeparator();
    console.log(log.bold.green(`🌐 HTTP REQUEST #${this.requestCount}`));
    console.log(log.gray('Timestamp:'), this.timestamp());
    console.log(log.white(`${logEntry.method} ${logEntry.url}`));
    console.log(log.cyan('Status:'), this.colorizeStatus(res.statusCode), res.statusCode);
    console.log(log.yellow('Duration:'), duration ? `${duration}ms` : 'N/A');
    
    if (Object.keys(query).length > 0) {
      console.log(log.magenta('Query Params:'), JSON.stringify(query, null, 2));
    }
    
    if (Object.keys(body).length > 0) {
      console.log(log.blue('Body:'), JSON.stringify(body, null, 2));
    }
    
    if (Object.keys(params).length > 0) {
      console.log(log.cyan('Route Params:'), JSON.stringify(params, null, 2));
    }
    this.printSeparator();
    
    this.httpLogStream.write(`${JSON.stringify(logEntry, null, 2)}\n`);
  }

  // Colorização do status HTTP
  colorizeStatus(status) {
    if (status >= 500) return log.red('■');
    if (status >= 400) return log.yellow('■');
    if (status >= 300) return log.cyan('■');
    if (status >= 200) return log.green('■');
    return log.gray('■');
  }

  // Log de erros
  logError(error, context = {}) {
    const logEntry = {
      timestamp: this.timestamp(),
      type: 'ERROR',
      message: error.message,
      stack: error.stack,
      context
    };

    // Console logging aprimorado
    this.printSeparator();
    console.log(log.bold.red('❌ ERROR'));
    console.log(log.gray('Timestamp:'), this.timestamp());
    console.log(log.red('Message:'), error.message);
    
    if (Object.keys(context).length > 0) {
      console.log(log.yellow('Context:'), JSON.stringify(context, null, 2));
    }
    
    console.log(log.gray('Stack Trace:'));
    console.log(log.gray(error.stack));
    this.printSeparator();
    
    this.errorLogStream.write(`${JSON.stringify(logEntry, null, 2)}\n`);
  }

  // Middleware para Express
  requestLoggerMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Intercepta o fim da resposta
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logRequest(req, res, duration);
      });
      
      next();
    };
  }

  // Wrapper para Knex usando eventos
  wrapKnex(knex) {
    // Adiciona event listeners para queries
    knex.on('query', (query) => {
      query.__startTime = Date.now();
    });

    knex.on('query-response', (response, query) => {
      const duration = Date.now() - (query.__startTime || Date.now());
      this.logQuery(query.sql, query.bindings, duration);
    });

    knex.on('query-error', (error, query) => {
      const duration = Date.now() - (query.__startTime || Date.now());
      this.logError(error, {
        query: query.sql,
        bindings: query.bindings,
        duration: `${duration}ms`
      });
    });

    return knex;
  }
}

// Instância singleton
const debugLogger = new DebugLogger();

module.exports = debugLogger; 