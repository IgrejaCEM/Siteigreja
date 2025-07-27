@echo off
echo ========================================
echo   TESTE DE LOGIN LOCAL
echo ========================================
echo.

echo 1. Verificando se o backend está rodando...
echo    Testando: http://localhost:3005/api/auth/health
echo.

echo 2. Testando login com credenciais padrão:
echo    Email: admin@admin.com
echo    Senha: admin123
echo.

echo 3. Executando teste de banco de dados...
node backend/test_login_admin.js
echo.

echo 4. Executando teste de API...
node backend/test_api_login.js
echo.

echo ========================================
echo   TESTE CONCLUÍDO
echo ========================================
echo.
echo Se os testes passaram localmente, execute:
echo   deploy_login_fix.bat
echo.
pause 