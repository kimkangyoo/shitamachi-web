import { useState, useEffect } from 'react';
import './App.css';
import FTPConfig from './components/FTPConfig';
import SitePreview from './components/SitePreview';
import ImageUpload from './components/ImageUpload';
import ContentEditor from './components/ContentEditor';
import FileManager from './components/FileManager';

function App() {
  const [activeTab, setActiveTab] = useState('preview');
  const [ftpConfigured, setFtpConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkFTPConfig();
  }, []);

  const checkFTPConfig = async () => {
    try {
      const res = await fetch('/api/ftp-config');
      const data = await res.json();
      setFtpConfigured(data.isSaved);
    } catch (error) {
      console.error('Error checking FTP config:', error);
    }
  };

  const handleUploadToFTP = async () => {
    if (!ftpConfigured) {
      setMessage('⚠️ まずFTP設定を保存してください');
      setActiveTab('settings');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/upload-to-ftp', {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
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
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🎬 下町きろく 管理ダッシュボード</h1>
          <p>サイト管理・更新ツール</p>
        </div>

        <div className="header-actions">
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleUploadToFTP}
            disabled={loading || !ftpConfigured}
          >
            {loading ? '🔄 アップロード中...' : '🚀 さくらインターネットに更新'}
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          🖼️ サイト確認
        </button>
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 画像アップロード
        </button>
        <button
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          ✏️ コンテンツ編集
        </button>
        <button
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 ファイル管理
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ 設定
        </button>
      </div>

      <div className="content">
        {activeTab === 'preview' && <SitePreview />}
        {activeTab === 'upload' && <ImageUpload />}
        {activeTab === 'editor' && <ContentEditor />}
        {activeTab === 'files' && <FileManager />}
        {activeTab === 'settings' && (
          <FTPConfig onConfigSaved={() => setFtpConfigured(true)} />
        )}
      </div>

      <footer className="footer">
        <p>© 2024 下町きろく 管理ダッシュボード | Claude Code対応</p>
      </footer>
    </div>
  );
}

export default App;
