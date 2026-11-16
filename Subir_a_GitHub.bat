@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo =========================================================
echo   NEXATECH - SUBIENDO NEXAPH PRO A GITHUB (jonnatthan)
echo =========================================================
echo.
echo Se abrira tu navegador para autorizar tu cuenta de GitHub...
echo.
git tag -f v1.4.0
git push -u origin main --tags --force
echo.
echo =========================================================
if %ERRORLEVEL% EQU 0 (
  echo   EXITO! El proyecto ya quedo subido en:
  echo   https://github.com/jonnatthan/nexaph-pro
  start "" "https://github.com/jonnatthan/nexaph-pro/releases/new?tag=v1.4.0&title=NexaPH+Pro+v1.4.0"
) else (
  echo   No se pudo completar la subida. Verifica tu sesion de GitHub.
)
echo =========================================================
pause
