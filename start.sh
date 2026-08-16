#!/bin/bash

# 下町きろく 管理ダッシュボード - ダブルクリック起動スクリプト

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "============================================"
echo " 🎬 下町きろく 管理ダッシュボード"
echo "============================================"
echo ""

# Node.js がインストールされているか確認
if ! command -v node &> /dev/null; then
    echo "❌ Node.js がインストールされていません"
    echo ""
    echo "以下のサイトから Node.js をインストールしてください："
    echo "https://nodejs.org/"
    echo ""
    read -p "Enterキーを押すとNode.jsのサイトを開きます..."
    open https://nodejs.org/ 2>/dev/null || xdg-open https://nodejs.org/ 2>/dev/null
    exit 1
fi

# 初回のみ依存関係をインストール
if [ ! -d "node_modules" ]; then
    echo "📦 初回セットアップ中です。少々お待ちください..."
    echo "   （この画面は閉じないでください）"
    echo ""
    npm install > /dev/null 2>&1
    echo "✅ セットアップ完了！"
    echo ""
fi

echo "🚀 アプリを起動しています..."
echo ""

# バックエンドサーバーを起動
node server.js &
SERVER_PID=$!

sleep 2

# Viteサーバーを起動
npx vite --port 5173 &
VITE_PID=$!

sleep 3

# ブラウザで自動的に開く
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null || echo "ブラウザで http://localhost:5173 を開いてください"

echo "✅ ダッシュボードが開きました！"
echo ""
echo "終了する場合は、このウィンドウで Ctrl+C を押してください。"
echo ""

# プロセスをクリーンアップする trap
trap "kill $SERVER_PID $VITE_PID 2>/dev/null; exit" INT TERM

# サーバーを保持
wait
