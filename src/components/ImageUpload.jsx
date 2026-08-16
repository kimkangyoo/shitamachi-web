import { useState, useRef } from 'react';
import './ImageUpload.css';

export default function ImageUpload() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const dragOverRef = useRef(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragOverRef.current = false;
    uploadFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    uploadFiles(e.target.files);
  };

  const uploadFiles = async (fileList) => {
    if (fileList.length === 0) return;

    setLoading(true);
    setMessage('');

    try {
      for (let file of fileList) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.success) {
          setFiles(prev => [...prev, data.filename]);
          setMessage(`✅ ${file.name} をアップロードしました`);
        } else {
          setMessage(`❌ エラー: ${data.error}`);
        }
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-card">
        <h2>📤 画像アップロード</h2>

        <div
          className="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-icon">📸</div>
          <p className="drop-text">ここにファイルをドラッグ&ドロップ</p>
          <p className="drop-subtext">または下のボタンをクリック</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? 'アップロード中...' : '📁 ファイル選択'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
            style={{ display: 'none' }}
          />
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {files.length > 0 && (
          <div className="uploaded-files">
            <h3>✅ アップロード済みファイル</h3>
            <div className="file-list">
              {files.map((file, idx) => (
                <div key={idx} className="file-item">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="info-box">
          <h3>📝 利用可能な形式</h3>
          <p>JPG, PNG, GIF, WebP などの画像形式に対応しています</p>
          <p>複数ファイルを一度にアップロードできます</p>
        </div>
      </div>
    </div>
  );
}
