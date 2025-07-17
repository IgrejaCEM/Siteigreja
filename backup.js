const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Criar nome do arquivo de backup com data e hora
const date = new Date();
const timestamp = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
const backupFileName = `backup_igreja_${timestamp}.zip`;

// Criar diretório de backups se não existir
const backupDir = 'backups';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Criar stream de escrita
const output = fs.createWriteStream(path.join(backupDir, backupFileName));
const archive = archiver('zip', {
  zlib: { level: 9 } // Nível máximo de compressão
});

// Eventos do archiver
output.on('close', () => {
  console.log(`Backup criado com sucesso: ${backupFileName}`);
  console.log(`Tamanho total: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data para o arquivo
archive.pipe(output);

// Adicionar arquivos ao backup
const dirsToBackup = [
  'backend/src',
  'backend/migrations',
  'frontend/src',
  'frontend/public',
  'uploads'
];

const filesToBackup = [
  'package.json',
  'package-lock.json',
  'README.md',
  'backend/package.json',
  'backend/package-lock.json',
  'frontend/package.json',
  'frontend/package-lock.json',
  'database.sqlite'
];

// Adicionar diretórios
dirsToBackup.forEach(dir => {
  if (fs.existsSync(dir)) {
    archive.directory(dir, dir);
  }
});

// Adicionar arquivos individuais
filesToBackup.forEach(file => {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
  }
});

// Finalizar o arquivo
archive.finalize(); 