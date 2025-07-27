const fs = require('fs');
const path = require('path');

function setupRenderBackup() {
  try {
    console.log('⚙️ Configurando backup automático no Render...');
    
    // Criar arquivo render.yaml
    const renderConfig = `services:
  - type: web
    name: siteigreja-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MERCADOPAGO_ACCESS_TOKEN
        sync: false
      - key: MERCADOPAGO_PUBLIC_KEY
        sync: false
      - key: MERCADOPAGO_CLIENT_ID
        sync: false
      - key: MERCADOPAGO_CLIENT_SECRET
        sync: false
    volumes:
      - name: database-storage
        mountPath: /opt/render/project/src
        sourcePath: /opt/render/project/src

  - type: cron
    name: database-backup
    env: node
    schedule: "0 2 * * *"
    buildCommand: npm install
    startCommand: cd /opt/render/project/src && npm run backup
    envVars:
      - key: NODE_ENV
        value: production
`;

    fs.writeFileSync('render.yaml', renderConfig);
    console.log('✅ Arquivo render.yaml criado!');
    
    // Criar diretório de backups
    const backupDir = path.resolve('./backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('✅ Diretório backups criado!');
    }
    
    // Criar arquivo .gitignore para backups (opcional)
    const gitignorePath = path.resolve('./backups/.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = '# Manter apenas os últimos 5 backups\n*.sqlite\n!database_backup_*.sqlite';
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('✅ .gitignore para backups criado!');
    }
    
    console.log('🎯 Configuração do Render concluída!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Faça commit das mudanças: git add . && git commit -m "feat: adicionar sistema de backup automático"');
    console.log('2. Faça push: git push origin main');
    console.log('3. No painel do Render, verifique se o volume persistente está configurado');
    console.log('4. O backup automático será executado diariamente às 2h da manhã');
    
  } catch (error) {
    console.error('❌ Erro ao configurar:', error);
  }
}

setupRenderBackup(); 