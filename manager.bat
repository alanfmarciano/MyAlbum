@echo off
title Gerenciador do Servidor - Album 2.0
:menu
cls
echo ==============================================
echo       GERENCIADOR DO ALBUM DE FIGURINHAS
echo ==============================================
echo.
echo 1. Iniciar Servidor e Abrir Navegador
echo 2. Parar Servidor (Mata o processo na porta 10000)
echo 3. Reiniciar Servidor e Abrir Navegador (Recomendado)
echo 4. Instalar / Preparar Novo Computador
echo 5. Sair
echo.
echo ==============================================
set /p choice="Escolha uma opcao (1-5): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto install
if "%choice%"=="5" goto exit
goto menu

:start
echo.
set /p network="Deseja liberar o acesso na rede para outros dispositivos? (S/N): "
if /I "%network%"=="S" (
    echo Iniciando servidor Node.js e liberando acesso na rede...
    start "Servidor Album 2.0" cmd /k "npm run dev -- --host"
    echo Na tela do servidor voce vera o seu IP para compartilhar na rede.
) else (
    echo Iniciando servidor Node.js apenas localmente...
    start "Servidor Album 2.0" cmd /k "npm run dev"
)
echo.
echo Servidor foi iniciado em uma nova janela! 
echo O aplicativo estara disponivel neste computador em: http://localhost:10000/
echo Aguardando 3 segundos para o servidor ligar...
timeout /t 3 >nul
echo Abrindo o navegador...
start http://localhost:10000/
goto menu

:stop
echo.
echo Procurando servidor rodando na porta 10000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":10000" ^| find "LISTENING"') do (
    echo Encerrando processo %%a...
    taskkill /f /pid %%a >nul 2>&1
)
echo.
echo Servidor encerrado com sucesso!
timeout /t 2 >nul
goto menu

:restart
echo.
echo Parando servidores antigos...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":10000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 1 >nul
set /p network="Deseja liberar o acesso na rede para outros dispositivos? (S/N): "
if /I "%network%"=="S" (
    echo Iniciando novo servidor com acesso na rede...
    start "Servidor Album 2.0" cmd /k "npm run dev -- --host"
    echo Na tela do servidor voce vera o seu IP para compartilhar na rede.
) else (
    echo Iniciando novo servidor apenas localmente...
    start "Servidor Album 2.0" cmd /k "npm run dev"
)
echo Aguardando 3 segundos para o servidor ligar...
timeout /t 3 >nul
echo Abrindo o navegador...
start http://localhost:10000/
goto menu

:install
echo.
echo Verificando se o Node.js esta instalado...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no seu sistema!
    echo Por favor, baixe e instale o Node.js em: https://nodejs.org/
    echo Apos instalar, reinicie o computador ou abra este gerenciador novamente.
    pause
    goto menu
)
echo Node.js encontrado com sucesso!
echo.
echo Iniciando a instalacao das dependencias...
echo Isso pode demorar alguns minutos. Aguarde...
call npm install
echo.
echo Instalacao concluida com sucesso! O album esta pronto para rodar.
pause
goto menu

:exit
exit
