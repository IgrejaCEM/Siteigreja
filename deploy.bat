@echo off
echo Fazendo deploy para o Render.com...
echo.

echo 1. Adicionando arquivos...
git add .

echo 2. Fazendo commit...
git commit -m "feat: Adiciona rota para limpar dados de participantes"

echo 3. Fazendo push...
git push

echo.
echo Deploy concluído! O Render.com vai fazer o build automaticamente.
echo Aguarde alguns minutos para o deploy terminar.
pause 