import { useState, useEffect } from 'react';
import './FileManager.css';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setFiles(data.sort((a, b) => b.modified.localeCompare(a.modified)));
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.html')) return '📄';
    if (filename.endsWith('.php')) return '⚙️';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return '🖼️';
    if (filename.endsWith('.png')) return '🖼️';
    if (filename.endsWith('.gif')) return '🖼️';
    return '📁';
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toUpperCase();
    return ext;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="file-manager">
      <div className="manager-header">
        <h2>📁 ファイル管理</h2>
        <button className="btn btn-secondary" onClick={loadFiles} disabled={loading}>
          {loading ? '更新中...' : '🔄 更新'}
        </button>
      </div>

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : (
        <div className="file-table-container">
          <table className="file-table">
            <thead>
              <tr>
                <th>ファイル名</th>
                <th>種類</th>
                <th>サイズ</th>
                <th>更新日時</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty">ファイルがありません</td>
                </tr>
              ) : (
                files.map(file => (
                  <tr key={file.name}>
                    <td className="name-cell">
                      <span className="file-icon">{getFileIcon(file.name)}</span>
                      <span className="file-name">{file.name}</span>
                    </td>
                    <td className="type-cell">
                      <span className="file-type">{getFileType(file.name)}</span>
                    </td>
                    <td className="size-cell">{formatSize(file.size)}</td>
                    <td className="date-cell">{formatDate(file.modified)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">📊 ファイル数</span>
          <span className="stat-value">{files.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">💾 総容量</span>
          <span className="stat-value">
            {formatSize(files.reduce((acc, f) => acc + f.size, 0))}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🖼️ 画像</span>
          <span className="stat-value">
            {files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f.name)).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">📄 HTML</span>
          <span className="stat-value">
            {files.filter(f => f.name.endsWith('.html')).length}
          </span>
        </div>
      </div>
    </div>
  );
}
