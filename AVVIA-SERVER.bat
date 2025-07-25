@echo off
echo.
echo ============================================
echo    🏄‍♂️ KOKUA SURF FARM - SERVER LOCALE
echo ============================================
echo.
echo Server avviato! Apri il browser su:
echo 👉 http://localhost:8000
echo.
echo Link pubblico: https://kokua-surf-farm.netlify.app
echo Per aggiornare online: ricarica file su Netlify
echo.
echo Premi CTRL+C per fermare il server
echo.
cd /d "%~dp0"
python -m http.server 8000 2>nul || (
    echo Python non trovato. Installazione automatica...
    pause
)
pause
