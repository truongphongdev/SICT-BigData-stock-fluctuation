import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useMarket();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    login(email);
    navigate('/');
  };

  const handleDemoLogin = () => {
    login('investor@vn30alpha.ai');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 relative overflow-hidden w-full h-full bg-background">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="candlestick-bg w-full h-full opacity-20"></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 w-full max-w-[460px] px-6">
        <div className="glass-panel rounded-3xl p-8 ai-glow flex flex-col items-center bg-surface border-2 border-outline-variant shadow-2xl shadow-primary/10">
          
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[42px] sparkle-float" style={{ "fontVariationSettings": "'FILL' 1" }}>monitoring</span>
              <h1 className="font-headline-md text-3xl font-extrabold tracking-tight text-on-surface">VN30 BI</h1>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">Hệ thống Phân tích &amp; Giao dịch Chứng khoán AI Alpha</p>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-error/15 border border-error/40 rounded-xl text-error text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="button" 
            onClick={handleDemoLogin}
            className="w-full mb-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm"
          >
            <span className="material-symbols-outlined text-xl" style={{ "fontVariationSettings": "'FILL' 1" }}>electric_bolt</span>
            <span>Đăng nhập siêu tốc (Tài khoản VIP Demo)</span>
          </button>

          <div className="w-full flex items-center gap-4 my-2">
            <div className="h-[1px] flex-1 bg-outline-variant/60"></div>
            <span className="text-xs text-on-surface-variant uppercase font-extrabold tracking-widest">Hoặc Đăng nhập bằng Email</span>
            <div className="h-[1px] flex-1 bg-outline-variant/60"></div>
          </div>

          <form className="w-full space-y-4 mt-3" onSubmit={handleLogin}>
            
            <div className="space-y-1.5">
              <label className="font-label-caps text-xs font-bold text-on-surface-variant block" htmlFor="email">EMAIL TRUY CẬP</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-on-surface-variant/50 font-medium" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  type="email" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-xs font-bold text-on-surface-variant block" htmlFor="password">MẬT KHẨU</label>
                <a className="text-xs text-primary font-bold hover:underline transition-all" href="#forgot" onClick={(e) => { e.preventDefault(); alert('Với bản thử nghiệm, bạn có thể bấm "Đăng nhập siêu tốc (Tài khoản VIP Demo)" phía trên.'); }}>Quên mật khẩu?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-10 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-on-surface-variant/50 font-medium" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  type="password" 
                  required 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input className="w-4 h-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary-container" id="remember" type="checkbox" defaultChecked />
              <label className="text-xs text-on-surface-variant cursor-pointer select-none font-medium" htmlFor="remember">Ghi nhớ đăng nhập trong 30 ngày</label>
            </div>

            <button className="w-full bg-primary hover:brightness-110 text-on-primary font-extrabold py-3.5 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-base" type="submit">
              <span>Đăng nhập ngay</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-outline-variant w-full text-center">
            <p className="text-xs text-on-surface-variant">
              Chưa có tài khoản? 
              <Link to="/register" className="text-primary font-black hover:underline ml-1.5 text-sm">Đăng ký mới bản Premium</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center px-4 text-xs font-bold text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-market-up animate-ping"></span>
            <span>Dữ liệu VN30 Real-time (Active)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-surface-variant rounded text-primary">v2.4.0 Alpha</span>
          </div>
        </div>
      </main>
    </div>
  );
}