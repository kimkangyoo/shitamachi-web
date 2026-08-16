const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Client } = require('basic-ftp');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Encryption key (should be in .env in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'shitamachi-kiroku-2024-secret-key';

// Config file path
const CONFIG_FILE = '.ftp-config.json';

// Helper functions for encryption
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

// Routes

// Get FTP config (returns without password)
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

// Save FTP config
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

// Upload file to FTP
app.post('/api/upload-to-ftp', async (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return res.status(400).json({ error: 'FTP設定がまだ保存されていません' });
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    const password = decrypt(config.password);

    const client = new Client();

    // Connect to FTP
    await client.access({
      host: config.host,
      user: config.user,
      password: password,
      port: config.port
    });

    // Upload files
    const filesToUpload = fs.readdirSync('./').filter(file => {
      return file.endsWith('.html') || file.endsWith('.jpg') || file.endsWith('.jpeg') ||
             file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.php');
    });

    for (const file of filesToUpload) {
      const filePath = path.join('./', file);
      await client.uploadFrom(filePath, `/${file}`);
      console.log(`Uploaded: ${file}`);
    }

    await client.close();

    res.json({
      success: true,
      message: `${filesToUpload.length}個のファイルをアップロードしました`,
      files: filesToUpload
    });
  } catch (error) {
    console.error('FTP Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file list
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync('./').filter(file => {
      return file.endsWith('.html') || file.endsWith('.jpg') || file.endsWith('.jpeg') ||
             file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.php');
    });

    const fileDetails = files.map(file => {
      const stats = fs.statSync(file);
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

// Get HTML file content
app.get('/api/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('./', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save HTML file content
app.post('/api/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const { content } = req.body;
    const filePath = path.join('./', filename);

    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true, message: 'ファイルを保存しました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
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

// Get site preview (serve the current index.html)
app.get('/api/preview', (req, res) => {
  try {
    const content = fs.readFileSync('./index.html', 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 下町きろく管理ダッシュボード API - http://localhost:${PORT}`);
  console.log('Claude Codeで http://localhost:5173 を開いてください');
});
