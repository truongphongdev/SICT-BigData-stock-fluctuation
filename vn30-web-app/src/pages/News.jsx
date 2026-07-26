import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';

const MOCK_NEWS = [
  {
    id: 1,
    title: "FPT bùng nổ đơn hàng chuyển đổi số toàn cầu, lợi nhuận trước thuế tăng 24.5% so với cùng kỳ",
    summary: "Dòng tiền từ khối ngoại tiếp tục bứt phá tại FPT sau khi công ty công bố các thỏa thuận hợp tác bán dẫn và trí tuệ nhân tạo (AI) trị giá trên 100 triệu USD với đối tác Mỹ và Nhật Bản.",
    category: "💻 Công Nghệ & Bán Lẻ",
    symbol: "FPT",
    time: "12 phút trước",
    source: "VN30 Alpha Research",
    sentiment: "TÍCH CỰC",
    sentimentScore: 96,
    impactColor: "text-market-up",
    badgeBg: "bg-market-up/15 text-market-up border-market-up/30",
    tags: ["Chuyển đổi số", "Bán dẫn", "Khối ngoại gom"]
  },
  {
    id: 2,
    title: "HPG: Lò cao số 2 Dung Quất chuẩn bị bốc lửa, sản lượng thép cuộn cán nóng (HRC) dự kiến tăng gấp đôi",
    summary: "Với chi phí sản xuất được tiết giảm tới 8% nhờ chuyển đổi năng lượng xanh, biên lợi nhuận gộp của Tập đoàn Hòa Phát được AI dự báo sẽ bùng nổ trong quý tới khi nhu cầu hạ tầng phục hồi.",
    category: "🏭 Bất Động Sản & Thép",
    symbol: "HPG",
    time: "38 phút trước",
    source: "Bloomberg Vietnam",
    sentiment: "MUA MẠNH",
    sentimentScore: 92,
    impactColor: "text-primary",
    badgeBg: "bg-primary-container/30 text-primary border-primary/40 ai-glow",
    tags: ["Dung Quất 2", "HRC", "Đầu tư công"]
  },
  {
    id: 3,
    title: "VCB duy trì vị thế 'Anh cả' ngân hàng với CASA dẫn đầu, trích lập dự phòng giảm mạnh giúp LNTT vượt đỉnh",
    summary: "Tỷ lệ nợ xấu duy trì dưới 0.8% - mức thấp nhất toàn bộ hệ thống tài chính Việt Nam. Lực mua chủ động từ các Quỹ ETF chi phối bảng điện phiên chiều nay.",
    category: "🏦 Ngân Hàng & Tài Chính",
    symbol: "VCB",
    time: "1 giờ trước",
    source: "FireAnt Financial AI",
    sentiment: "TÍCH CỰC",
    sentimentScore: 88,
    impactColor: "text-market-up",
    badgeBg: "bg-market-up/15 text-market-up border-market-up/30",
    tags: ["CASA", "Top Ngân hàng", "ETF gom"]
  },
  {
    id: 4,
    title: "SSI ghi nhận thanh khoản phái sinh và dư nợ cho vay margin vượt 20,000 tỷ đồng trước làn sóng KRX",
    summary: "Hoạt động tự doanh và cho vay ký quỹ của SSI tiếp tục mang về doanh thu thặng dư lớn khi thị trường chứng khoán trong nước liên tục duy trì giá trị khớp lệnh trên 1 tỷ USD/phiên.",
    category: "🏦 Ngân Hàng & Tài Chính",
    symbol: "SSI",
    time: "2 giờ trước",
    source: "VnEconomy & AI Alpha",
    sentiment: "MUA MẠNH",
    sentimentScore: 94,
    impactColor: "text-primary",
    badgeBg: "bg-primary-container/30 text-primary border-primary/40 ai-glow",
    tags: ["KRX", "Margin record", "Thanh khoản"]
  },
  {
    id: 5,
    title: "MWG: Chuỗi Bách Hóa Xanh giữ vững chuỗi 6 tháng liên tiếp có lãi thuần, đóng góp 38% tổng doanh thu",
    summary: "Tối ưu hóa hành trình logistics và giảm hao hụt hàng tươi sống đã giúp Bách Hóa Xanh lột xác hoàn toàn. Mô hình AI Alpha phát hiện dấu hiệu tích lũy nền giá tại vùng cản 65.",
    category: "💻 Công Nghệ & Bán Lẻ",
    symbol: "MWG",
    time: "3 giờ trước",
    source: "Cafef & Alpha Engine",
    sentiment: "TÍCH CỰC",
    sentimentScore: 85,
    impactColor: "text-market-up",
    badgeBg: "bg-market-up/15 text-market-up border-market-up/30",
    tags: ["Bách Hóa Xanh", "Bán lẻ", "Turnaround"]
  },
  {
    id: 6,
    title: "TCB (Techcombank) công bố lộ trình thanh toán cổ tức bằng tiền mặt tỷ lệ 15% sau hơn thập kỷ tích lũy vốn",
    summary: "Chính sách chia thưởng cổ tức bằng tiền mặt kết hợp vị thế tiền gửi CASA khôi phục mạnh vùng 40% làm bùng nổ lượng mua ròng từ các nhà đầu tư cá nhân VIP.",
    category: "🏦 Ngân Hàng & Tài Chính",
    symbol: "TCB",
    time: "4 giờ trước",
    source: "VN30 Alpha Research",
    sentiment: "TÍCH CỰC",
    sentimentScore: 89,
    impactColor: "text-market-up",
    badgeBg: "bg-market-up/15 text-market-up border-market-up/30",
    tags: ["Cổ tức tiền mặt", "CASA 40%", "Ngân hàng"]
  },
  {
    id: 7,
    title: "VIC (Vingroup) đẩy mạnh cam kết trung hòa carbon và bàn giao lô xe điện VinFast xuất khẩu tiếp theo",
    summary: "Diễn biến kỹ thuật giao dịch xung quanh EMA50 đang tạo tín hiệu rút rủi ro ngắn hạn, nhà đầu tư chờ đợi số liệu giao xe chính thức và sự mở rộng hệ thống trạm sạc toàn quốc.",
    category: "🏭 Bất Động Sản & Thép",
    symbol: "VIC",
    time: "5 giờ trước",
    source: "Reuters Vietnam",
    sentiment: "TRUNG TÍNH",
    sentimentScore: 72,
    impactColor: "text-amber-400",
    badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    tags: ["Xe điện", "ESG Green", "Tích lũy"]
  },
  {
    id: 8,
    title: "VHM (Vinhomes): Đẩy nhanh quy hoạch đại đô thị lấn biển và kích hoạt chu kỳ bàn giao phân khu Royal Island",
    summary: "Dòng tiền tín dụng cho vay Bất động sản bán lẻ bắt đầu quay trở lại, hỗ trợ mạnh cho thanh khoản các dự án mới gia nhập thị trường của VHM.",
    category: "🏭 Bất Động Sản & Thép",
    symbol: "VHM",
    time: "6 giờ trước",
    source: "Bloomberg Vietnam",
    sentiment: "TÍCH CỰC",
    sentimentScore: 79,
    impactColor: "text-market-up",
    badgeBg: "bg-market-up/15 text-market-up border-market-up/30",
    tags: ["Royal Island", "Đô thị lấn biển", "Bất động sản"]
  }
];

const CATEGORIES = ["Tất cả tin tức", "🔥 Khuyến Nghị Mua Mạnh", "🏦 Ngân Hàng & Tài Chính", "💻 Công Nghệ & Bán Lẻ", "🏭 Bất Động Sản & Thép"];

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả tin tức");
  const [searchQuery, setSearchQuery] = useState('');
  const { getStockBySymbol } = useMarket();

  const filteredNews = MOCK_NEWS.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (selectedCategory === "Tất cả tin tức") return true;
    if (selectedCategory === "🔥 Khuyến Nghị Mua Mạnh") return article.sentiment === "MUA MẠNH" || article.sentimentScore >= 90;
    return article.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/50 pb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
            <span>Trang chủ</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Trung Tâm Tin Tức &amp; Báo Cáo AI</span>
          </nav>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-3xl font-extrabold text-on-surface">Tin Tức Tài Chính &amp; Đánh Giá Sóng AI</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-primary/20 text-amber-300 rounded-full text-xs font-black border border-amber-400/30 shadow-sm animate-pulse">
              ⚡ LIVE NEWS FEED
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
            Tự động lọc và thẩm định động lượng thị trường từ báo chí tài chính uy tín bởi VN30 Alpha Engine
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input 
            type="text"
            placeholder="Lọc theo mã (FPT), chủ đề, từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface font-medium placeholder:text-on-surface-variant/50 shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border shrink-0 ${
              selectedCategory === cat 
                ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-105 font-extrabold' 
                : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/40 hover:text-on-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Layout: News Cards & Sidebar AI Macro Report */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Feed List (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {filteredNews.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-dashed border-outline-variant space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">article</span>
              <p className="text-base font-bold text-on-surface">Không tìm thấy bản tin nào phù hợp với bộ lọc</p>
              <button 
                onClick={() => { setSelectedCategory("Tất cả tin tức"); setSearchQuery(''); }}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs"
              >
                Xem toàn bộ tin tức VN30
              </button>
            </div>
          ) : (
            filteredNews.map((article) => {
              const stock = getStockBySymbol(article.symbol);
              return (
                <div 
                  key={article.id} 
                  className="glass-panel p-6 rounded-3xl border border-outline-variant hover:border-primary/50 transition-all shadow-md hover:shadow-xl group flex flex-col justify-between space-y-4 bg-gradient-to-br from-surface via-surface to-surface-container/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-surface-container-high rounded-md text-[11px] font-bold text-on-surface">
                        {article.source}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {article.time}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-primary">{article.category}</span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`px-3 py-1 rounded-xl font-black text-xs border ${article.badgeBg}`}>
                        AI: {article.sentiment} ({article.sentimentScore}%)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-headline-md text-lg font-extrabold text-on-surface group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant/30">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {article.tags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] bg-surface-variant/70 text-on-surface-variant px-2.5 py-1 rounded-lg font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {stock && (
                        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline/20">
                          <span className="font-black text-xs text-primary">{stock.symbol}:</span>
                          <span className="font-mono font-bold text-xs text-on-surface">{stock.price.toFixed(2)}</span>
                          <span className={`text-[11px] font-extrabold ${stock.change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                            ({stock.change >= 0 ? `+${stock.changePercent}%` : `${stock.changePercent}%`})
                          </span>
                        </div>
                      )}
                      <Link 
                        to={`/stock/${article.symbol}`}
                        className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:brightness-110 shadow-sm transition-all whitespace-nowrap active:scale-95"
                      >
                        <span>Mở Chart Nến</span>
                        <span className="material-symbols-outlined text-[15px]">candlestick_chart</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar Macro Intelligence Report (4 Cols) */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="ai-gradient-border p-[1px] rounded-3xl shadow-2xl shadow-primary/10">
            <div className="bg-surface-container-high rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2.5 text-primary border-b border-outline-variant/40 pb-4">
                <span className="material-symbols-outlined text-3xl sparkle-float" style={{ "fontVariationSettings": "'FILL' 1" }}>auto_awesome</span>
                <div>
                  <h3 className="font-headline-md font-extrabold text-on-surface text-lg">Tầm Nhìn Vĩ Mô Tuần Báo</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">Tổng hợp tự động từ 150+ nguồn báo chí</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="p-3.5 bg-surface-variant/40 rounded-2xl border border-white/5 space-y-1.5">
                  <span className="font-bold text-primary flex items-center gap-1.5 uppercase text-[11px]">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    Động Lượng Dòng Tiền Ngoại
                  </span>
                  <p className="text-on-surface leading-relaxed text-xs">
                    Khối ngoại ngắt chuỗi bán ròng tại nhóm Công nghệ &amp; Bán lẻ (FPT, MWG). Tỷ trọng vốn cam kết cho thị trường Việt Nam vượt 1.8 tỷ USD.
                  </p>
                </div>

                <div className="p-3.5 bg-surface-variant/40 rounded-2xl border border-white/5 space-y-1.5">
                  <span className="font-bold text-market-up flex items-center gap-1.5 uppercase text-[11px]">
                    <span className="material-symbols-outlined text-sm">energy_savings_leaf</span>
                    Ngành Đang Hút Sóng Nhất
                  </span>
                  <p className="text-on-surface leading-relaxed text-xs">
                    Nhóm <strong>Ngân hàng CASA cao (VCB, TCB, MBB)</strong> và <strong>Thép (HPG)</strong> chiếm hơn 62% tổng thanh khoản khớp lệnh toàn VN30 trong 3 phiên gần đây.
                  </p>
                </div>

                <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-on-surface">AI Market Sentiment Index</span>
                    <span className="font-black text-market-up text-sm">84 / 100 (BULLISH)</span>
                  </div>
                  <div className="w-full bg-surface-dim h-2 rounded-full overflow-hidden border border-outline-variant/30">
                    <div className="bg-gradient-to-r from-market-up/70 via-market-up to-primary h-full w-[84%] rounded-full shadow-sm"></div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block italic">
                    *Tâm lý thị trường đang trong vùng hưng phấn tích cực, ưu tiên nắm giữ các mã gia tăng khối lượng đột phá.
                  </span>
                </div>
              </div>

              <Link 
                to="/portfolio" 
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-extrabold rounded-2xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 text-xs transition-all active:scale-95 uppercase tracking-wider"
              >
                <span>Kiểm tra danh mục của bạn ngay</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Quick Hot Topics */}
          <div className="glass-panel p-6 rounded-3xl border border-outline-variant space-y-4 shadow-md">
            <h4 className="font-label-caps text-xs font-extrabold text-on-surface-variant tracking-wider uppercase border-b border-outline-variant/30 pb-3">
              Chủ Đề Tiêu Điểm Trong Tuần
            </h4>
            <div className="flex flex-wrap gap-2">
              {["#HệThốngKRX", "#BáoCáoQuý3", "#LãiSuấtFed", "#KhốiNgoạiGom", "#CổTứcTiềnMặt", "#NăngLượngXanh", "#VượtĐỉnh1300", "#AIAlphaEngine"].map((topic, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSearchQuery(topic.replace('#', ''))}
                  className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary text-xs rounded-xl font-bold transition-all border border-outline-variant/30"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
