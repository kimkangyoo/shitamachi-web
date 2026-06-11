#!/bin/bash
cd "$(dirname "$0")"

# Node.jsのパスを通す
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# 依存パッケージがなければインストール
if [ ! -d "node_modules" ]; then
  echo "初回セットアップ中..."
  npm install
fi

# ポート3000が使用中なら解放
lsof -ti:3000 | xargs kill -9 2>/dev/null

# サーバー起動
node editor-server.js &
SERVER_PID=$!

# 少し待ってからブラウザを開く
sleep 1.5
open http://localhost:3000/__editor

# サーバーが終了するまで待機
wait $SERVER_PID
