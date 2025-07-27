@echo off
echo ========================================
echo   DEPLOY - FRONTEND CACHE BUSTING
echo ========================================
echo.

echo 1. Adicionando comentário para forçar deploy...
echo // Cache busting - $(date) >> frontend/src/App.jsx
git add .
echo.

echo 2. Commit do cache busting...
git commit -m "fix: Cache busting para resolver problemas de frontend"
echo.

echo 3. Enviando para o repositório...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Aguarde 2-3 minutos para o Vercel fazer o build.
echo Depois teste novamente o login e criação de eventos.
echo.
pause 