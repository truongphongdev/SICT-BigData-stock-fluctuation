import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function TopHeader() {
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { stocks, user } = useMarket();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Filter stocks dynamically
  const searchResults = searchValue.trim() === '' ? [] : stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchValue.toLowerCase()) || 
    s.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    s.sector.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-220px)] z-40 bg-white/95 border-b border-slate-200 flex justify-between items-center h-14 px-6 backdrop-blur-md shadow-sm">
      {/* Search Box */}
      <div className="flex items-center gap-4 flex-1" ref={dropdownRef}>
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm mã cổ phiếu (FPT, HPG, VCB)..." 
            value={searchValue}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowDropdown(true);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" 
          />
          {searchValue && (
            <button 
              onClick={() => { setSearchValue(''); setShowDropdown(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}

          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-10 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500">
                Kết quả ({searchResults.length})
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map(stock => (
                  <div 
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className="p-2.5 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-blue-600">{stock.symbol}</span>
                      <span className="text-xs text-slate-700 truncate max-w-[180px]">{stock.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{stock.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Dữ liệu Realtime</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="font-medium text-slate-700 text-xs hidden sm:inline">{user.name || user.email}</span>
          </div>
        )}
      </div>
    </header>
  );
}
