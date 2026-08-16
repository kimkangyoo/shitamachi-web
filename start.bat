@echo off
chcp 65001 >nul
title 下町きろく 管理ダッシュボード
cd /d "%~dp0"

echo.
echo  ============================================
echo   🎬 下町きろく 管理ダッシュボード
echo  ============================================
echo.

REM Node.js がインストールされているか確認
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Node.js がインストールされていません
    echo.
    echo  以下のサイトから Node.js をインストールしてください：
    echo  https://nodejs.org/
    echo.
    echo  インストール後、もう一度このファイルをダブルクリックしてください。
    echo.
    pause
    start https://nodejs.org/
    exit /b 1
)

REM 初回のみ依存関係をインストール
if not exist node_modules (
    echo  📦 初回セットアップ中です。少々お待ちください...
    echo     （この画面は閉じないでください）
    echo.
    call npm install >nul 2>nul
    echo  ✅ セットアップ完了！
    echo.
)

echo  🚀 アプリを起動しています...
echo.

REM バックエンドサーバーをバックグラウンドで起動
start /b "" node server.js

REM サーバーが起動するまで少し待つ
timeout /t 3 /nobreak >nul

REM Viteサーバーをバックグラウンドで起動
start /b "" npx vite --port 5173

REM さらに待ってからブラウザを開く
timeout /t 3 /nobreak >nul

REM ブラウザで自動的に開く
start http://localhost:5173

echo  ✅ ダッシュボードが開きました！
echo.
echo  このウィンドウは閉じないでください。
echo  終了する場合は、このウィンドウを閉じてください。
echo.

REM ウィンドウを開いたままにする
:loop
timeout /t 3600 /nobreak >nul
goto loop
