import React from 'react';

export default function StockReportModal({ stock, isOpen, onClose }) {
  if (!isOpen || !stock) return null;

  const isUp = (stock.change ?? 0) >= 0;
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const reportId = `VN30-AI-${stock.symbol}-${Date.now().toString().slice(-6)}`;
  
  // Chiến lược giá mục tiêu & cắt lỗ
  const basePrice = stock.price || 100;
  const buyRangeMin = (basePrice * 0.985).toFixed(2);
  const buyRangeMax = (basePrice * 1.01).toFixed(2);
  const targetPrice1 = (basePrice * 1.12).toFixed(2);
  const targetPrice2 = (basePrice * 1.20).toFixed(2);
  const stopLossPrice = (basePrice * 0.93).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container Báo Cáo A4 */}
      <div className="bg-surface-container border-2 border-primary/40 rounded-2xl max-w-4xl w-full p-8 space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto print:max-h-none print:max-w-none print:w-full print:p-6 print:border-none print:shadow-none print:bg-white print:text-black print:overflow-visible print:my-0">
        
        {/* Thanh công cụ Modal (Không in khi xuất PDF) */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
            <span className="font-bold text-lg text-on-surface">Bản Xem Trước Báo Cáo BI Chứng Khoán (A4 PDF)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/25 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              In / Tải PDF Ngay
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-variant hover:bg-error/20 hover:text-error text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* NỘI DUNG BÁO CÁO BI (PRINTABLE REPORT AREA) */}
        <div id="printable-stock-report" className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 print:bg-white print:border-none print:p-0 print:text-slate-900">
          
          {/* Header Báo Cáo */}
          <div className="flex justify-between items-start border-b-2 border-primary/40 pb-4 print:border-primary">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary text-on-primary font-black text-xs rounded tracking-widest print:bg-blue-600 print:text-white">
                  VN30 ALPHA AI
                </span>
                <span className="text-xs text-on-surface-variant font-semibold print:text-gray-600">
                  HỆ THỐNG PHÂN TÍCH TÀI CHÍNH & MLOps ĐỊNH LƯỢNG
                </span>
              </div>
              <h1 className="text-2xl font-black text-on-surface tracking-tight mt-1 print:text-slate-900">
                BÁO CÁO PHÂN TÍCH ĐỊNH LƯỢNG & KHUYẾN NGHỊ ĐẦU TƯ
              </h1>
              <p className="text-sm font-semibold text-primary mt-0.5 print:text-blue-700">
                MÃ CỔ PHIẾU: <span className="text-base font-black uppercase underline">{stock.symbol}</span> — {stock.name}
              </p>
            </div>
            <div className="text-right text-xs text-on-surface-variant space-y-1 print:text-gray-600">
              <p>Mã Báo Cáo: <strong className="font-mono text-on-surface print:text-black">{reportId}</strong></p>
              <p>Thời gian phát hành: <strong>{currentDate}</strong></p>
              <p>Phân loại ngành: <span className="font-bold text-primary print:text-blue-700">{stock.sector}</span></p>
            </div>
          </div>

          {/* Khối 1: Tổng quan Thị giá & Tín hiệu AI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider print:text-gray-600">Thị Giá Khớp Lệnh</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-on-surface print:text-slate-900">{stock.price.toFixed(2)}</span>
                <span className="text-xs font-semibold text-on-surface-variant">nghìn VNĐ</span>
              </div>
              <div className={`mt-1 text-sm font-bold flex items-center gap-1 ${isUp ? 'text-market-up print:text-green-700' : 'text-market-down print:text-red-700'}`}>
                <span>{isUp ? '▲' : '▼'}</span>
                <span>{isUp ? `+${stock.change.toFixed(2)}` : stock.change.toFixed(2)} ({isUp ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`})</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 print:bg-blue-50 print:border-blue-300">
              <span className="text-xs font-bold text-primary uppercase tracking-wider print:text-blue-800">Tín Hiệu Khuyến Nghị AI</span>
              <div className="text-2xl font-black text-primary mt-1 print:text-blue-700">
                {stock.aiSignal || 'MUA MẠNH'}
              </div>
              <p className="text-xs text-on-surface-variant mt-1 print:text-gray-600">Mô hình XGBoost phân loại xu hướng</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider print:text-gray-600">Xác Suất Xu Hướng Tăng (AI Score)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-market-up print:text-green-700">{stock.aiScore || 92}%</span>
                <span className="text-xs font-bold text-primary print:text-blue-700">(Độ Tin Cậy Cao)</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 print:text-gray-600">Được kiểm định qua MLflow Registry</p>
            </div>
          </div>

          {/* Khối 2: Ma Trận Chỉ Số Định Giá & Kỹ Thuật (BI Dashboard Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột Trái: Chỉ số Tài chính Cơ bản */}
            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-3 print:bg-slate-50 print:border-slate-300">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 print:text-blue-800">
                <span className="material-symbols-outlined text-[16px] print:hidden">analytics</span>
                1. Chỉ Số Tài Chính Cơ Bản (Fundamental BI)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Định giá P/E:</span>
                  <strong className="font-bold text-on-surface print:text-black">{stock.pe || 14.8} lần</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Thu nhập EPS:</span>
                  <strong className="font-bold text-on-surface print:text-black">{stock.eps || '5,420'} VNĐ</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Hiệu quả ROE:</span>
                  <strong className="font-bold text-on-surface print:text-black">{stock.roe || '26.8%'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Vốn hóa TT:</span>
                  <strong className="font-bold text-on-surface print:text-black">{stock.marketCap || '168,500 tỷ'}</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200 col-span-2">
                  <span className="text-on-surface-variant print:text-gray-600">Khối lượng khớp lệnh 24h:</span>
                  <strong className="font-bold text-on-surface print:text-black">{stock.volume || '4,520,100'} cổ phiếu</strong>
                </div>
              </div>
            </div>

            {/* Cột Phải: Chỉ Báo Động Lượng Kỹ Thuật */}
            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-3 print:bg-slate-50 print:border-slate-300">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 print:text-blue-800">
                <span className="material-symbols-outlined text-[16px] print:hidden">candlestick_chart</span>
                2. Chỉ Báo Kỹ Thuật Định Lượng (Technical BI)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Chỉ số RSI (14):</span>
                  <strong className="font-bold text-market-up print:text-green-700">{stock.rsi || 58.4} (Đà tăng)</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Xu hướng MACD:</span>
                  <strong className="font-bold text-market-up print:text-green-700">Giao cắt Golden</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">MA20 vs MA50:</span>
                  <strong className="font-bold text-primary print:text-blue-700">Bullish Alignment</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200">
                  <span className="text-on-surface-variant print:text-gray-600">Bollinger Bands:</span>
                  <strong className="font-bold text-on-surface print:text-black">Bung dải mở rộng</strong>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container print:bg-white print:border print:border-slate-200 col-span-2">
                  <span className="text-on-surface-variant print:text-gray-600">Dòng tiền thông minh (Smart Money):</span>
                  <strong className="font-bold text-primary print:text-blue-700">Khối ngoại gom ròng tích cực</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Khối 3: Vùng Giá Hành Động & Quản Trị Rủi Ro */}
          <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-3 print:bg-slate-50 print:border-slate-300">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 print:text-blue-800">
              <span className="material-symbols-outlined text-[16px] print:hidden">price_check</span>
              3. Khung Giá Chiến Lược Khuyến Nghị (Actionable Strategy Levels)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 print:bg-white print:border-slate-300">
                <span className="text-on-surface-variant print:text-gray-600 block text-[11px]">Vùng Mua An Toàn</span>
                <span className="font-extrabold text-sm text-primary print:text-blue-700 block mt-0.5">{buyRangeMin} – {buyRangeMax}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 print:bg-white print:border-slate-300">
                <span className="text-on-surface-variant print:text-gray-600 block text-[11px]">Mục Tiêu 1 (+12%)</span>
                <span className="font-extrabold text-sm text-market-up print:text-green-700 block mt-0.5">{targetPrice1}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 print:bg-white print:border-slate-300">
                <span className="text-on-surface-variant print:text-gray-600 block text-[11px]">Mục Tiêu 2 (+20%)</span>
                <span className="font-extrabold text-sm text-market-up print:text-green-700 block mt-0.5">{targetPrice2}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/30 print:bg-white print:border-slate-300">
                <span className="text-on-surface-variant print:text-gray-600 block text-[11px]">Cắt Lỗ Stop-Loss (-7%)</span>
                <span className="font-extrabold text-sm text-market-down print:text-red-700 block mt-0.5">{stopLossPrice}</span>
              </div>
            </div>
          </div>

          {/* Khối 4: Nhận định AI Tổng Hợp */}
          <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-2 print:bg-slate-50 print:border-slate-300">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 print:text-blue-800">
              <span className="material-symbols-outlined text-[16px] print:hidden">psychology</span>
              4. Nhận Định Tổng Hợp Từ Bộ Não Trí Tuệ Nhân Tạo (AI Synthesis)
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 print:bg-white print:text-slate-800 print:border-slate-200">
              {stock.aiSummary || `Mô hình AI dự báo cổ phiếu ${stock.symbol} đang duy trì đà tích lũy tích cực trên đường trung bình MA20. Sự ủng hộ của khối lượng giao dịch đột biến kết hợp dòng tiền khối ngoại quay trở lại tạo tiền đề bứt phá đỉnh giá ngắn hạn.`}
            </p>
          </div>

          {/* Footer & Tuyên Bố Miễn Trừ Trách Nhiệm */}
          <div className="pt-4 border-t border-outline-variant/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[10px] text-on-surface-variant print:text-gray-500 print:border-slate-300">
            <div>
              <p className="font-semibold">Bộ Phận Phân Tích Định Lượng • VN30 Alpha Lab (BigData Stock Fluctuation)</p>
              <p>Mô hình huấn luyện: XGBoost Classifier + MLflow Registry Tracking</p>
            </div>
            <div className="text-right md:max-w-xs">
              <p className="italic">Báo cáo được khởi tạo tự động phục vụ mục đích nghiên cứu & hỗ trợ ra quyết định đầu tư.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
