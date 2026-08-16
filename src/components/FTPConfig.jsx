import { useState, useEffect } from 'react';
import './FTPConfig.css';

export default function FTPConfig({ onConfigSaved }) {
  const [formData, setFormData] = useState({
    host: '',
    user: '',
    password: '',
    port: 21
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/ftp-config');
      const data = await res.json();

      if (data.isSaved) {
        setFormData(prev => ({
          ...prev,
          host: data.host,
          user: data.user,
          port: data.port || 21
        }));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/ftp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ FTP設定を保存しました');
        setIsSaved(true);
        onConfigSaved();
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
    <div className="ftp-config">
      <div className="config-card">
        <h2>⚙️ FTP設定</h2>
        <p className="subtitle">さくらインターネットの接続情報を入力してください</p>

        {isSaved && (
          <div className="alert alert-success">
            ✅ FTP設定は保存されています。パスワードをリセットする場合のみ入力してください。
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="host">
              ホスト名 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="host"
              name="host"
              value={formData.host}
              onChange={handleChange}
              placeholder="例: sv123.sakura.ne.jp"
              required
            />
            <small>FTPサーバーのアドレス</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="user">
                ユーザー名 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="user"
                name="user"
                value={formData.user}
                onChange={handleChange}
                placeholder="例: username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="port">
                ポート番号
              </label>
              <input
                type="number"
                id="port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                placeholder="21"
                min="1"
                max="65535"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              パスワード <span className="required">*</span>
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="パスワード"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? '非表示' : '表示'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            <small>暗号化して保存されます</small>
          </div>

          {message && (
            <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '保存中...' : '💾 FTP設定を保存'}
          </button>
        </form>

        <div className="info-box">
          <h3>📝 設定方法</h3>
          <ol>
            <li>さくらインターネットのコントロールパネルにログイン</li>
            <li>FTP設定から接続情報を確認</li>
            <li>上記の情報を入力して保存</li>
            <li>以降は毎回パスワードを入力する必要がありません</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
