#!/bin/bash

# 下町きろく 管理ダッシュボード スタートスクリプト

echo "🎬 下町きろく 管理ダッシュボード を起動しています..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install
fi

# Run Electron development mode
npm run electron-dev
