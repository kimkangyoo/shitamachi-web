# 🎬 下町きろく管理ダッシュボード - デスクトップアプリ版

通常のWebアプリケーションではなく、**スタンドアロンのデスクトップアプリ**になりました！

## 🚀 クイックスタート

### macOS / Linux

ターミナルを開いて以下を実行：

```bash
# プロジェクトフォルダに移動
cd shitamachi-web

# アプリを起動（初回は依存関係のインストールも自動実行）
./start.sh
```

### Windows

フォルダを開き、以下のファイルをダブルクリック：
```
start.bat
```

---

## 💻 アプリの使い方

### 初回起動時

1. `start.sh` （Mac/Linux）または `start.bat` （Windows）をダブルクリック
2. 📦 依存関係が自動インストールされます（初回のみ数分かかります）
3. 🎬 下町きろく 管理ダッシュボード ウィンドウが開きます

### 2回目以降

`start.sh` または `start.bat` をダブルクリックするだけで起動！

---

## 📋 機能

| 機能 | 説明 |
|-----|------|
| 🖼️ サイト確認 | 現在のサイトをプレビュー |
| 📤 画像アップロード | ドラッグ&ドロップで画像追加 |
| ✏️ コンテンツ編集 | HTML/テキストを直接編集 |
| 📁 ファイル管理 | 全ファイルの確認 |
| ⚙️ 設定 | FTP設定（初回のみ） |
| 🚀 自動アップロード | ボタン1クリックでサーバー更新 |

---

## ⚙️ 開発コマンド

### 開発モード（ブラウザ版）
```bash
npm run dev
# ブラウザが http://localhost:5173 で開きます
```

### Electronアプリ開発モード
```bash
npm run electron-dev
# デスクトップアプリが起動します
```

### アプリをビルド（配布用）

#### Windows インストーラー
```bash
npm run electron-build-win
# release/ フォルダに .exe インストーラーが生成されます
```

#### macOS
```bash
npm run electron-build-mac
# release/ フォルダに .dmg が生成されます
```

#### Linux
```bash
npm run electron-build-linux
# release/ フォルダに AppImage / deb が生成されます
```

#### 全プラットフォーム
```bash
npm run electron-build
# 現在のOS用にビルドします
```

---

## 📦 ビルド・配布

### 配布用アプリの作成

```bash
# フロントエンドをビルド
npm run build

# Electronアプリをビルド（インストーラー生成）
npm run electron-build-win    # Windows向け
npm run electron-build-mac    # macOS向け
npm run electron-build-linux  # Linux向け
```

生成されたファイル：
- **Windows**: `release/下町きろく 管理ダッシュボード Setup 1.0.0.exe`
- **macOS**: `release/下町きろく 管理ダッシュボード-1.0.0.dmg`
- **Linux**: `release/下町きろく-管理-ダッシュボード-1.0.0.AppImage`

このインストーラーを配布すれば、ユーザーはインストールして使用できます。

---

## 🎯 アプリの特徴

✨ **スタンドアロン実行**
- ターミナル不要でダブルクリック起動
- ユーザーフレンドリー

✨ **完全なファイルシステムアクセス**
- ローカルファイルの読み書き
- FTP設定の安全な保存

✨ **ネイティブメニュー**
- ファイル → 終了
- 編集 → コピー・ペースト
- 表示 → 開発者ツール

✨ **ウィンドウサイズ調整可能**
- リサイズ可能
- 最小サイズ: 800x600
- 推奨: 1400x900

---

## 🔧 トラブルシューティング

### アプリが起動しない

1. **node_modules がない場合**
   ```bash
   npm install
   ```

2. **ポート 3001, 5173 が使用中**
   ```bash
   # ポートを確認して終了
   lsof -i :3001
   kill -9 <PID>
   ```

3. **Electron が起動しない**
   ```bash
   npm run electron-dev
   ```
   ターミナルでエラーを確認

### FTP接続エラーが出る

1. さくらインターネットの接続情報を確認
2. ⚙️ 設定タブでホスト名、ユーザー名、パスワードを確認
3. ファイアウォール設定を確認

### ファイルが保存されない

1. フォルダの書き込み権限を確認
2. ディスク容量を確認
3. ファイル名に日本語を使用する場合は、UTF-8で保存されるか確認

---

## 📚 ファイル構成

```
shitamachi-web/
├── electron/
│   ├── main.js         ← Electronメインプロセス
│   └── preload.js      ← セキュリティ設定
├── src/                ← React ソースコード
├── public/             ← 静的ファイル
├── dist/               ← ビルド出力（自動生成）
├── release/            ← インストーラー出力（自動生成）
├── start.sh            ← Mac/Linux 起動スクリプト
├── start.bat           ← Windows 起動スクリプト
├── package.json        ← プロジェクト設定
└── vite.config.js      ← Vite 設定
```

---

## 🔐 セキュリティ

- ✅ FTP パスワードは AES-256 で暗号化
- ✅ ファイルはアプリデータフォルダに保存
- ✅ Node Integration は無効（安全性向上）
- ✅ Context Isolation を有効

---

## 📞 サポート

問題が発生した場合：

1. ターミナル/コマンドプロンプトでエラーを確認
2. `npm run electron-dev` でログを見る
3. README.md を参照

---

## 🎉 完成！

これでスタンドアロンのデスクトップアプリになりました！

- ✅ ワンクリックで起動
- ✅ ターミナル操作不要
- ✅ 配布用インストーラー作成可能
- ✅ 全プラットフォーム対応（Windows/Mac/Linux）

**ダッシュボードを起動して、サイト管理をしましょう！🚀**
