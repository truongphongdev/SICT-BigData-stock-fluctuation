import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function TopHeader() {
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { stocks, user, logout } = useMarket();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Filter stocks dynamically as user types
  const searchResults = searchValue.trim() === '' ? [] : stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchValue.toLowerCase()) || 
    s.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    s.sector.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStock = (symbol) => {
    setSearchValue('');
    setShowDropdown(false);
    navigate(`/stock/${symbol}`);
  };

  const handleAiPredict = () => {
    navigate('/stock/FPT');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-surface/90 border-b border-outline-variant flex justify-between items-center h-16 px-6 backdrop-blur-md shadow-sm">
      {/* Search Box */}
      <div className="flex items-center gap-4 flex-1" ref={dropdownRef}>
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Tìm mã VN30 (FPT, HPG), ngành học..." 
            value={searchValue}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowDropdown(true);
            }}
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-11 pr-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/60 text-on-surface font-medium" 
          />
          {searchValue && (
            <button 
              onClick={() => { setSearchValue(''); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}

          {/* Instant Search Dropdown Results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-surface-container-high border border-outline-variant rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-outline-variant/30">
              <div className="px-4 py-2 bg-surface-container text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Gợi ý mã VN30 ({searchResults.length} kết quả)
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map(stock => (
                  <div 
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className="p-3.5 hover:bg-surface-variant transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        {stock.symbol}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{stock.name}</span>
                        <span className="text-[11px] text-on-surface-variant">{stock.sector}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`font-mono font-bold text-sm ${stock.change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                        {stock.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded mt-0.5 border border-primary/20">
                        {stock.aiSignal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showDropdown && searchValue.trim() !== '' && searchResults.length === 0 && (
            <div className="absolute top-12 left-0 w-full bg-surface-container-high border border-outline-variant rounded-xl p-4 text-center text-on-surface-variant text-sm shadow-xl z-50">
              Không tìm thấy mã cổ phiếu phù hợp với "<strong>{searchValue}</strong>".
            </div>
          )}
        </div>
      </div>

      {/* Right Side Control Buttons & User Avatar */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleAiPredict}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-extrabold text-sm shadow-md hover:brightness-110 transition-all active:scale-95 border border-primary/30"
        >
          <span className="material-symbols-outlined text-[20px] animate-pulse" style={{"fontVariationSettings":"'FILL' 1"}}>psychology</span>
          <span className="hidden sm:inline">Dự báo AI Alpha</span>
        </button>

        <button 
          onClick={() => alert('Hệ thống AI vừa gửi 2 thông báo: HPG bùng nổ thanh khoản; FPT vượt ngưỡng cản!')}
          className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-xl transition-all relative active:bg-surface-variant border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
          title="Cảnh báo sóng thị trường"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface animate-ping"></span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* User Auth Section */}
        <div className="relative" ref={userMenuRef}>
          {user ? (
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pl-3 bg-surface-container-high/70 hover:bg-surface-variant border border-outline-variant rounded-2xl cursor-pointer transition-all active:scale-95 select-none"
            >
              <div className="flex flex-col text-right hidden lg:flex">
                <span className="text-xs font-black text-on-surface leading-tight">{user.name}</span>
                <span className="text-[10px] text-amber-400 font-extrabold flex items-center justify-end gap-0.5">
                  <span className="material-symbols-outlined text-[12px]" style={{ "fontVariationSettings": "'FILL' 1" }}>stars</span>
                  {user.plan || 'VIP Investor'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/20 border-2 border-primary/50 overflow-hidden shrink-0 shadow-sm flex items-center justify-center text-primary font-bold">
                <img className="w-full h-full object-cover" alt="Profile" src={user.avatar || "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=VIP"} />
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-0.5">expand_more</span>
            </div>
          ) : (
            <Link 
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-surface-variant hover:bg-primary hover:text-on-primary text-on-surface font-extrabold text-sm rounded-xl transition-all border border-outline-variant shadow-sm"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* User Profile Dropdown Menu */}
          {showUserMenu && user && (
            <div className="absolute right-0 top-14 w-64 bg-surface-container-high border-2 border-outline-variant rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in p-2 space-y-1">
              <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 mb-2">
                <p className="text-xs font-bold text-on-surface">{user.name}</p>
                <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{user.email}</p>
                <div className="mt-2 pt-2 border-t border-outline/20 flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant">Gói quyền lợi:</span>
                  <span className="font-extrabold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    {user.plan || 'VIP PRO'}
                  </span>
                </div>
              </div>

              <Link 
                to="/portfolio" 
                onClick={() => setShowUserMenu(false)}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-variant flex items-center gap-3 text-xs font-bold text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                <span>Danh mục Quản lý Rổ</span>
              </Link>

              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  alert('Thông tin tài khoản: Hợp lệ. Mã khóa AI: VN30-ALPHA-SECRET-888');
                }}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-surface-variant flex items-center gap-3 text-xs font-bold text-on-surface transition-colors text-left"
              >
                <span className="material-symbols-outlined text-amber-400 text-[20px]">verified_user</span>
                <span>Cấu hình API &amp; Trợ lý AI</span>
              </button>

              <div className="pt-1 border-t border-outline-variant/40 mt-1">
                <button 
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-error/15 hover:text-error flex items-center gap-3 text-xs font-extrabold text-on-surface-variant transition-all text-left"
                >
                  <span className="material-symbols-outlined text-error text-[20px]">logout</span>
                  <span>Đăng xuất Tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
