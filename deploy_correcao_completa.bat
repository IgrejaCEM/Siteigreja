@echo off
echo ========================================
echo DEPLOY COMPLETO COM CORREÇÕES
echo ========================================

echo.
echo [1/4] Verificando configurações do Mercado Pago...
cd backend
node verificar_config_mercadopago.js
if %errorlevel% neq 0 goto :error

echo.
echo [2/4] Fazendo backup do banco antes das alterações...
copy database.sqlite database.sqlite.backup.%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%.sqlite

echo.
echo [3/4] Corrigindo estrutura do banco local...
node corrigir_tabela_registrations.js
if %errorlevel% neq 0 goto :error

echo.
echo [4/4] Fazendo deploy para produção...
git add .
git commit -m "Fix: Corrigir configuração Mercado Pago e estrutura tabela registrations"
git push origin main

echo.
echo ========================================
echo ✅ DEPLOY CONCLUÍDO COM SUCESSO!
echo ========================================
echo.
echo 📋 Próximos passos:
echo 1. Aguardar deploy no Render (aprox. 2-3 minutos)
echo 2. Verificar logs do Render para confirmar que não há erros
echo 3. Testar a inscrição em: https://igrejacemchurch.org
echo.
pause
goto :end

:error
echo.
echo ========================================
echo ❌ ERRO NO DEPLOY!
echo ========================================
echo Verifique os erros acima e tente novamente.
pause

:end 