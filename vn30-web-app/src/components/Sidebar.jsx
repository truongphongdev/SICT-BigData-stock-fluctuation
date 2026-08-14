import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useMarket();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Bảng Giá VN30', icon: 'table_chart' },
    { to: '/stock', label: 'Biểu Đồ Kỹ Thuật', icon: 'candlestick_chart' },
    { to: '/portfolio', label: 'Danh Mục Đầu Tư', icon: 'folder' },
    { to: '/news', label: 'Tin Tức Thị Trường', icon: 'newspaper' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-white border-r border-slate-200 flex flex-col py-5 px-3 z-50 select-none text-slate-700 shadow-sm">
      {/* App Brand */}
      <div className="mb-6 px-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-xl">trending_up</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">VN30 Analytics</h1>
            <p className="text-[11px] text-slate-400">Stock &amp; AI Platform</p>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);

          return (
            <Link 
              key={item.to}
              to={item.to} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800 truncate">{user.name || user.email}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
