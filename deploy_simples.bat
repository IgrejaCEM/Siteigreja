@echo off
echo Deploy iniciado...
git add .
git commit -m "fix: Melhora criação de eventos com logs detalhados"
git push
echo Deploy concluído!
pause 