import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Login() {
  const [email, setEmail] = useState('investor@vn30alpha.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useMarket();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('investor@vn30alpha.ai', 'password123');
      navigate('/');
    } catch {
      setError('Không thể đăng nhập tài khoản demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 py-12 text-slate-800">
      <div className="w-full max-w-md">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 mb-3 shadow-sm">
            <span className="material-symbols-outlined text-2xl">trending_up</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">VN30 Stock Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống phân tích kỹ thuật &amp; dự báo xu hướng AI</p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Login */}
          <button 
            type="button" 
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span>Đăng nhập nhanh (Tài khoản Demo)</span>
          </button>

          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-medium absolute">hoặc email</span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email">
                Địa chỉ Email
              </label>
              <input 
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-700" htmlFor="password">
                  Mật khẩu
                </label>
              </div>
              <input 
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-100 border border-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                Đăng ký ngay
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}