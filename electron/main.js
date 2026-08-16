const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { Client } = require('basic-ftp');
const crypto = require('crypto');

let mainWindow;
let expressApp;
let server;

const ENCRYPTION_KEY = 'shitamachi-kiroku-2024-secret-key';
const CONFIG_FILE = path.join(app.getPath('userData'), '.ftp-config.json');

// Encryption helpers
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Create Express server
function createExpressServer() {
  const app = express();
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.cwd());
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });

  const upload = multer({ storage });

  app.use(cors());
  app.use(express.json());

  // FTP Config routes
  app.get('/api/ftp-config', (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        res.json({
          host: config.host,
          user: config.user,
          port: config.port || 21,
          isSaved: true
        });
      } else {
        res.json({ isSaved: false });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ftp-config', (req, res) => {
    try {
      const { host, user, password, port } = req.body;
      const config = {
        host,
        user,
        password: encrypt(password),
        port: port || 21
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      res.json({ success: true, message: 'FTP設定を保存しました' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload to FTP
  app.post('/api/upload-to-ftp', async (req, res) => {
    try {
      if (!fs.existsSync(CONFIG_FILE)) {
        return res.status(400).json({ error: 'FTP設定がまだ保存されていません' });
      }

      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      const password = decrypt(config.password);

      const client = new Client();
      const cwd = process.cwd();

      await client.access({
        host: config.host,
        user: config.user,
        password: password,
        port: config.port
      });

      const filesToUpload = fs.readdirSync(cwd).filter(file => {
        return file.endsWith('.html') || file.endsWith('.jpg') || file.endsWith('.jpeg') ||
               file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.php');
      });

      for (const file of filesToUpload) {
        const filePath = path.join(cwd, file);
        await client.uploadFrom(filePath, `/${file}`);
      }

      await client.close();

      res.json({
        success: true,
        message: `${filesToUpload.length}個のファイルをアップロードしました`,
        files: filesToUpload
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // File operations
  app.get('/api/files', (req, res) => {
    try {
      const cwd = process.cwd();
      const files = fs.readdirSync(cwd).filter(file => {
        return file.endsWith('.html') || file.endsWith('.jpg') || file.endsWith('.jpeg') ||
               file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.php');
      });

      const fileDetails = files.map(file => {
        const stats = fs.statSync(path.join(cwd, file));
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime
        };
      });

      res.json(fileDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/file/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'ファイルが見つかりません' });
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/file/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const { content } = req.body;
      const filePath = path.join(process.cwd(), filename);

      fs.writeFileSync(filePath, content, 'utf-8');
      res.json({ success: true, message: 'ファイルを保存しました' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/upload-image', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'ファイルがアップロードされていません' });
      }

      res.json({
        success: true,
        filename: req.file.filename,
        message: `${req.file.filename} をアップロードしました`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/preview', (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'index.html');
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(content);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Express server startup
function startExpressServer() {
  return new Promise((resolve) => {
    expressApp = createExpressServer();
    server = expressApp.listen(3001, () => {
      console.log('✅ バックエンドサーバー起動: http://localhost:3001');
      resolve();
    });
  });
}

app.on('ready', async () => {
  await startExpressServer();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Create menu
function createMenu() {
  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '終了',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            if (server) {
              server.close();
            }
            app.quit();
          }
        }
      ]
    },
    {
      label: ' 編集',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
