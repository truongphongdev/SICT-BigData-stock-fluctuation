// Dataset mô phỏng rổ chỉ số VN30 & Bộ tạo dữ liệu Biểu đồ nến TradingView

export const INITIAL_VN30_STOCKS = [
  {
    symbol: 'FPT',
    name: 'Công ty Cổ phần FPT',
    sector: 'Công nghệ & Viễn thông',
    price: 132.50,
    change: 2.80,
    changePercent: 2.16,
    volume: '4,520,100',
    marketCap: '168,450 Tỷ',
    pe: '22.4',
    eps: '5,915 VNĐ',
    aiSignal: 'MUA MẠNH',
    aiSignalColor: 'text-market-up',
    aiScore: 94,
    aiSummary: 'Dòng tiền khối ngoại và tổ chức liên tục gia tăng trước triển vọng mảng AI & Cloud toàn cầu. Chỉ báo RSI bật tăng từ vùng trung tính (58), MA20 cắt lên MA50 xác nhận xu hướng tăng vượt đỉnh lịch sử.',
    resistance: 138.00,
    support: 128.50,
    rsi: 64.2,
    macd: '+1.45 (Bullish)'
  },
  {
    symbol: 'HPG',
    name: 'Tập đoàn Hòa Phát',
    sector: 'Vật liệu xậy dựng / Thép',
    price: 29.15,
    change: 0.65,
    changePercent: 2.28,
    volume: '24,180,450',
    marketCap: '169,500 Tỷ',
    pe: '14.8',
    eps: '1,970 VNĐ',
    aiSignal: 'MUA',
    aiSignalColor: 'text-market-up',
    aiScore: 88,
    aiSummary: 'Sản lượng tiêu thụ thép xây dựng và HRC bứt phá mạnh, lò cao Dung Quất 2 bám sát tiến độ. Volume đột biến gấp 1.5 lần trung bình 20 phiên.',
    resistance: 31.00,
    support: 28.00,
    rsi: 61.5,
    macd: '+0.32 (Bullish)'
  },
  {
    symbol: 'TCB',
    name: 'Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)',
    sector: 'Tài chính / Ngân hàng',
    price: 49.20,
    change: -0.40,
    changePercent: -0.81,
    volume: '8,950,300',
    marketCap: '173,200 Tỷ',
    pe: '7.6',
    eps: '6,470 VNĐ',
    aiSignal: 'NẮM GIỮ',
    aiSignalColor: 'text-primary',
    aiScore: 78,
    aiSummary: 'Tích lũy chặt chẽ vùng giá 49.0 - 50.0 sau nỗ lực bứt phá chưa thành. CASA phục hồi tích cực lên mức dẫn đầu toàn ngành.',
    resistance: 51.50,
    support: 47.80,
    rsi: 52.0,
    macd: '-0.15 (Neutral)'
  },
  {
    symbol: 'VCB',
    name: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
    sector: 'Tài chính / Ngân hàng',
    price: 92.40,
    change: 1.10,
    changePercent: 1.20,
    volume: '1,840,000',
    marketCap: '516,800 Tỷ',
    pe: '15.2',
    eps: '6,080 VNĐ',
    aiSignal: 'MUA',
    aiSignalColor: 'text-market-up',
    aiScore: 86,
    aiSummary: 'Trụ đỡ vững chắc của thị trường VN30. Nợ xấu kiểm soát mức rất thấp dưới 0.9%, định giá vùng an toàn với dòng tiền định chế dẫn dắt.',
    resistance: 95.00,
    support: 90.00,
    rsi: 59.4,
    macd: '+0.85 (Bullish)'
  },
  {
    symbol: 'VIC',
    name: 'Tập đoàn Vingroup',
    sector: 'Bất động sản / Tập đoàn đa ngành',
    price: 43.80,
    change: -0.70,
    changePercent: -1.57,
    volume: '6,420,100',
    marketCap: '167,400 Tỷ',
    pe: '28.5',
    eps: '1,530 VNĐ',
    aiSignal: 'BÁN',
    aiSignalColor: 'text-market-down',
    aiScore: 62,
    aiSummary: 'Chịu áp lực chốt lời ngắn hạn và bán ròng từ khối ngoại. Cần chờ kiểm định lại vùng hỗ trợ tâm lý 42.0 trước khi giải ngân mớI.',
    resistance: 46.50,
    support: 42.00,
    rsi: 44.1,
    macd: '-0.54 (Bearish)'
  },
  {
    symbol: 'SSI',
    name: 'Công ty Cổ phần Chứng khoán SSI',
    sector: 'Dịch vụ Tài chính / Chứng khoán',
    price: 35.60,
    change: 1.20,
    changePercent: 3.49,
    volume: '18,650,200',
    marketCap: '53,800 Tỷ',
    pe: '18.1',
    eps: '1,960 VNĐ',
    aiSignal: 'MUA MẠNH',
    aiSignalColor: 'text-market-up',
    aiScore: 95,
    aiSummary: 'Cổ phiếu nhạy nhất với động lực nâng hạng thị trường KRX & FTSE. Đã hình thành mẫu hình Nền trên nền (Cup and Handle), khối lượng vỡ cản cực kỳ thuyết phục.',
    resistance: 38.00,
    support: 33.80,
    rsi: 68.9,
    macd: '+0.92 (Strong Bullish)'
  },
  {
    symbol: 'VHM',
    name: 'Công ty Cổ phần Vinhomes',
    sector: 'Bất động sản',
    price: 42.10,
    change: 0.30,
    changePercent: 0.72,
    volume: '5,120,400',
    marketCap: '183,300 Tỷ',
    pe: '8.4',
    eps: '5,010 VNĐ',
    aiSignal: 'NẮM GIỮ',
    aiSignalColor: 'text-primary',
    aiScore: 76,
    aiSummary: 'Doanh số bán hàng bàn giao dự án Vinhomes Royal Island tiếp tục hạch toán tích cực. Mô hình biểu đồ đang sideway biên độ hẹp chờ cú hích thanh khoản.',
    resistance: 44.50,
    support: 40.80,
    rsi: 51.3,
    macd: '+0.08 (Neutral)'
  },
  {
    symbol: 'MWG',
    name: 'Công ty Cổ phần Đầu tư Thế Giới Di Động',
    sector: 'Bán lẻ & Hàng tiêu dùng',
    price: 67.80,
    change: 1.80,
    changePercent: 2.73,
    volume: '9,840,300',
    marketCap: '99,100 Tỷ',
    pe: '25.3',
    eps: '2,680 VNĐ',
    aiSignal: 'MUA',
    aiSignalColor: 'text-market-up',
    aiScore: 91,
    aiSummary: 'Chuỗi Bách Hóa Xanh duy trì đà có lãi vững chắc, doanh số bán lẻ phục hồi theo chu kỳ cuối năm. AI phát hiện dòng tiền Big Boys gom vùng 65.',
    resistance: 72.00,
    support: 64.50,
    rsi: 64.0,
    macd: '+1.10 (Bullish)'
  },
  {
    symbol: 'VPB',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)',
    sector: 'Tài chính / Ngân hàng',
    price: 19.40,
    change: 0.15,
    changePercent: 0.78,
    volume: '14,250,800',
    marketCap: '154,000 Tỷ',
    pe: '11.5',
    eps: '1,680 VNĐ',
    aiSignal: 'MUA',
    aiSignalColor: 'text-market-up',
    aiScore: 82,
    aiSummary: 'Năng lực vốn hàng đầu sau khi SMBC tham gia cổ đông chiến lược. FE Credit có dấu hiệu hồi phục biên lợi nhuận.',
    resistance: 20.80,
    support: 18.70,
    rsi: 56.7,
    macd: '+0.18 (Bullish)'
  },
  {
    symbol: 'MSN',
    name: 'Công ty Cổ phần Tập đoàn Masan',
    sector: 'Tiêu dùng nhanh (FMCG)',
    price: 76.50,
    change: -0.80,
    changePercent: -1.03,
    volume: '3,810,600',
    marketCap: '109,200 Tỷ',
    pe: '32.1',
    eps: '2,380 VNĐ',
    aiSignal: 'NẮM GIỮ',
    aiSignalColor: 'text-primary',
    aiScore: 74,
    aiSummary: 'WinCommerce bùng nổ chuỗi bán lẻ nông thôn MiniMall. Cổ phiếu điền vào nền giá tích lũy ổn định, kiên nhẫn chờ động lượng mua lên.',
    resistance: 80.00,
    support: 74.00,
    rsi: 48.5,
    macd: '-0.21 (Neutral)'
  }
];

/**
 * Tạo dữ liệu lịch sử nến (Candle data) cho Lightweight Charts theo chronological order
 * @param {number} basePrice Giá hiện tại (khớp với kết nến ngày cuối cùng)
 * @param {number} totalDays Số phiên giao dịch quay lui
 */
export function generateCandleData(basePrice = 100, totalDays = 90) {
  const data = [];
  
  // Tạo danh sách ngày giao dịch trong quá khứ theo từng ngày một (bỏ qua thứ 7 và Chủ nhật)
  const dates = [];
  const curr = new Date();
  while (dates.length < totalDays) {
    curr.setDate(curr.getDate() - 1);
    const dayOfWeek = curr.getDay();
    // 0 là Chủ Nhật, 6 là Thứ 7
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
  }
  // Đảo ngược để có danh sách ngày tăng dần chặt chẽ (từ quá khứ tới hiện tại)
  dates.reverse();

  // Tạo giá mô phỏng theo nến khớp đúng với từng ngày
  let currentClose = Number((basePrice * 0.85).toFixed(2));
  for (let i = 0; i < totalDays; i++) {
    const volatility = basePrice * 0.03;
    const change = (Math.random() - 0.45) * volatility; // xu hướng hướng lên nhỉnh hơn
    
    let open = currentClose;
    let close = Number((open + change).toFixed(2));
    if (i === totalDays - 1) {
      // Phiên gần nhất chốt giá khớp chính xác với giá hiện tại trên bảng điện
      close = Number(basePrice.toFixed(2));
    }
    
    let high = Number((Math.max(open, close) + Math.random() * (volatility * 0.5)).toFixed(2));
    let low = Number((Math.min(open, close) - Math.random() * (volatility * 0.5)).toFixed(2));
    if (low <= 0.1) low = 0.5;

    const volume = Math.floor(Math.random() * 8000000) + 2500000;

    data.push({
      time: dates[i],
      open,
      high,
      low,
      close,
      volume
    });

    currentClose = close;
  }

  return data;
}
