@echo off
echo Deploy final com correção do banco de dados...
echo.

echo 1. Adicionando arquivos...
git add .

echo 2. Fazendo commit com correção do banco...
git commit -m "fix: Corrige erro de constraint UNIQUE na criação do usuário admin"

echo 3. Fazendo push...
git push

echo.
echo Deploy final enviado! O Render.com vai fazer o build automaticamente.
echo Aguarde alguns minutos para o deploy terminar.
pause 