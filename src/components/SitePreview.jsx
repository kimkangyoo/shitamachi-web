import { useState, useEffect } from 'react';
import './SitePreview.css';

export default function SitePreview() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="site-preview">
      <div className="preview-header">
        <h2>🖼️ サイトプレビュー</h2>
        <button className="btn btn-secondary" onClick={handleRefresh}>
          {loading ? '更新中...' : '🔄 更新'}
        </button>
      </div>

      <div className="preview-container">
        {loading && <div className="loader">読み込み中...</div>}
        <iframe
          key={refreshKey}
          src="/index.html"
          title="サイトプレビュー"
          className="preview-iframe"
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className="preview-info">
        <p>💡 コンテンツエディタで変更後、このボタンで確認できます</p>
      </div>
    </div>
  );
}
