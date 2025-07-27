@echo off
echo Deploy da correção do slug...
echo.

echo 1. Adicionando todos os arquivos para o commit...
git add .
echo.

echo 2. Criando o commit com a mensagem da correção...
git commit -m "fix: Melhora a geração de slugs e adiciona script de correção"
echo.

echo 3. Enviando as alterações para o repositório remoto...
git push
echo.

echo -----------------------------------------------------------------
echo  DEPLOY ENVIADO!
echo  O Render.com irá iniciar o build automaticamente.
echo  Aguarde alguns minutos e depois execute o script de correção.
echo -----------------------------------------------------------------
echo.
pause 