import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import CandleChart from '../components/CandleChart';

export default function StockDetail() {
  const { symbol } = useParams();
  const { getStockBySymbol, portfolioSymbols, togglePortfolio, stocks } = useMarket();
  
  const [timeframe, setTimeframe] = useState('1D');
  const [showAiModal, setShowAiModal] = useState(false);

  const stock = getStockBySymbol(symbol || 'FPT');
  const isUp = stock.change >= 0;
  const inPortfolio = portfolioSymbols.includes(stock.symbol);

  // Tính giá dự đoán mai (mô phỏng AI forecast)
  const forecastDelta = isUp ? Number((stock.price * 0.018).toFixed(2)) : -Number((stock.price * 0.012).toFixed(2));
  const forecastPrice = Number((stock.price + forecastDelta).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Stock Header Bar */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/50 bg-gradient-to-r from-surface-container via-surface to-surface-container/60 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center font-extrabold text-primary text-xl shadow-inner">
            {stock.symbol}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-2xl font-bold text-on-surface">{stock.name}</h1>
              <span className="px-3 py-0.5 bg-surface-variant text-on-surface-variant text-xs rounded-full font-semibold border border-outline/30">
                {stock.sector}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className={`text-2xl font-extrabold ${isUp ? 'text-market-up' : 'text-market-down'} flex items-center gap-1`}>
                {stock.price.toFixed(2)}
                <span className="text-sm font-normal text-on-surface-variant">nghìn VNĐ</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded text-sm font-bold flex items-center gap-1 ${isUp ? 'bg-market-up/15 text-market-up' : 'bg-market-down/15 text-market-down'}`}>
                <span className="material-symbols-outlined text-[16px]">{isUp ? 'trending_up' : 'trending_down'}</span>
                {isUp ? `+${stock.change.toFixed(2)}` : stock.change.toFixed(2)} ({isUp ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => togglePortfolio(stock.symbol)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border active:scale-95 ${
              inPortfolio 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30' 
                : 'bg-surface-container-high text-on-surface hover:border-primary/50 border-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ "fontVariationSettings": inPortfolio ? "'FILL' 1" : "'FILL' 0" }}>
              star
            </span>
            {inPortfolio ? 'Đang theo dõi' : 'Thêm vào rổ'}
          </button>
          
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>psychology</span>
            Phân tích AI Sâu
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden flex flex-col shadow-xl">
            <div className="px-5 py-3.5 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <div className="flex items-center gap-4">
                <span className="font-label-caps text-on-surface-variant tracking-widest font-bold">BIỂU ĐỒ TRADINGVIEW • OHLCV</span>
                <div className="flex bg-surface-variant/70 rounded-lg p-1 border border-outline-variant/30">
                  {['15M', '1H', '1D', '1W'].map((tf) => (
                    <button 
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all ${
                        timeframe === tf 
                          ? 'bg-primary text-on-primary shadow-md' 
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 text-on-surface-variant">
                <button title="Làm mới chart" onClick={() => setTimeframe(timeframe)} className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
                <button title="Cài đặt chỉ báo" className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </div>
            </div>

            {/* TradingView Lightweight Candlestick Chart */}
            <div className="p-3 bg-surface-dim/40 min-h-[460px]">
              <CandleChart symbol={stock.symbol} basePrice={stock.price} timeframe={timeframe} height={450} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-on-surface-variant text-[11px] font-bold">RSI (14)</span>
                <span className="font-data-md text-primary font-bold text-lg">{stock.rsi || 58.4}</span>
              </div>
              <div className="h-14 w-full bg-surface-dim rounded-lg relative overflow-hidden mt-2 flex items-center justify-center border border-outline/20">
                <div className="w-full bg-surface-variant h-2 rounded-full mx-3 overflow-hidden">
                  <div 
                    className={`h-full ${stock.rsi > 70 ? 'bg-market-down' : stock.rsi < 30 ? 'bg-market-up' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(100, stock.rsi || 50)}%` }}
                  ></div>
                </div>
                <span className="absolute bottom-1 right-3 text-[10px] font-semibold text-on-surface-variant">
                  {stock.rsi > 70 ? 'Quá mua (Overbought)' : stock.rsi < 30 ? 'Quá bán (Oversold)' : 'Trung tính (Neutral)'}
                </span>
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-on-surface-variant text-[11px] font-bold">MACD (12, 26, 9)</span>
                <span className={`font-data-md font-bold text-sm ${stock.macd?.includes('+') ? 'text-market-up' : 'text-market-down'}`}>
                  {stock.macd || '+0.85 (Bullish)'}
                </span>
              </div>
              <div className="h-14 w-full bg-surface-dim rounded-lg flex items-end justify-center gap-1.5 p-2 mt-2 border border-outline/20">
                <div className="flex-1 bg-market-up h-1/3 rounded-t-sm opacity-60"></div>
                <div className="flex-1 bg-market-up h-2/3 rounded-t-sm opacity-80"></div>
                <div className="flex-1 bg-market-up h-full rounded-t-sm"></div>
                <div className="flex-1 bg-market-down h-1/2 rounded-b-sm opacity-70"></div>
                <div className="flex-1 bg-market-up h-3/4 rounded-t-sm"></div>
              </div>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-on-surface-variant text-[11px] font-bold">KHÁNG CỰ & HỖ TRỢ</span>
                <span className="font-data-md text-on-surface text-xs font-semibold">Key Levels</span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-market-down font-bold">Cản trên (Resistance):</span>
                  <span className="font-mono font-bold text-on-surface">{stock.resistance || (stock.price * 1.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-market-up font-bold">Hỗ trợ (Support):</span>
                  <span className="font-mono font-bold text-on-surface">{stock.support || (stock.price * 0.95).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="ai-gradient-border p-[1px] rounded-2xl shadow-2xl shadow-primary/10">
            <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex justify-between items-start border-b border-outline-variant/40 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined sparkle-float text-[26px]">auto_awesome</span>
                    <h2 className="font-headline-md text-on-surface font-extrabold text-lg">Dự Báo & Khuyến Nghị AI</h2>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')} • Model v3.4</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg font-black text-sm border shadow-sm ${
                  stock.aiSignal?.includes('MUA') ? 'bg-market-up/20 text-market-up border-market-up/40' :
                  stock.aiSignal === 'BÁN' ? 'bg-market-down/20 text-market-down border-market-down/40' :
                  'bg-surface-variant text-primary border-primary/40'
                }`}>
                  {stock.aiSignal || 'MUA MẠNH'}
                </span>
              </div>

              <div className="bg-surface-variant/40 rounded-xl p-5 border border-white/5 shadow-inner">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-on-surface-variant text-[11px]">MỤC TIÊU PHIÊN TIẾP THEO</span>
                    <span className={`font-data-lg text-2xl font-extrabold ${forecastDelta >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                      {forecastPrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center justify-end gap-1 font-bold ${forecastDelta >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                      <span className="material-symbols-outlined text-[18px]">{forecastDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
                      <span>{forecastDelta >= 0 ? 'TĂNG' : 'GIẢM'}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {forecastDelta >= 0 ? `+${forecastDelta}` : forecastDelta} ({((forecastDelta / stock.price) * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface-variant">Độ tin cậy AI (Confidence Score)</span>
                    <span className="text-primary">{stock.aiScore || 90}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-dim rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full transition-all duration-1000 shadow-sm" 
                      style={{ width: `${stock.aiScore || 90}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl shadow-sm">
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">lightbulb</span>
                  <p className="text-xs leading-relaxed font-medium text-on-surface">
                    "{stock.aiSummary || 'Dòng tiền khối ngoại và tổ chức gia tăng mạnh trước thềm báo cáo tài chính. RSI ổn định vùng trung tính, khối lượng xác nhận xu hướng vượt đỉnh.'}"
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowAiModal(true)}
                className="w-full py-3.5 bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all text-sm uppercase tracking-wider active:scale-95"
              >
                Xem Bảng Khuyến Nghị & Giải Thích Chi Tiết
              </button>
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 shadow-md">
            <h3 className="font-label-caps text-on-surface-variant font-bold mb-4 tracking-wider text-xs border-b border-outline-variant/40 pb-3">
              THÔNG TIN CƠ BẢN DOANH NGHIỆP ({stock.symbol})
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-on-surface-variant">Vốn hóa thị trường</span>
                <span className="font-data-md font-bold text-on-surface">{stock.marketCap || '168,450 Tỷ'}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-on-surface-variant">P/E Ratio</span>
                <span className="font-data-md font-bold text-on-surface">{stock.pe || '18.4'}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-on-surface-variant">EPS (Lợi nhuận/CP)</span>
                <span className="font-data-md font-bold text-on-surface">{stock.eps || '5,420 VNĐ'}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2.5">
                <span className="text-on-surface-variant">Khối lượng 24h</span>
                <span className="font-data-md font-bold text-on-surface">{stock.volume || '4,520,100'} CP</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-on-surface-variant">Cổ phiếu tương tự</span>
                <div className="flex gap-1.5">
                  {stocks.slice(0, 3).map(s => (
                    <Link key={s.symbol} to={`/stock/${s.symbol}`} className="px-2 py-0.5 bg-surface-variant hover:bg-primary hover:text-on-primary text-xs rounded font-bold transition-colors">
                      {s.symbol}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Phân Tích AI Sâu (Interactive AI Explanation Modal) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-surface border-2 border-primary/40 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start border-b border-outline-variant pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]" style={{ "fontVariationSettings": "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">Báo cáo Trí tuệ Nhân tạo VN30 Alpha</h3>
                  <p className="text-xs text-primary font-medium">Mã phân tích: {stock.symbol} ({stock.name})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg bg-surface-variant hover:bg-error/20 hover:text-error transition-all text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Xác suất xu hướng Tăng</span>
                <div className="text-3xl font-extrabold text-market-up flex items-baseline gap-2">
                  {stock.aiScore || 92}%
                  <span className="text-xs font-normal text-on-surface-variant">(Rất Cao)</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Khuyến Nghị Tổ Chức</span>
                <div className="text-2xl font-black text-primary mt-1">
                  {stock.aiSignal || 'MUA MẠNH'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">manage_search</span>
                Phân tích động lượng Dòng tiền (Smart Money & Volume)
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                {stock.aiSummary || 'Hệ thống AI ghi nhận thanh khoản gia tăng liên tiếp trong các phiên điều chỉnh, chứng tỏ khối ngoại và các quỹ lớn đang thu gom trước kỳ nghỉ lễ. Định giá P/E hiện tại rất hấp dẫn.'}
              </p>

              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">Các chỉ báo kỹ thuật thỏa mãn:</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-surface-container/60 border border-outline-variant/20">
                    <span className="w-2 h-2 rounded-full bg-market-up"></span>
                    <span>RSI (14): <strong>{stock.rsi} (Vùng đà tăng)</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-surface-container/60 border border-outline-variant/20">
                    <span className="w-2 h-2 rounded-full bg-market-up"></span>
                    <span>MACD: <strong>Cắt lên Đường tín hiệu</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-surface-container/60 border border-outline-variant/20">
                    <span className="w-2 h-2 rounded-full bg-market-up"></span>
                    <span>MA20 vs MA50: <strong>Golden Cross (Bullish)</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-surface-container/60 border border-outline-variant/20">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span>CASA & Biên LNG: <strong>Dẫn đầu Ngành</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant font-bold hover:bg-surface-variant transition-colors text-sm"
              >
                Đóng Báo Cáo
              </button>
              <button 
                onClick={() => {
                  togglePortfolio(stock.symbol);
                  setShowAiModal(false);
                }}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 transition-all text-sm shadow-lg shadow-primary/20"
              >
                {inPortfolio ? 'Đã trong rổ (Bấm xoá)' : '⭐ Thêm vào danh mục theo dõi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}