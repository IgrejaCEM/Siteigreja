@echo off
echo ========================================
echo   DEPLOY RÁPIDO - CORREÇÃO BACKEND
echo ========================================
echo.

echo 1. Adicionando arquivos...
git add .
echo.

echo 2. Commit das correções...
git commit -m "fix: Corrige CORS e autenticação - deploy rápido"
echo.

echo 3. Enviando para o repositório...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Aguarde 3 minutos e teste:
echo 1. Login: admin@admin.com / admin123
echo 2. Criar evento
echo 3. Verificar dashboard
echo.
echo Se ainda houver problemas, execute:
echo   node testar_queries.js
echo.
pause 