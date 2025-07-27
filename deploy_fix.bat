@echo off
echo Corrigindo deploy para o Render.com...
echo.

echo 1. Adicionando arquivos...
git add .

echo 2. Fazendo commit com correção...
git commit -m "fix: Remove sharp dependency to fix deploy error"

echo 3. Fazendo push...
git push

echo.
echo Deploy corrigido! O Render.com vai fazer o build automaticamente.
echo Aguarde alguns minutos para o deploy terminar.
pause 