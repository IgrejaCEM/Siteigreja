@echo off
echo Deploy final com todas as correções de banco de dados...
echo.

echo 1. Adicionando arquivos...
git add .

echo 2. Fazendo commit com todas as correções...
git commit -m "fix: Corrige todos os erros de banco de dados - constraint UNIQUE e tabelas existentes"

echo 3. Fazendo push...
git push

echo.
echo Deploy final enviado! O Render.com vai fazer o build automaticamente.
echo Aguarde alguns minutos para o deploy terminar.
pause 