@echo off
echo.
echo =============================================
echo    🚀 DEPLOY AUTOMATICO KOKUA SURF FARM
echo =============================================
echo.
echo Questo script carica automaticamente tutti i file
echo modificati su Netlify senza drag & drop!
echo.

REM Controlla se netlify CLI è installato
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Netlify CLI non installato. Installazione...
    npm install -g netlify-cli
)

echo 🔄 Caricamento files...
netlify deploy --prod --dir .

echo.
echo ✅ Deploy completato!
echo 👉 Il tuo sito è aggiornato su: https://kokua-surf-farm.netlify.app
echo.
pause
