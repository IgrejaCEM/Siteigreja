@echo off
echo ========================================
echo   DEPLOY - CORREÇÃO CRIAÇÃO DE EVENTOS
echo ========================================
echo.

echo 1. Adicionando correções...
git add .
echo.

echo 2. Commit das correções...
git commit -m "fix: Adiciona logs detalhados e melhora criação de eventos"
echo.

echo 3. Enviando para o repositório...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Aguarde 3 minutos e teste criar evento novamente.
echo.
echo Se ainda falhar, execute:
echo   node testar_criar_evento.js
echo.
echo Para ver os logs do backend, acesse o Render.
echo.
pause 