@echo off
echo ========================================
echo   DEPLOY - CORREÇÃO CORS E AUTENTICAÇÃO
echo ========================================
echo.

echo 1. Adicionando arquivos corrigidos...
git add .
echo.

echo 2. Criando commit com as correções...
git commit -m "fix: Corrige CORS e middleware de autenticação para resolver erros 500"
echo.

echo 3. Enviando para o repositório remoto...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Problemas corrigidos:
echo ✅ CORS configurado corretamente para igrejacemchurch.org
echo ✅ Middleware de autenticação ativado
echo ✅ Headers CORS conflitantes removidos
echo ✅ Helmet configurado para permitir CORS
echo.
echo Aguarde 3-5 minutos para o Render fazer o build.
echo Depois teste novamente o login e criação de eventos.
echo.
pause 