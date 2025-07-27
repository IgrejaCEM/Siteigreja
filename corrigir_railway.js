const { Pool } = require('pg');

// Configuração do PostgreSQL Railway
const pool = new Pool({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function corrigirRailway() {
  console.log('🔧 Corrigindo banco PostgreSQL do Railway...');
  
  try {
    // 1. Verificar se a tabela transactions existe
    console.log('\n1️⃣ Verificando tabela transactions...');
    const transactionsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'transactions'
      );
    `);
    
    if (!transactionsExists.rows[0].exists) {
      console.log('📝 Criando tabela transactions...');
      await pool.query(`
        CREATE TABLE transactions (
          id SERIAL PRIMARY KEY,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          registration_code VARCHAR(255) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          gateway_payment_id VARCHAR(255),
          gateway_response JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela transactions criada');
    } else {
      console.log('ℹ️ Tabela transactions já existe');
    }
    
    // 2. Verificar colunas da tabela registrations
    console.log('\n2️⃣ Verificando colunas da tabela registrations...');
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registrations';
    `);
    
    const columnNames = columns.rows.map(row => row.column_name);
    console.log('📋 Colunas encontradas:', columnNames);
    
    // Verificar se address e cpf existem
    if (!columnNames.includes('address')) {
      console.log('🔧 Adicionando coluna address...');
      await pool.query('ALTER TABLE registrations ADD COLUMN address TEXT;');
    }
    
    if (!columnNames.includes('cpf')) {
      console.log('🔧 Adicionando coluna cpf...');
      await pool.query('ALTER TABLE registrations ADD COLUMN cpf TEXT;');
    }
    
    // 3. Comentar tabela tickets (não deletar, apenas comentar uso)
    console.log('\n3️⃣ Verificando tabela tickets...');
    const ticketsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tickets'
      );
    `);
    
    if (ticketsExists.rows[0].exists) {
      console.log('⚠️ Tabela tickets existe - será comentada no código');
    } else {
      console.log('ℹ️ Tabela tickets não existe');
    }
    
    // 4. Testar conexão
    console.log('\n4️⃣ Testando conexão...');
    const testResult = await pool.query('SELECT NOW() as current_time;');
    console.log('✅ Conexão OK:', testResult.rows[0].current_time);
    
    console.log('\n🎉 Banco PostgreSQL do Railway corrigido com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir Railway:', error);
  } finally {
    await pool.end();
  }
}

corrigirRailway(); 