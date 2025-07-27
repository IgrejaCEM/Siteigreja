@echo off
echo ========================================
echo   DEPLOY FINAL - CORREÇÃO COMPLETA
echo ========================================
echo.

echo 1. Adicionando todos os arquivos corrigidos...
git add .
echo.

echo 2. Criando commit com todas as correções...
git commit -m "fix: Correção completa - CORS, autenticação e queries SQL"
echo.

echo 3. Enviando para o repositório remoto...
git push
echo.

echo ========================================
echo  DEPLOY ENVIADO!
echo ========================================
echo.
echo Problemas corrigidos:
echo ✅ CORS configurado para igrejacemchurch.org
echo ✅ Middleware de autenticação ativado
echo ✅ Headers CORS conflitantes removidos
echo ✅ Helmet configurado para CORS
echo ✅ Queries SQL otimizadas
echo ✅ Scripts de diagnóstico criados
echo.
echo Próximos passos:
echo 1. Aguarde 3-5 minutos para o Render fazer o build
echo 2. Execute: node verificar_backend_simples.js
echo 3. Execute: node testar_queries.js
echo 4. Teste o login e criação de eventos
echo.
echo Credenciais do admin:
echo   Email: admin@admin.com
echo   Senha: admin123
echo.
pause 