import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useMarket();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Tự động đăng nhập luôn sau khi đăng ký
    login(email);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 relative overflow-hidden w-full h-full bg-background">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="candlestick-bg w-full h-full opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 w-full max-w-[460px] px-6">
        <div className="glass-panel rounded-3xl p-8 ai-glow flex flex-col items-center bg-surface border-2 border-outline-variant shadow-2xl shadow-primary/10">
          
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[42px] sparkle-float" style={{ "fontVariationSettings": "'FILL' 1" }}>auto_awesome</span>
              <h1 className="font-headline-md text-3xl font-extrabold tracking-tight text-on-surface">VN30 BI</h1>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">Khởi tạo Tài Khoản Đầu Tư AI Alpha Premium</p>
          </div>

          <form className="w-full space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="font-label-caps text-xs font-bold text-on-surface-variant block" htmlFor="name">HỌ VÀ TÊN</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">person</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium placeholder:text-on-surface-variant/50" 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A" 
                  type="text" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-caps text-xs font-bold text-on-surface-variant block" htmlFor="email">EMAIL TRUY CẬP</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium placeholder:text-on-surface-variant/50" 
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
              <label className="font-label-caps text-xs font-bold text-on-surface-variant block" htmlFor="password">MẬT KHẨU AN TOÀN</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-11 pr-10 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium placeholder:text-on-surface-variant/50" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  type="password" 
                  required 
                />
              </div>
            </div>

            <button className="w-full mt-2 bg-gradient-to-r from-primary via-primary-container to-primary hover:brightness-110 text-on-primary font-extrabold py-3.5 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 text-base" type="submit">
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              <span>Kích Hoạt Tài Khoản Ngay</span>
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-outline-variant w-full text-center">
            <p className="text-xs text-on-surface-variant">
              Đã có tài khoản? 
              <Link to="/login" className="text-primary font-black hover:underline ml-1.5 text-sm">Đăng nhập tại đây</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
