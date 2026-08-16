@echo off
chcp 65001 >nul

echo 🎬 下町きろく 管理ダッシュボード を起動しています...

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 依存関係をインストール中...
    call npm install
)

REM Run Electron development mode
call npm run electron-dev

pause
