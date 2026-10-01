@echo off
title CashFlow
cd /d "%~dp0"

if not exist "node_modules" (
  echo Instalando dependencias pela primeira vez...
  call npm install || goto :erro
)

echo Iniciando API (.NET) e Frontend (Angular)...
echo O navegador abre sozinho quando o frontend estiver pronto.
echo Para encerrar, feche esta janela ou pressione Ctrl+C.
echo.
call npm start
goto :eof

:erro
echo.
echo Falha ao instalar as dependencias. Verifique se o Node.js esta instalado.
pause
