import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Portfolio() {
  const [viewMode, setViewMode] = useState('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const { stocks, portfolioSymbols, togglePortfolio, marketStats } = useMarket();
  const navigate = useNavigate();

  // Lọc ra các cổ phiếu đang nằm trong danh mục cá nhân
  const myStocks = stocks.filter(s => portfolioSymbols.includes(s.symbol));

  // Tính toán chỉ số tổng quan danh mục
  const upCount = myStocks.filter(s => s.change >= 0).length;
  const upPercent = myStocks.length > 0 ? Math.round((upCount / myStocks.length) * 100) : 0;

  // Tổng khối lượng trong rổ
  const totalVolume = myStocks.reduce((acc, s) => acc + Number(String(s.volume).replace(/,/g, '')), 0);
  const formattedVolume = (totalVolume / 1000000).toFixed(2) + 'M';

  // Lọc ra các mã có tín hiệu MUA hoặc MUA MẠNH
  const buySignals = myStocks.filter(s => s.aiSignal?.includes('MUA'));

  // Danh sách gợi ý thêm mã trong modal
  const modalStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchFilter.toLowerCase()) || 
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const renderTrendSvg = (isUp) => (
    <svg className="h-9 w-24 overflow-visible" viewBox="0 0 100 35">
      {isUp ? (
        <>
          <path d="M0 30 Q 20 28, 40 18 T 75 12 T 100 4" fill="none" stroke="#22C55E" strokeWidth="2.5" vectorEffect="non-scaling-stroke"></path>
          <circle cx="100" cy="4" r="3" fill="#22C55E" className="animate-pulse"></circle>
        </>
      ) : (
        <>
          <path d="M0 8 Q 30 15, 50 22 T 80 28 T 100 32" fill="none" stroke="#EF4444" strokeWidth="2.5" vectorEffect="non-scaling-stroke"></path>
          <circle cx="100" cy="32" r="3" fill="#EF4444" className="animate-pulse"></circle>
        </>
      )}
    </svg>
  );

  return (
    <div className="mt-16 p-6 space-y-6">
      {/* Top Breadcrumbs and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/40 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
            <span>Trang chủ</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Danh mục Trợ lý AI (Portfolio)</span>
          </nav>
          <h2 className="font-headline-lg text-3xl font-extrabold text-on-surface flex items-center gap-3">
            Danh Mục Đầu Tư &amp; Phân Tích Rổ
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold border border-primary/30">
              {myStocks.length} Mã theo dõi
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container rounded-xl border border-outline-variant shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              title="Chế độ danh sách"
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined">table_rows</span>
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới (Grid Card)"
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-extrabold hover:shadow-lg hover:shadow-primary/25 hover:brightness-110 transition-all active:scale-95 shadow-md text-sm"
          >
            <span className="material-symbols-outlined font-black">add</span>
            Thêm mã VN30
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-outline-variant/50 shadow-md bg-gradient-to-br from-surface-container via-surface to-surface-container/30">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Vốn Hóa Rổ (Định Giá)</span>
            <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
          </div>
          <p className="font-data-lg text-2xl font-black text-on-surface">
            {myStocks.length > 0 ? (myStocks.reduce((a, b) => a + b.price * 110, 0) / 1000).toFixed(1) + 'K' : '0'} <span className="text-sm font-normal text-on-surface-variant">Tỷ VNĐ</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-market-up">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-bold">+1.85% trung bình phiên</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-market-up border border-outline-variant/50 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Độ Khỏe Rổ (Mã Tăng)</span>
            <span className="material-symbols-outlined text-market-up text-xl">arrow_upward</span>
          </div>
          <p className="font-data-lg text-2xl font-black text-on-surface">
            {upCount} <span className="text-on-surface-variant text-base">/ {myStocks.length}</span>
          </p>
          <div className="w-full bg-surface-dim h-2 rounded-full mt-3 overflow-hidden border border-outline-variant/30 p-0.5">
            <div className="bg-gradient-to-r from-market-up/80 to-market-up h-full rounded-full transition-all duration-500" style={{ width: `${upPercent}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-outline-variant/50 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Khối Lượng Khớp</span>
            <span className="material-symbols-outlined text-on-surface-variant text-xl">bar_chart</span>
          </div>
          <p className="font-data-lg text-2xl font-black text-on-surface">{formattedVolume}</p>
          <p className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-ping"></span>
            Thanh khoản vượt 12% TB 10 phiên
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl ai-glow border-2 border-primary/40 bg-primary-container/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-primary tracking-wider uppercase">Cảnh Báo AI Alpha</span>
              <span className="material-symbols-outlined text-sm text-primary animate-bounce" style={{ "fontVariationSettings": "'FILL' 1" }}>auto_awesome</span>
            </div>
            <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
          </div>
          <p className="text-xs font-bold text-on-surface leading-snug line-clamp-2">
            {buySignals.length > 0 
              ? `🔥 Tín hiệu gom mua mạnh tại: ${buySignals.map(s => s.symbol).join(', ')}` 
              : '📊 Các mã trong rổ đang duy trì trạng thái ổn định / tích lũy.'}
          </p>
          <button 
            onClick={() => setShowSignalModal(true)} 
            className="mt-3 text-xs font-black text-primary hover:underline flex items-center gap-1 transition-all"
          >
            Chi tiết lý do tín hiệu
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Empty State when No Stocks in Portfolio */}
      {myStocks.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center space-y-4 my-8 bg-surface-container-low/40">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-inner">
            <span className="material-symbols-outlined text-4xl">folder_open</span>
          </div>
          <h3 className="font-headline-md text-xl font-bold text-on-surface">Danh mục theo dõi của bạn đang trống</h3>
          <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
            Hãy thêm các cổ phiếu đầu ngành từ rổ VN30 vào đây để theo dõi diễn biến giá chớp nháy thời gian thực và nhận cảnh báo sóng độc quyền từ AI Alpha.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-2 flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Thêm cổ phiếu ngay
          </button>
        </div>
      ) : (
        /* Stocks List or Grid View */
        viewMode === 'list' ? (
          <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-high border-b border-outline-variant text-xs">
                  <tr>
                    <th className="px-6 py-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Mã CK &amp; Ngành</th>
                    <th className="px-6 py-4 font-label-caps text-on-surface-variant text-right uppercase tracking-wider">Giá khớp (Nghìn)</th>
                    <th className="px-6 py-4 font-label-caps text-on-surface-variant text-right uppercase tracking-wider">% Thay đổi</th>
                    <th className="px-6 py-4 font-label-caps text-on-surface-variant text-right uppercase tracking-wider">Khối lượng</th>
                    <th className="px-6 py-4 font-label-caps text-on-surface-variant text-center uppercase tracking-wider">Xu hướng 10p</th>
                    <th className="px-6 py-4 font-label-caps text-primary text-center uppercase tracking-wider">AI Signal</th>
                    <th className="px-6 py-4 w-16 text-center uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-sm">
                  {myStocks.map(stock => {
                    const isUp = stock.change >= 0;
                    const flash = stock.flash;
                    const rowClass = flash === 'up' 
                      ? 'bg-market-up/25 transition-colors duration-200' 
                      : flash === 'down' 
                      ? 'bg-market-down/25 transition-colors duration-200' 
                      : 'hover:bg-surface-variant/60';

                    return (
                      <tr key={stock.symbol} className={`transition-colors group ${rowClass}`}>
                        <td className="px-6 py-4">
                          <Link to={`/stock/${stock.symbol}`} className="flex items-center gap-3.5 group-hover:translate-x-0.5 transition-transform">
                            <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-primary text-base shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-all">
                              {stock.symbol}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">{stock.name}</span>
                              <span className="text-[11px] text-on-surface-variant/80 font-medium">{stock.sector}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-lg text-on-surface">
                          {stock.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md text-xs font-extrabold border ${
                            isUp ? 'bg-market-up/15 text-market-up border-market-up/30' : 'bg-market-down/15 text-market-down border-market-down/30'
                          }`}>
                            <span className="material-symbols-outlined text-[16px]">{isUp ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                            {isUp ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-on-surface-variant">
                          {stock.volume}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            {renderTrendSvg(isUp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border shadow-sm ${
                            stock.aiSignal?.includes('MUA') ? 'bg-primary-container/30 border-primary/40 text-primary ai-glow' :
                            stock.aiSignal === 'BÁN' ? 'bg-error-container/20 border-error/30 text-error' :
                            'bg-surface-variant border-outline-variant text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[15px]" style={{ "fontVariationSettings": "'FILL' 1" }}>
                              {stock.aiSignal?.includes('MUA') ? 'rocket_launch' : stock.aiSignal === 'BÁN' ? 'warning' : 'hourglass_empty'}
                            </span>
                            <span>{stock.aiSignal} ({stock.aiScore}%)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => togglePortfolio(stock.symbol)}
                            title="Xoá khỏi danh mục"
                            className="p-2 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-container-low text-xs text-on-surface-variant gap-2">
              <span>Đang theo dõi <strong>{myStocks.length}</strong> trên tổng số 30 mã rổ VN30</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-market-up rounded-full animate-ping"></span>
                <span className="font-semibold text-primary">Dữ liệu đang được đồng bộ Realtime từ sàn (3.2s)</span>
              </div>
            </div>
          </div>
        ) : (
          /* Grid Card View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myStocks.map(stock => {
              const isUp = stock.change >= 0;
              const flash = stock.flash;
              const cardClass = flash === 'up' 
                ? 'ring-2 ring-market-up bg-market-up/15' 
                : flash === 'down' 
                ? 'ring-2 ring-market-down bg-market-down/15' 
                : 'hover:border-primary/50 bg-gradient-to-br from-surface via-surface to-surface-container/20';

              return (
                <div key={stock.symbol} className={`glass-panel p-6 rounded-2xl border border-outline-variant flex flex-col justify-between space-y-4 transition-all duration-500 shadow-lg ${cardClass}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <Link to={`/stock/${stock.symbol}`} className="w-14 h-14 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center font-extrabold text-primary text-xl shadow-inner hover:scale-105 transition-transform">
                        {stock.symbol}
                      </Link>
                      <div>
                        <Link to={`/stock/${stock.symbol}`} className="font-headline-md text-lg font-bold text-on-surface hover:text-primary transition-colors block">
                          {stock.name}
                        </Link>
                        <span className="text-xs text-on-surface-variant font-medium">{stock.sector}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePortfolio(stock.symbol)}
                      title="Xoá khỏi danh mục"
                      className="text-on-surface-variant/50 hover:text-error transition-colors p-1"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-outline-variant/30">
                    <div>
                      <span className="text-2xl font-black font-mono text-on-surface">{stock.price.toFixed(2)}</span>
                      <span className="text-xs text-on-surface-variant ml-1">nghìn VNĐ</span>
                    </div>
                    <div className={`flex items-center gap-1 font-bold text-sm px-2.5 py-1 rounded-lg ${isUp ? 'bg-market-up/15 text-market-up' : 'bg-market-down/15 text-market-down'}`}>
                      <span className="material-symbols-outlined text-sm">{isUp ? 'trending_up' : 'trending_down'}</span>
                      <span>{isUp ? `+${stock.change.toFixed(2)}` : stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Kháng cự / Hỗ trợ</span>
                      <span className="font-mono font-bold text-on-surface">{stock.resistance || '120'} / {stock.support || '95'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Chỉ báo RSI (14)</span>
                      <span className="font-mono font-bold text-primary">{stock.rsi || '54'} (Ổn định)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-primary-container/25 text-primary border border-primary/30">
                      <span className="material-symbols-outlined text-xs" style={{"fontVariationSettings":"'FILL' 1"}}>auto_awesome</span>
                      <span>{stock.aiSignal} ({stock.aiScore}%)</span>
                    </div>
                    <Link 
                      to={`/stock/${stock.symbol}`}
                      className="px-4 py-2 rounded-xl bg-surface-variant hover:bg-primary hover:text-on-primary font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <span>Xem biểu đồ</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Bottom Market Status Ticker Bar */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between p-4.5 bg-surface-container rounded-2xl border border-outline-variant/60 shadow-lg gap-4">
        <div className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">VN30 INDEX:</span>
            <span className="font-mono font-black text-market-up text-base">{marketStats?.vn30Index?.toLocaleString() || '1,268.50'}</span>
            <span className="text-xs text-market-up font-bold bg-market-up/10 px-2 py-0.5 rounded">
              +{marketStats?.indexChange || '12.4'} (+{marketStats?.percentIndex || '0.98'}%)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">ĐỘ TRỘNG SẢN:</span>
            <span className="text-xs font-bold text-market-up">{marketStats?.upCount || 18} Tăng</span>
            <span className="text-xs font-bold text-market-ref">{marketStats?.refCount || 4} Tham chiếu</span>
            <span className="text-xs font-bold text-market-down">{marketStats?.downCount || 8} Giảm</span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <span className="text-xs font-extrabold text-on-surface-variant uppercase">TỔNG TT VỐN:</span>
            <span className="font-mono text-on-surface font-bold">{marketStats?.totalValue || '8,450.2B'} VNĐ</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-surface-dim px-3.5 py-1.5 rounded-lg border border-outline/20 self-start sm:self-auto shrink-0">
          <span className="inline-block w-2.5 h-2.5 bg-market-up rounded-full animate-ping"></span>
          <span className="text-market-up">Thị trường Đang Giao Dịch (Khớp Lệnh Liên Tục)</span>
        </div>
      </div>

      {/* Modal Thêm Mã (Interactive Add Stock Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-surface border-2 border-primary/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl shadow-primary/25 max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">add_chart</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">Thêm Mã Chứng Khoán VN30</h3>
                  <p className="text-xs text-on-surface-variant">Chọn từ rổ 30 cổ phiếu đầu ngành để đưa vào tầm ngắm</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-surface-variant hover:bg-error/20 hover:text-error transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text"
                placeholder="Tìm mã cổ phiếu (FPT, HPG) hoặc tên doanh nghiệp..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2.5 pl-11 pr-4 text-sm focus:border-primary outline-none text-on-surface font-medium"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 pr-1">
              {modalStocks.map(stock => {
                const isSelected = portfolioSymbols.includes(stock.symbol);
                return (
                  <div 
                    key={stock.symbol}
                    onClick={() => togglePortfolio(stock.symbol)}
                    className="py-3 px-3.5 hover:bg-surface-variant/60 rounded-xl transition-all flex items-center justify-between cursor-pointer group my-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all border ${
                        isSelected 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105' 
                          : 'bg-primary/10 text-primary border-primary/30 group-hover:bg-primary group-hover:text-on-primary'
                      }`}>
                        {isSelected ? '★' : stock.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{stock.symbol}</span>
                          <span className="text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant border border-outline-variant/30">{stock.sector}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{stock.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-on-surface block">{stock.price.toFixed(2)}</span>
                        <span className={`text-[11px] font-bold ${stock.change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                          {stock.change >= 0 ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
                        </span>
                      </div>
                      <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
                        isSelected 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-error/20 hover:text-error' 
                          : 'bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary'
                      }`}>
                        <span className="material-symbols-outlined text-xl" style={{ "fontVariationSettings": isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                          {isSelected ? 'star' : 'star_outline'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-outline-variant flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Bấm vào biểu tượng ★ để chọn/xoá mã ngay lập tức</span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 shadow-lg text-sm"
              >
                Hoàn Thành ({myStocks.length} mã đã chọn)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Tín Hiệu AI (AI Signal Report Modal) */}
      {showSignalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-surface border-2 border-primary/50 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl shadow-primary/30 max-h-[85vh] flex flex-col relative">
            <div className="flex justify-between items-start border-b border-outline-variant pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg">
                  <span className="material-symbols-outlined text-[30px]" style={{ "fontVariationSettings": "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-2xl font-extrabold text-on-surface">Báo Cáo Động Lượng Rổ Của Bạn</h3>
                  <p className="text-xs text-primary font-medium mt-0.5">Phân tích bằng mô hình Trí Tuệ Nhân Tạo VN30 Alpha Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSignalModal(false)}
                className="p-2 rounded-xl bg-surface-variant hover:bg-error/20 hover:text-error transition-all text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface-variant leading-relaxed">
                Hệ thống AI vừa tar quét toàn bộ <strong>{myStocks.length}</strong> cổ phiếu trong danh mục theo dõi của bạn dựa trên 12 chỉ báo động lượng (RSI, MACD, Volume Delta, Dòng tiền tổ chức). Dưới đây là phân tích chuyên sâu cho từng mã:
              </div>

              <div className="space-y-3">
                {myStocks.map(stock => (
                  <div key={stock.symbol} className="p-4 rounded-2xl bg-surface-container border border-outline-variant hover:border-primary/40 transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-12 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-primary text-base">
                          {stock.symbol}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-on-surface text-base">{stock.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span>Giá: <strong className="text-on-surface">{stock.price.toFixed(2)}</strong></span>
                            <span>•</span>
                            <span>RSI: <strong className="text-primary">{stock.rsi || '54'}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3.5 py-1.5 rounded-xl font-black text-xs border ${
                          stock.aiSignal?.includes('MUA') ? 'bg-market-up/20 text-market-up border-market-up/40' :
                          stock.aiSignal === 'BÁN' ? 'bg-market-down/20 text-market-down border-market-down/40' :
                          'bg-surface-variant text-primary border-primary/40'
                        }`}>
                          Khuyến Nghị: {stock.aiSignal} ({stock.aiScore}%)
                        </span>
                        <button 
                          onClick={() => {
                            setShowSignalModal(false);
                            navigate(`/stock/${stock.symbol}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition-colors"
                        >
                          Mở Chart
                        </button>
                      </div>
                    </div>
                    <div className="pt-3 flex gap-3 items-start">
                      <span className="material-symbols-outlined text-primary shrink-0 text-xl mt-0.5">insights</span>
                      <p className="text-xs font-medium text-on-surface-variant/90 leading-relaxed italic">
                        "{stock.aiSummary || 'Dòng tiền chủ động gia tăng từ các định chế tài chính lớn, phù hợp tiếp tục duy trì tỷ trọng.'}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant flex justify-end">
              <button 
                onClick={() => setShowSignalModal(false)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 shadow-lg text-sm"
              >
                Đóng Báo Cáo AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}