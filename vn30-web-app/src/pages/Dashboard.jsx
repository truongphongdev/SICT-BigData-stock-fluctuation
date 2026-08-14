import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

export default function Dashboard() {
  const { stocks, marketStats } = useMarket();
  const [selectedSector, setSelectedSector] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('default');

  const isUpIndex = (marketStats.indexChange ?? 0) >= 0;
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
    return 0;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* VN30 Index Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>VN30 INDEX</span>
            <span className={`font-semibold ${isUpIndex ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isUpIndex ? `+${marketStats.indexChange}` : marketStats.indexChange} ({isUpIndex ? `+${marketStats.percentIndex}` : marketStats.percentIndex}%)
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {(marketStats.vn30Index ?? 1274.85).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Biến động chỉ số rổ VN30</div>
        </div>

        {/* Khối lượng Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>KHỐI LƯỢNG GIAO DỊCH</span>
            <span className="text-blue-600 text-xs font-medium">Cổ phiếu</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {marketStats.totalVolume || '245.8M'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">+12% so với TB 10 phiên</div>
        </div>

        {/* Giá trị Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>GIÁ TRỊ GIAO DỊCH</span>
            <span className="text-amber-600 text-xs font-medium">Tỷ VNĐ</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900">
            {marketStats.totalValue || '6,840'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tổng thanh khoản sàn</div>
        </div>

        {/* Độ rộng thị trường Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>ĐỘ RỘNG THỊ TRƯỜNG</span>
            <span className="text-xs text-slate-400">{stocks.length} mã</span>
          </div>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 my-2.5">
            <div className="bg-emerald-500" style={{ width: `${(marketStats.upCount / stocks.length) * 100}%` }}></div>
            <div className="bg-amber-400" style={{ width: `${(marketStats.refCount / stocks.length) * 100}%` }}></div>
            <div className="bg-rose-500" style={{ width: `${(marketStats.downCount / stocks.length) * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-600">{marketStats.upCount} Tăng</span>
            <span className="text-amber-600">{marketStats.refCount} Đứng giá</span>
            <span className="text-rose-600">{marketStats.downCount} Giảm</span>
          </div>
        </div>

      </div>

      {/* Main Content: Bảng Giá VN30 + Sidebar Dự Báo AI */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Cột 8: Bảng Giá VN30 */}
        <div className="col-span-12 lg:col-span-8 space-y-3">
          
          {/* Bộ lọc ngành và Sắp xếp */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {sectors.map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedSector === sec
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="change_desc">Tăng nhiều nhất</option>
                <option value="change_asc">Giảm nhiều nhất</option>
                <option value="ai_score_desc">Điểm AI cao nhất</option>
                <option value="price_desc">Thị giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Bảng Dữ Liệu Giá */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span className="col-span-3">Mã CP &amp; Ngành</span>
              <span className="col-span-2 text-right">Giá Khớp</span>
              <span className="col-span-2 text-right">+/- (VNĐ)</span>
              <span className="col-span-2 text-right">% Thay Đổi</span>
              <span className="col-span-3 text-right">Tín Hiệu AI</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {displayedStocks.map(stock => {
                const isUp = (stock.change ?? 0) > 0;
                const isDown = (stock.change ?? 0) < 0;
                const colorClass = isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-amber-600';
                
                return (
                  <Link 
                    key={stock.symbol}
                    to={`/stock/${stock.symbol}`}
                    className="grid grid-cols-12 px-4 py-3 hover:bg-slate-50 transition items-center text-xs"
                  >
                    <div className="col-span-3 flex flex-col">
                      <span className="font-bold text-sm text-blue-600">{stock.symbol}</span>
                      <span className="text-[11px] text-slate-500 truncate pr-2">{stock.name}</span>
                    </div>

                    <span className={`col-span-2 font-mono font-semibold text-right text-sm ${colorClass}`}>
                      {(stock.price ?? 0).toFixed(2)}
                    </span>

                    <span className={`col-span-2 font-mono text-right font-medium ${colorClass}`}>
                      {isUp ? `+${(stock.change ?? 0).toFixed(2)}` : (stock.change ?? 0).toFixed(2)}
                    </span>

                    <span className={`col-span-2 font-mono text-right font-semibold ${colorClass}`}>
                      {isUp ? `+${(stock.changePercent ?? 0).toFixed(2)}%` : `${(stock.changePercent ?? 0).toFixed(2)}%`}
                    </span>

                    <div className="col-span-3 flex justify-end">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        (stock.aiSignal ?? '').includes('MUA')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : (stock.aiSignal ?? '').includes('BÁN')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
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

        {/* Cột 4: Dự Báo AI Ngắn Gọn */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="material-symbols-outlined text-blue-600 text-lg">psychology</span>
              <span>Dự Báo Xu Hướng AI (Phiên tới)</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/70 text-center">
              <div className="text-xs text-slate-500 mb-1">XÁC SUẤT VN30 TĂNG ĐIỂM</div>
              <div className="text-3xl font-bold font-mono text-emerald-600">72.5%</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Xu hướng Tích cực (Bullish Bias)</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Khuyến Nghị AI</div>
              <div className="space-y-1.5">
                {stocks
                  .filter(s => (s.aiSignal ?? '').includes('MUA'))
                  .slice(0, 3)
                  .map(s => (
                    <Link
                      key={s.symbol}
                      to={`/stock/${s.symbol}`}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/70 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-blue-600">{s.symbol}</span>
                        <span className="text-xs text-slate-600 truncate max-w-[120px]">{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">
                        {s.aiSignal} ({s.aiScore}%)
                      </span>
                    </Link>
                  ))
                }
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
              <span className="text-blue-600 font-medium block mb-1">Nhận định AI:</span>
              Dòng tiền tập trung tốt ở nhóm Công nghệ và Ngân hàng. Chỉ báo RSI duy trì ở ngưỡng cân bằng 58 điểm, củng cố xu hướng tăng điểm ngắn hạn.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}