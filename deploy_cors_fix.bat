@echo off
echo ========================================
echo   DEPLOY - CORREÇÃO CORS E AUTENTICAÇÃO
echo ========================================
echo.

echo 1. Adicionando correções de CORS...
git add .
echo.

echo 2. Commit das correções...
git commit -m "fix: Corrige CORS e middleware de autenticação para resolver erros de cross-origin"
echo.

echo 3. Enviando para o repositório...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Problemas corrigidos:
echo ✅ CORS configurado corretamente para igrejacemchurch.org
echo ✅ Headers CORS adicionais garantidos
echo ✅ Middleware de autenticação melhorado
echo ✅ Logs detalhados adicionados
echo.
echo Aguarde 3-5 minutos para o Render fazer o build.
echo Depois teste novamente o login e criação de eventos.
echo.
pause 