import { useState, useEffect } from 'react';
import './ContentEditor.css';

export default function ContentEditor() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      const htmlFiles = data.filter(f => f.name.endsWith('.html') || f.name.endsWith('.php'));
      setFiles(htmlFiles);
      if (htmlFiles.length > 0) {
        loadFileContent(htmlFiles[0].name);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const loadFileContent = async (filename) => {
    try {
      const res = await fetch(`/api/file/${filename}`);
      const data = await res.json();
      setContent(data.content);
      setSelectedFile(filename);
      setIsModified(false);
      setMessage('');
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsModified(true);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/file/${selectedFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${selectedFile} を保存しました`);
        setIsModified(false);
      } else {
        setMessage(`❌ エラー: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-editor">
      <div className="editor-sidebar">
        <h3>📄 ファイル一覧</h3>
        <div className="file-selector">
          {files.map(file => (
            <button
              key={file.name}
              className={`file-btn ${selectedFile === file.name ? 'active' : ''}`}
              onClick={() => loadFileContent(file.name)}
              disabled={isModified && selectedFile !== file.name}
              title={`${file.name} - ${(file.size / 1024).toFixed(2)}KB`}
            >
              {file.name.endsWith('.html') ? '📄' : '⚙️'} {file.name}
            </button>
          ))}
        </div>

        <div className="sidebar-info">
          <p className="info-label">💾 保存状態</p>
          <p className={isModified ? 'status modified' : 'status saved'}>
            {isModified ? '⚠️ 未保存' : '✅ 保存済み'}
          </p>
        </div>
      </div>

      <div className="editor-main">
        <div className="editor-header">
          <div>
            <h2>✏️ コンテンツ編集</h2>
            <p className="file-info">{selectedFile && `編集中: ${selectedFile}`}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isModified || loading}
          >
            {loading ? '保存中...' : '💾 保存'}
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="editor-container">
          <textarea
            value={content}
            onChange={handleContentChange}
            className="code-editor"
            placeholder="ファイルの内容がここに表示されます"
            spellCheck="false"
          />
        </div>

        <div className="editor-footer">
          <p>💡 HTMLを編集してサイトのコンテンツを更新できます</p>
          <p>保存後、サイト確認タブで変更を確認してください</p>
        </div>
      </div>
    </div>
  );
}
