import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Dashboard() {
  const { stocks, marketStats, isLiveSimulation, setIsLiveSimulation } = useMarket();
  const [selectedSector, setSelectedSector] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('default');

  const isUpIndex = marketStats.indexChange >= 0;

  const sectors = ['Tất cả', 'Ngân Hàng', 'Công Nghệ', 'Thép & BĐS', 'Bán Lẻ & Hàng Tiêu Dùng'];
  
  const displayedStocks = [...stocks].filter(s => {
    if (selectedSector === 'Tất cả') return true;
    if (selectedSector === 'Ngân Hàng') return s.sector === 'Ngân Hàng' || s.sector.includes('Tài Chính');
    if (selectedSector === 'Công Nghệ') return s.sector.includes('Công Nghệ');
    if (selectedSector === 'Thép & BĐS') return s.sector.includes('Thép') || s.sector.includes('BĐS') || s.sector.includes('Bất Động Sản');
    if (selectedSector === 'Bán Lẻ & Hàng Tiêu Dùng') return s.sector.includes('Bán Lẻ') || s.sector.includes('Tiêu Dùng') || s.sector.includes('Thực Phẩm');
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'change_desc') return (b.changePercent ?? 0) - (a.changePercent ?? 0);
    if (sortOrder === 'change_asc') return (a.changePercent ?? 0) - (b.changePercent ?? 0);
    if (sortOrder === 'ai_score_desc') return (b.aiScore ?? 0) - (a.aiScore ?? 0);
    if (sortOrder === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
    return 0; // default order
  });

  return (
    <>
      <div className="mt-16 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={`glass-panel p-4 rounded-xl space-y-2 border-l-4 ${isUpIndex ? 'border-market-up' : 'border-market-down'} transition-colors duration-300`}>
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-caps uppercase text-[10px] tracking-widest">VN30 Index</span>
              <span className={`${isUpIndex ? 'text-market-up' : 'text-market-down'} flex items-center text-xs font-bold`}>
                <span className="material-symbols-outlined text-[14px]">
                  {isUpIndex ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
                {isUpIndex ? `+${marketStats.indexChange}` : marketStats.indexChange} ({isUpIndex ? `+${marketStats.percentIndex}` : marketStats.percentIndex}%)
              </span>
            </div>
            <div className="flex items-end justify-between">
              <h2 className={`font-data-lg text-data-lg ${isUpIndex ? 'text-market-up' : 'text-market-down'} transition-all`}>
                {(marketStats.vn30Index ?? 1274.85).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <div className={`h-8 w-20 bg-gradient-to-t ${isUpIndex ? 'from-market-up/20' : 'from-market-down/20'} to-transparent flex items-end`}>
                <div className="w-full h-full" style={{"background": isUpIndex ? "linear-gradient(90deg, transparent 0%, transparent 40%, #22C55E 100%)" : "linear-gradient(90deg, transparent 0%, transparent 40%, #EF4444 100%)"}}></div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl space-y-2">
            <span className="text-on-surface-variant font-label-caps uppercase text-[10px] tracking-widest">Khối lượng GD</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">bar_chart_4_bars</span>
              <h2 className="font-data-lg text-data-lg">{marketStats.totalVolume}</h2>
            </div>
            <p className="text-[10px] text-on-surface-variant">+12% vs. trung bình 10 phiên</p>
          </div>

          <div className="glass-panel p-4 rounded-xl space-y-2">
            <span className="text-on-surface-variant font-label-caps uppercase text-[10px] tracking-widest">Giá trị GD</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-market-ref">payments</span>
              <h2 className="font-data-lg text-data-lg">{marketStats.totalValue}</h2>
            </div>
            <p className="text-[10px] text-on-surface-variant">Tỷ VNĐ</p>
          </div>

          <div className="glass-panel p-4 rounded-xl space-y-2">
            <span className="text-on-surface-variant font-label-caps uppercase text-[10px] tracking-widest">Độ rộng VN30</span>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-surface-variant mt-2">
              <div className="h-full bg-market-up transition-all duration-500" style={{"width": `${(marketStats.upCount / stocks.length) * 100}%`}}></div>
              <div className="h-full bg-market-ref transition-all duration-500" style={{"width": `${(marketStats.refCount / stocks.length) * 100}%`}}></div>
              <div className="h-full bg-market-down transition-all duration-500" style={{"width": `${(marketStats.downCount / stocks.length) * 100}%`}}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-market-up">{marketStats.upCount} Tăng</span>
              <span className="text-market-ref">{marketStats.refCount} Tham chiếu</span>
              <span className="text-market-down">{marketStats.downCount} Giảm</span>
            </div>
          </div>

          <div 
            onClick={() => setIsLiveSimulation(!isLiveSimulation)}
            className="glass-panel p-4 rounded-xl flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary/50 transition-all select-none"
            title="Bấm để bật/tắt bộ giả lập khớp lệnh tự động (Live Simulation)"
          >
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full mb-1 ${isLiveSimulation ? 'bg-market-up/15 text-market-up' : 'bg-on-surface-variant/20 text-on-surface-variant'}`}>
              <div className={`w-2 h-2 rounded-full ${isLiveSimulation ? 'bg-market-up animate-ping' : 'bg-on-surface-variant'}`}></div>
              <span className="font-bold text-[12px]">{isLiveSimulation ? 'Đang Khớp Lệnh Realtime' : 'Tạm Dừng Simulation'}</span>
            </div>
            <p className="text-[10px] text-primary underline font-medium mt-1">
              {isLiveSimulation ? '⚡ Live Flashing: ON (Bấm tắt)' : '💤 Live Flashing: OFF (Bấm bật)'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 min-h-[600px]">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-headline-md text-body-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
                Bảng Giá VN30 Trực Tuyến ({displayedStocks.length} mã)
              </h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-market-up animate-ping"></span>
                <span>Live Real-time Feed</span>
              </div>
            </div>

            {/* Filter Tabs and Sort Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container p-2.5 rounded-2xl border border-outline-variant/60 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {sectors.map(sec => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSector(sec)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                      selectedSector === sec
                        ? 'bg-primary text-on-primary shadow-md shadow-primary/20 font-extrabold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-outline-variant/40 pt-2 sm:pt-0 sm:pl-3">
                <span className="material-symbols-outlined text-on-surface-variant text-base">sort</span>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-3 py-1.5 text-xs font-extrabold focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="change_desc">🔥 Tăng mạnh nhất</option>
                  <option value="change_asc">🔻 Giám sâu nhất</option>
                  <option value="ai_score_desc">🤖 Điểm tin cậy AI cao nhất</option>
                  <option value="price_desc">💎 Giá (Thị giá) cao nhất</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col border border-outline-variant shadow-lg">
              <div className="grid grid-cols-12 px-4 py-3.5 border-b border-outline-variant bg-surface-container-high text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <span className="col-span-3">Mã CP &amp; Ngành</span>
                <span className="col-span-2 text-right">Giá Khớp</span>
                <span className="col-span-2 text-right">+/- (VNĐ)</span>
                <span className="col-span-2 text-right">% Thay Đổi</span>
                <span className="col-span-3 text-right">Tín Hiệu AI Alpha</span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[520px] divide-y divide-outline-variant/20">
                {displayedStocks.map(stock => {
                  const isUp = (stock.change ?? 0) > 0;
                  const isDown = (stock.change ?? 0) < 0;
                  const colorClass = isUp ? 'text-market-up' : isDown ? 'text-market-down' : 'text-market-ref';
                  const priceFormatted = (stock.price ?? 0).toFixed(2);
                  const changeFormatted = (stock.change ?? 0).toFixed(2);
                  const changePercentFormatted = (stock.changePercent ?? 0).toFixed(2);
                  
                  // Hiệu ứng chớp sáng nền khi có update giá (Real-time exchange flashing)
                  let bgClass = 'hover:bg-surface-variant/30';
                  if (stock.flash === 'up') bgClass = 'bg-market-up/25 ring-1 ring-market-up/50 transition-colors duration-200';
                  if (stock.flash === 'down') bgClass = 'bg-market-down/25 ring-1 ring-market-down/50 transition-colors duration-200';

                  return (
                    <Link 
                      key={stock.symbol}
                      to={`/stock/${stock.symbol}`}
                      className={`grid grid-cols-12 px-4 py-3.5 border-b border-outline-variant/10 transition-colors items-center cursor-pointer ${bgClass}`}
                    >
                      <div className="col-span-3 flex flex-col">
                        <span className="font-bold text-base text-primary hover:underline">{stock.symbol}</span>
                        <span className="text-[11px] text-on-surface-variant truncate pr-2" title={stock.name}>{stock.name}</span>
                      </div>
                      <span className={`col-span-2 font-data-md font-bold text-right text-base ${colorClass}`}>
                        {priceFormatted}
                      </span>
                      <span className={`col-span-2 font-data-md text-right font-medium ${colorClass}`}>
                        {isUp ? `+${changeFormatted}` : changeFormatted}
                      </span>
                      <span className={`col-span-2 font-data-md text-right font-bold ${colorClass}`}>
                        {isUp ? `+${changePercentFormatted}%` : `${changePercentFormatted}%`}
                      </span>
                      <div className="col-span-3 flex justify-end items-center gap-1">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          stock.aiSignal === 'MUA MẠNH' ? 'bg-market-up/10 text-market-up border-market-up/30' :
                          stock.aiSignal === 'MUA' ? 'bg-market-up/10 text-market-up border-market-up/30' :
                          stock.aiSignal === 'BÁN' ? 'bg-market-down/10 text-market-down border-market-down/30' :
                          'bg-surface-container-high text-primary border-primary/30'
                        }`}>
                          {stock.aiSignal || 'NẮM GIỮ'} ({stock.aiScore ?? 0}%)
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary animate-spin" style={{"fontVariationSettings":"'FILL' 1", "animationDuration": "10s"}}>auto_awesome</span>
              <h3 className="font-headline-md text-body-lg font-bold">Dự báo AI Phiên kế tiếp</h3>
            </div>
            
            <div className="flex-1 glass-panel rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-transparent p-5 space-y-5 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-primary/5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/15 blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="space-y-4 relative">
                <div className="text-center space-y-1 bg-surface-container-low/80 p-4 rounded-xl border border-outline-variant/40 backdrop-blur">
                  <p className="text-on-surface-variant font-label-caps uppercase text-[11px] tracking-wider">Xác suất VN30 Tăng Phiên Mai</p>
                  <h2 className="text-4xl font-headline-lg text-primary font-extrabold tracking-tight">72.8%</h2>
                  <div className="flex justify-center gap-3 text-xs font-bold mt-2">
                    <span className="text-market-up flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      Bullish Bias
                    </span>
                    <span className="text-on-surface-variant opacity-40">|</span>
                    <span className="text-primary font-semibold">Độ tin cậy AI: 94%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-outline-variant pb-2 flex items-center justify-between">
                    <span>Top Khuyến Nghị Mua Mạnh</span>
                    <span className="text-primary text-[10px] font-normal">AI Score</span>
                  </p>
                  
                  <div className="space-y-2.5">
                    {stocks
                      .filter(s => (s.aiSignal ?? '').includes('MUA'))
                      .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
                      .slice(0, 3)
                      .map(stock => (
                        <Link 
                          key={stock.symbol} 
                          to={`/stock/${stock.symbol}`}
                          className="flex items-center justify-between p-2.5 bg-surface-container/60 hover:bg-surface-container-high rounded-lg border border-outline-variant/40 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                              {stock.symbol}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-on-surface block">{stock.symbol}</span>
                              <span className="text-[11px] text-on-surface-variant block truncate max-w-[140px]">{stock.name}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-market-up text-xs font-bold bg-market-up/10 px-2 py-0.5 rounded border border-market-up/20">
                              +{(stock.changePercent ?? 0).toFixed(2)}%
                            </span>
                            <span className="text-[11px] font-bold text-primary mt-1">Điểm: {stock.aiScore ?? 0}/100</span>
                          </div>
                        </Link>
                      ))
                    }
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-primary/20 text-xs text-on-surface-variant leading-relaxed shadow-inner">
                <span className="text-primary font-bold flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  Nhận định từ Engine AI:
                </span>
                Dòng tiền lớn (Smart Money) đang đổ dồn vào nhóm Công nghệ ({stocks[0]?.symbol}) và Ngân hàng ({stocks[2]?.symbol}). Hệ thống phát hiện RSI toàn bộ rổ bứt lên vùng 58, ủng hộ đà vượt đỉnh ngắn hạn.
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4 border border-outline-variant/40">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-body-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Biểu Đồ Khối Lượng Giao Dịch Top VN30 (Trí tuệ Tài chính)
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                <span className="text-xs text-on-surface-variant">Khối lượng & Động lượng</span>
              </div>
            </div>
          </div>

          <div className="h-52 w-full flex items-end gap-2 pt-4 px-2 bg-surface-container-lowest/50 rounded-lg border border-outline-variant/20 overflow-x-auto">
            {stocks.map((stock, idx) => {
              // Ước tính height chart tỉ lệ từ volume
              const heights = [95, 82, 75, 68, 65, 58, 52, 48, 42, 38, 35, 30, 25, 20, 18];
              const h = heights[idx % heights.length];
              const isGreen = stock.change >= 0;
              
              return (
                <Link 
                  key={stock.symbol}
                  to={`/stock/${stock.symbol}`}
                  className="flex-1 min-w-[32px] flex flex-col items-center gap-2 group h-full justify-end"
                  title={`${stock.symbol} - KL: ${stock.volume} - Giá: ${stock.price}`}
                >
                  <div className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-primary -mb-1">
                    {stock.price}
                  </div>
                  <div 
                    className={`w-full max-w-[28px] ${isGreen ? 'bg-market-up/70 hover:bg-market-up' : 'bg-market-down/70 hover:bg-market-down'} rounded-t transition-all shadow-md group-hover:scale-105`} 
                    style={{"height": `${h}%`}}
                  ></div>
                  <span className="font-bold text-xs group-hover:text-primary transition-colors">{stock.symbol}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}