const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const ROOT = __dirname;
const EDITABLE_EXTS = ['.html', '.css', '.js', '.php'];

app.use(express.json({ limit: '5mb' }));
app.use(express.text({ limit: '5mb' }));

// Editor UI
app.get('/__editor', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>ライブエディタ</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; background: #1e1e1e; color: #ccc; }
  #toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #2d2d2d; border-bottom: 1px solid #444; flex-shrink: 0; }
  #toolbar select { padding: 4px 8px; border-radius: 4px; border: 1px solid #555; background: #3c3c3c; color: #ccc; font-size: 14px; }
  #toolbar button { padding: 4px 14px; border-radius: 4px; border: none; cursor: pointer; font-size: 14px; }
  #saveBtn { background: #0e7a0e; color: #fff; }
  #saveBtn:hover { background: #13a013; }
  #status { font-size: 13px; color: #aaa; margin-left: 8px; }
  #main { display: flex; flex: 1; overflow: hidden; }
  #editor { flex: 1; background: #1e1e1e; color: #d4d4d4; font-family: monospace; font-size: 14px; line-height: 1.5; padding: 12px; border: none; resize: none; outline: none; border-right: 1px solid #444; tab-size: 2; }
  #preview { flex: 1; background: #fff; border: none; }
</style>
</head>
<body>
<div id="toolbar">
  <label>ファイル:</label>
  <select id="fileSelect"></select>
  <button id="saveBtn">保存</button>
  <span id="status"></span>
</div>
<div id="main">
  <textarea id="editor" spellcheck="false"></textarea>
  <iframe id="preview"></iframe>
</div>
<script>
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const fileSelect = document.getElementById('fileSelect');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

let previewTimer;

async function loadFiles() {
  const res = await fetch('/__api/files');
  const files = await res.json();
  fileSelect.innerHTML = files.map(f => \`<option value="\${f}">\${f}</option>\`).join('');
  if (files.length) loadFile(files[0]);
}

async function loadFile(name) {
  const res = await fetch('/__api/file?name=' + encodeURIComponent(name));
  editor.value = await res.text();
  updatePreview();
  status.textContent = '';
}

function updatePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    const file = fileSelect.value;
    if (file.endsWith('.html')) {
      preview.srcdoc = editor.value;
    } else {
      preview.srcdoc = '<pre style="padding:12px;font-size:14px">' + editor.value.replace(/</g,'&lt;') + '</pre>';
    }
  }, 300);
}

saveBtn.addEventListener('click', async () => {
  const res = await fetch('/__api/file?name=' + encodeURIComponent(fileSelect.value), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: editor.value
  });
  status.textContent = res.ok ? '✓ 保存しました' : '✗ 失敗';
  setTimeout(() => status.textContent = '', 2000);
});

fileSelect.addEventListener('change', () => loadFile(fileSelect.value));
editor.addEventListener('input', updatePreview);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveBtn.click();
  }
});

loadFiles();
</script>
</body>
</html>`);
});

// API: list editable files
app.get('/__api/files', (req, res) => {
  const files = fs.readdirSync(ROOT).filter(f =>
    EDITABLE_EXTS.includes(path.extname(f).toLowerCase())
  ).sort();
  res.json(files);
});

// API: read file
app.get('/__api/file', (req, res) => {
  const name = path.basename(req.query.name || '');
  const fp = path.join(ROOT, name);
  if (!fs.existsSync(fp)) return res.status(404).send('Not found');
  res.type('text/plain').send(fs.readFileSync(fp, 'utf8'));
});

// API: write file
app.post('/__api/file', (req, res) => {
  const name = path.basename(req.query.name || '');
  const fp = path.join(ROOT, name);
  fs.writeFileSync(fp, req.body, 'utf8');
  res.send('ok');
});

// Serve site files
app.use(express.static(ROOT));

const PORT = 3000;
app.listen(PORT, () => console.log(`Editor: http://localhost:${PORT}/__editor`));
