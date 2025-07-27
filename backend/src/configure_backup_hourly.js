const fs = require('fs');
const path = require('path');

function configureBackupHourly() {
  try {
    console.log('🕐 Configurando backup a cada hora...');
    
    // Backup a cada hora (24x por dia)
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
    name: database-backup-hourly
    env: node
    schedule: "0 * * * *"
    buildCommand: npm install
    startCommand: cd /opt/render/project/src && npm run backup
    envVars:
      - key: NODE_ENV
        value: production
`;

    fs.writeFileSync('render.yaml', renderConfig);
    
    console.log('✅ Configuração de backup a cada hora criada!');
    console.log('');
    console.log(' Backup será executado nos horários:');
    console.log('  00:00, 01:00, 02:00, 03:00, 04:00, 05:00, 06:00, 07:00, 08:00, 09:00, 10:00, 11:00');
    console.log('  12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00');
    console.log('');
    console.log('📊 Configuração:');
    console.log('  - 24 backups por dia');
    console.log('  - 1 backup por hora');
    console.log('  - 24 horas de proteção contínua');
    console.log('  - Máximo 24 backups mantidos (1 dia completo)');
    console.log('');
    console.log('💡 Vantagens:');
    console.log('  - Proteção adequada dos dados');
    console.log('  - Horários fixos e previsíveis');
    console.log('  - Economia de recursos');
    console.log('  - Fácil monitoramento');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. git add .');
    console.log('2. git commit -m "feat: configurar backup a cada hora (00:00-23:00)"');
    console.log('3. git push origin main');
    console.log('4. O Render atualizará automaticamente o cron job');
    
  } catch (error) {
    console.error('❌ Erro ao configurar:', error);
  }
}

configureBackupHourly(); 