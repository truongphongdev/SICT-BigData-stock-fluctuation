import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useMarket();

  const handleAuthAction = () => {
    if (user) {
      logout();
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container border-r border-outline-variant flex flex-col py-6 px-4 z-50 shadow-md">
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-3xl sparkle-float" style={{ "fontVariationSettings": "'FILL' 1" }}>monitoring</span>
          <div>
            <h1 className="font-headline-md text-xl font-extrabold text-on-surface tracking-tight">VN30 BI</h1>
            <p className="text-primary font-bold text-[10px] uppercase tracking-widest">Alpha AI System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 font-bold text-sm">
        <Link 
          to="/" 
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
            location.pathname === '/' 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 font-extrabold' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span>Dashboard Bảng Giá</span>
        </Link>

        <Link 
          to="/stock" 
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
            location.pathname.startsWith('/stock') 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 font-extrabold' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">candlestick_chart</span>
          <span>Biểu Đồ Kỹ Thuật</span>
        </Link>

        <Link 
          to="/portfolio" 
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
            location.pathname === '/portfolio' 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 font-extrabold' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          <span>Danh Mục Trợ Lý AI</span>
        </Link>

        <Link 
          to="/news" 
          className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
            location.pathname === '/news' 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 font-extrabold' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ "fontVariationSettings": "'FILL' 1" }}>auto_awesome_mosaic</span>
          <span>Tin Tức &amp; Báo Cáo AI</span>
          <span className="ml-auto px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded-md font-black border border-amber-500/40">HOT</span>
        </Link>
      </nav>

      <div className="mt-auto space-y-4">
        {user && (
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-xs space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-tighter text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span> VIP PRO ALPHA
              </span>
              <span className="w-2 h-2 rounded-full bg-market-up animate-ping"></span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-tight font-medium">
              Bạn đang nhận tín hiệu sóng thanh khoản Realtime không trễ từ sàn.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-outline-variant space-y-1 text-sm font-bold">
          <button 
            onClick={() => alert('Cấu hình cảnh báo: Khớp lệnh âm thanh ON, Đèn báo Flash Xanh/Đỏ ON.')}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
            <span>Cài đặt hệ thống</span>
          </button>

          <button 
            onClick={handleAuthAction}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all ${
              user 
                ? 'text-error/80 hover:text-error hover:bg-error/15' 
                : 'text-primary hover:bg-primary/15'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{user ? 'logout' : 'login'}</span>
            <span>{user ? 'Đăng xuất' : 'Đăng nhập VIP'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
