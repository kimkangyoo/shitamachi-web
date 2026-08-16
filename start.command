#!/bin/bash

# 下町きろく 管理ダッシュボード - ダブルクリック起動スクリプト（Mac用）

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
    open https://nodejs.org/ 2>/dev/null
    echo "インストール後、もう一度このファイルをダブルクリックしてください。"
    echo ""
    read -p "Enterキーを押すとこの画面を閉じます..."
    exit 1
fi

echo "✅ Node.js が見つかりました（$(node -v)）"
echo ""

# 初回のみ依存関係をインストール
if [ ! -d "node_modules" ]; then
    echo "📦 初回セットアップ中です。2〜3分ほどお待ちください..."
    echo "   （この画面は閉じないでください）"
    echo ""
    if ! npm install; then
        echo ""
        echo "❌ セットアップに失敗しました。上のエラー内容を確認してください。"
        echo ""
        read -p "Enterキーを押すとこの画面を閉じます..."
        exit 1
    fi
    echo ""
    echo "✅ セットアップ完了！"
    echo ""
fi

echo "🚀 アプリを起動しています..."
echo ""

# 既存のプロセスが残っていたら片付ける
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# バックエンドサーバーを起動
node server.js &
SERVER_PID=$!

sleep 2

# Viteサーバーを起動
npx vite --port 5173 &
VITE_PID=$!

sleep 3

# ブラウザで自動的に開く
open http://localhost:5173

echo "✅ ダッシュボードが開きました！"
echo "   （ブラウザが開かない場合は http://localhost:5173 を手動で開いてください）"
echo ""
echo "⚠️  終了する場合は、このウィンドウを閉じてください。"
echo ""

# プロセスをクリーンアップする trap
trap "kill $SERVER_PID $VITE_PID 2>/dev/null; exit" INT TERM EXIT

# サーバーを保持
wait
