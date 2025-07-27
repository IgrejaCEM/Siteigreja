@echo off
echo Deploy definitivo - Correção final do banco de dados...
echo.

echo 1. Adicionando arquivos...
git add .

echo 2. Fazendo commit com correção definitiva...
git commit -m "fix: Correção definitiva - Remove verificações hasTable e usa apenas try-catch"

echo 3. Fazendo push...
git push

echo.
echo Deploy definitivo enviado! O Render.com vai fazer o build automaticamente.
echo Aguarde alguns minutos para o deploy terminar.
echo.
echo Esta deve ser a correção final!
pause 