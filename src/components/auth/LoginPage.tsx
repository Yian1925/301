import { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-shell">
      <div className="login-brand">
        <div className="login-brand-logo">
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 22H8L12 11L17 37L23 20L27 28L34 15L38 29L40 22H44" />
          </svg>
        </div>
        <div className="login-brand-text">MedGuide AI</div>
      </div>

      <div className="login-center">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1 className="login-title">登录您的账户</h1>

          <label className="login-field">
            <span className="login-label">邮箱</span>
            <input
              type="email"
              className="login-input"
              placeholder="you@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="login-field">
            <div className="login-label-row">
              <span className="login-label">密码</span>
              <a className="login-forgot" href="#" onClick={(e) => e.preventDefault()}>忘记密码?</a>
            </div>
            <div className="login-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </label>

          <button type="submit" className="login-submit">登录</button>

          <div className="login-footer">
            还没有账户? <a className="login-link" href="#" onClick={(e) => e.preventDefault()}>立即注册</a>
          </div>
        </form>
      </div>
    </div>
  );
}
