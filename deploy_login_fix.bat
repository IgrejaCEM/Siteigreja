@echo off
echo ========================================
echo   DEPLOY - CORREÇÃO DO LOGIN ADMIN
echo ========================================
echo.

echo 1. Adicionando arquivos para o commit...
git add .
echo.

echo 2. Criando commit com as correções...
git commit -m "fix: Corrige problema de login admin e adiciona scripts de teste"
echo.

echo 3. Enviando para o repositório remoto...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Próximos passos:
echo 1. Aguarde 2-5 minutos para o Render fazer o build
echo 2. Execute o script de teste: node backend/test_login_admin.js
echo 3. Se necessário, execute: node backend/test_api_login.js
echo.
echo Credenciais padrão:
echo   Email: admin@admin.com
echo   Senha: admin123
echo.
pause 