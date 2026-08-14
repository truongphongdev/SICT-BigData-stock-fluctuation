import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import CandleChart from '../components/CandleChart';
import StockReportModal from '../components/StockReportModal';

export default function StockDetail() {
  const { symbol } = useParams();
  const { getStockBySymbol, portfolioSymbols, togglePortfolio } = useMarket();
  
  const [timeframe, setTimeframe] = useState('1D');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const stock = getStockBySymbol(symbol || 'FPT');
  const isUp = (stock.change ?? 0) >= 0;
  const inPortfolio = portfolioSymbols.includes(stock.symbol);

  // Tính giá dự đoán
  const forecastDelta = isUp ? Number(((stock.price ?? 100) * 0.018).toFixed(2)) : -Number(((stock.price ?? 100) * 0.012).toFixed(2));
  const forecastPrice = Number(((stock.price ?? 100) + forecastDelta).toFixed(2));

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header Cổ phiếu */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-lg shadow-sm">
            {stock.symbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{stock.name}</h1>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                {stock.sector}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm font-mono">
              <span className={`text-xl font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {(stock.price ?? 0).toFixed(2)}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {isUp ? `+${(stock.change ?? 0).toFixed(2)}` : (stock.change ?? 0).toFixed(2)} ({isUp ? `+${(stock.changePercent ?? 0).toFixed(2)}%` : `${(stock.changePercent ?? 0).toFixed(2)}%`})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button 
            onClick={() => togglePortfolio(stock.symbol)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition border ${
              inPortfolio 
                ? 'bg-amber-50 text-amber-700 border-amber-300' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {inPortfolio ? 'star' : 'star_border'}
            </span>
            <span>{inPortfolio ? 'Đang theo dõi' : 'Thêm theo dõi'}</span>
          </button>
          
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition"
          >
            <span className="material-symbols-outlined text-blue-600 text-base">psychology</span>
            <span>Phân tích AI</span>
          </button>

          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Cột 8: Biểu đồ nến & Chỉ báo kỹ thuật */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Biểu đồ TradingView OHLCV */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 uppercase tracking-wider">BIỂU ĐỒ NẾN NHẬT (OHLCV)</span>
              
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                {['15M', '1H', '1D', '1W'].map((tf) => (
                  <button 
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                      timeframe === tf 
                        ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white min-h-[440px]">
              <CandleChart symbol={stock.symbol} basePrice={stock.price} timeframe={timeframe} height={430} />
            </div>
          </div>

          {/* 3 Thẻ Chỉ Báo Kỹ Thuật Nhanh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>RSI (14)</span>
                <span className="font-mono font-bold text-sm text-blue-600">{stock.rsi || 58.4}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stock.rsi > 70 ? 'bg-rose-500' : stock.rsi < 30 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                  style={{ width: `${Math.min(100, stock.rsi || 50)}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                {stock.rsi > 70 ? 'Vùng Quá Mua' : stock.rsi < 30 ? 'Vùng Quá Bán' : 'Vùng Cân Bằng'}
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>MACD (12, 26, 9)</span>
                <span className="font-mono font-bold text-sm text-emerald-600">{stock.macd || '+0.85'}</span>
              </div>
              <div className="text-xs text-emerald-600 font-medium pt-1">
                Tín hiệu Phân kỳ Tích cực
              </div>
              <div className="text-[11px] text-slate-400">Đường MACD nằm trên đường Signal</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>KHÁNG CỰ / HỖ TRỢ</span>
                <span className="text-slate-400">Giá</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Cản trên:</span>
                <span className="font-mono font-bold text-rose-600">{stock.resistance || ((stock.price ?? 100) * 1.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Hỗ trợ:</span>
                <span className="font-mono font-bold text-emerald-600">{stock.support || ((stock.price ?? 100) * 0.95).toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Cột 4: Khuyến Nghị AI & Thông Tin Cơ Bản */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* Card Dự Báo AI */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">auto_awesome</span>
                <span>Dự Báo AI (XGBoost)</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                (stock.aiSignal ?? '').includes('MUA')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : (stock.aiSignal ?? '').includes('BÁN')
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {stock.aiSignal || 'MUA MẠNH'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/70 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500">MỤC TIÊU PHIÊN MAI</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{forecastPrice}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-600">
                  {forecastDelta >= 0 ? `+${forecastDelta}` : forecastDelta} ({((forecastDelta / (stock.price || 1)) * 100).toFixed(2)}%)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Độ tin cậy: {stock.aiScore || 90}%</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
              <span className="text-blue-600 font-medium block mb-1">Tóm tắt phân tích:</span>
              "{stock.aiSummary || 'Dòng tiền chủ động gia tăng mạnh. Khối lượng khớp lệnh phiên gần nhất vượt trung bình 20 phiên, củng cố xu hướng tăng điểm.'}"
            </div>

            <button 
              onClick={() => setShowAiModal(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium rounded-lg transition text-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-blue-600">analytics</span>
              <span>Xem Giải Thích Chi Tiết AI</span>
            </button>
          </div>

          {/* Card Thông Tin Doanh Nghiệp */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-3 text-xs shadow-sm">
            <div className="font-semibold text-slate-700 border-b border-slate-100 pb-2 uppercase tracking-wider">
              Chỉ Số Cơ Bản ({stock.symbol})
            </div>
            
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Vốn hóa thị trường</span>
              <span className="font-mono font-semibold text-slate-800">{stock.marketCap || '168,450 Tỷ'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Chỉ số P/E</span>
              <span className="font-mono font-semibold text-slate-800">{stock.pe || '18.4'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Chỉ số P/B</span>
              <span className="font-mono font-semibold text-slate-800">{stock.pb || '3.2'}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Khối lượng GD TB</span>
              <span className="font-mono font-semibold text-slate-800">{stock.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : '5.2M'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Phân Tích AI */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl animate-fade-in text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                <span className="material-symbols-outlined text-blue-600">psychology</span>
                <span>Báo Cáo Phân Tích Kỹ Thuật &amp; AI: {stock.symbol}</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-emerald-700 block mb-1">Khuyến Nghị Chính: {stock.aiSignal || 'MUA MẠNH'} (Độ tin cậy: {stock.aiScore || 90}%)</span>
                Mô hình Machine Learning XGBoost đánh giá các chỉ số dòng tiền và dao động giá của {stock.symbol} đang ở pha tích lũy mạnh và sẵn sàng bứt phá.
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-800 block">Các yếu tố kích hoạt:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Chỉ báo RSI duy trì ở ngưỡng cân bằng {stock.rsi || 58.4}.</li>
                  <li>MACD histogram phân kỳ dương trên trục 0.</li>
                  <li>Khối lượng giao dịch gia tăng liên tục qua các phiên gần nhất.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setShowAiModal(false)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xuất Báo Cáo PDF */}
      {showReportModal && (
        <StockReportModal stock={stock} onClose={() => setShowReportModal(false)} />
      )}

    </div>
  );
}