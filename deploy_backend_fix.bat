@echo off
echo ========================================
echo   DEPLOY - CORREÇÃO COMPLETA DO BACKEND
echo ========================================
echo.

echo 1. Adicionando todos os arquivos...
git add .
echo.

echo 2. Criando commit com todas as correções...
git commit -m "fix: Corrige erros 500 do backend e adiciona scripts de diagnóstico"
echo.

echo 3. Enviando para o repositório remoto...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Próximos passos:
echo 1. Aguarde 3-5 minutos para o Render fazer o build
echo 2. Execute o diagnóstico: node backend/diagnosticar_backend.js
echo 3. Se necessário, execute: node verificar_admin.js
echo.
echo Problemas corrigidos:
echo - Melhorada geração de slugs
echo - Adicionada rota de health check
echo - Scripts de diagnóstico criados
echo - Verificação de usuário admin
echo.
pause 