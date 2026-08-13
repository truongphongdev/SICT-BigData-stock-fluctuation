"""
Database Seeder for VN30 Stocks, Historical OHLCV, News, and Demo User.
Populates realistic seed data when tables are empty.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.stock import Stock
from app.models.stock_history import StockHistory
from app.models.portfolio import PortfolioItem
from app.models.news import NewsArticle
from app.core.security import get_password_hash
import numpy as np

logger = logging.getLogger(__name__)

# Complete list of VN30 constituent stocks
VN30_INITIAL_DATA = [
    {
        "symbol": "FPT",
        "name": "Công ty Cổ phần FPT",
        "sector": "Công nghệ & Viễn thông",
        "price": 132.50,
        "change": 2.80,
        "change_percent": 2.16,
        "volume": "4,520,100",
        "market_cap": "168,450 Tỷ",
        "pe": "22.4",
        "eps": "5,915 VNĐ",
        "roe": "26.2%",
        "high_52w": 138.0,
        "low_52w": 82.0,
        "foreign_buy": "1,420,000",
        "foreign_sell": "250,000",
        "ai_signal": "MUA MẠNH",
        "ai_score": 94,
        "ai_summary": "Dòng tiền khối ngoại và tổ chức liên tục gia tăng trước triển vọng mảng AI & Cloud toàn cầu. Chỉ báo RSI bật tăng từ vùng trung tính (58), MA20 cắt lên MA50 xác nhận xu hướng tăng vượt đỉnh lịch sử.",
        "resistance": 138.00,
        "support": 128.50,
        "rsi": 64.2,
        "macd": "+1.45 (Bullish)"
    },
    {
        "symbol": "HPG",
        "name": "Tập đoàn Hòa Phát",
        "sector": "Thép & BĐS",
        "price": 29.15,
        "change": 0.65,
        "change_percent": 2.28,
        "volume": "24,180,450",
        "market_cap": "169,500 Tỷ",
        "pe": "14.8",
        "eps": "1,970 VNĐ",
        "roe": "14.5%",
        "high_52w": 31.5,
        "low_52w": 23.0,
        "foreign_buy": "5,800,000",
        "foreign_sell": "1,200,000",
        "ai_signal": "MUA",
        "ai_score": 88,
        "ai_summary": "Sản lượng tiêu thụ thép xây dựng và HRC bứt phá mạnh, lò cao Dung Quất 2 bám sát tiến độ. Volume đột biến gấp 1.5 lần trung bình 20 phiên.",
        "resistance": 31.00,
        "support": 28.00,
        "rsi": 61.5,
        "macd": "+0.32 (Bullish)"
    },
    {
        "symbol": "TCB",
        "name": "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
        "sector": "Ngân Hàng",
        "price": 49.20,
        "change": -0.40,
        "change_percent": -0.81,
        "volume": "8,950,300",
        "market_cap": "173,200 Tỷ",
        "pe": "7.6",
        "eps": "6,470 VNĐ",
        "roe": "19.8%",
        "high_52w": 52.0,
        "low_52w": 30.5,
        "foreign_buy": "2,100,000",
        "foreign_sell": "1,850,000",
        "ai_signal": "NẮM GIỮ",
        "ai_score": 78,
        "ai_summary": "Tích lũy chặt chẽ vùng giá 49.0 - 50.0 sau nỗ lực bứt phá chưa thành. CASA phục hồi tích cực lên mức dẫn đầu toàn ngành.",
        "resistance": 51.50,
        "support": 47.80,
        "rsi": 52.0,
        "macd": "-0.15 (Neutral)"
    },
    {
        "symbol": "VCB",
        "name": "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
        "sector": "Ngân Hàng",
        "price": 92.40,
        "change": 1.10,
        "change_percent": 1.20,
        "volume": "1,840,000",
        "market_cap": "516,800 Tỷ",
        "pe": "15.2",
        "eps": "6,080 VNĐ",
        "roe": "21.4%",
        "high_52w": 96.0,
        "low_52w": 78.0,
        "foreign_buy": "650,000",
        "foreign_sell": "120,000",
        "ai_signal": "MUA",
        "ai_score": 86,
        "ai_summary": "Trụ đỡ vững chắc của thị trường VN30. Nợ xấu kiểm soát mức rất thấp dưới 0.9%, định giá vùng an toàn với dòng tiền định chế dẫn dắt.",
        "resistance": 95.00,
        "support": 90.00,
        "rsi": 59.4,
        "macd": "+0.85 (Bullish)"
    },
    {
        "symbol": "VIC",
        "name": "Tập đoàn Vingroup",
        "sector": "Thép & BĐS",
        "price": 43.80,
        "change": -0.70,
        "change_percent": -1.57,
        "volume": "6,420,100",
        "market_cap": "167,400 Tỷ",
        "pe": "28.5",
        "eps": "1,530 VNĐ",
        "roe": "8.2%",
        "high_52w": 51.0,
        "low_52w": 38.5,
        "foreign_buy": "850,000",
        "foreign_sell": "2,400,000",
        "ai_signal": "BÁN",
        "ai_score": 62,
        "ai_summary": "Chịu áp lực chốt lời ngắn hạn và bán ròng từ khối ngoại. Cần chờ kiểm định lại vùng hỗ trợ tâm lý 42.0 trước khi giải ngân mới.",
        "resistance": 46.50,
        "support": 42.00,
        "rsi": 44.1,
        "macd": "-0.54 (Bearish)"
    },
    {
        "symbol": "SSI",
        "name": "Công ty Cổ phần Chứng khoán SSI",
        "sector": "Ngân Hàng",
        "price": 35.60,
        "change": 1.20,
        "change_percent": 3.49,
        "volume": "18,650,200",
        "market_cap": "53,800 Tỷ",
        "pe": "18.1",
        "eps": "1,960 VNĐ",
        "roe": "16.8%",
        "high_52w": 39.0,
        "low_52w": 26.5,
        "foreign_buy": "4,200,000",
        "foreign_sell": "950,000",
        "ai_signal": "MUA MẠNH",
        "ai_score": 95,
        "ai_summary": "Cổ phiếu nhạy nhất với động lực nâng hạng thị trường KRX & FTSE. Đã hình thành mẫu hình Nền trên nền (Cup and Handle), khối lượng vỡ cản cực kỳ thuyết phục.",
        "resistance": 38.00,
        "support": 33.80,
        "rsi": 68.9,
        "macd": "+0.92 (Strong Bullish)"
    },
    {
        "symbol": "VHM",
        "name": "Công ty Cổ phần Vinhomes",
        "sector": "Thép & BĐS",
        "price": 42.10,
        "change": 0.30,
        "change_percent": 0.72,
        "volume": "5,120,400",
        "market_cap": "183,300 Tỷ",
        "pe": "8.4",
        "eps": "5,010 VNĐ",
        "roe": "18.2%",
        "high_52w": 48.5,
        "low_52w": 36.0,
        "foreign_buy": "1,200,000",
        "foreign_sell": "850,000",
        "ai_signal": "NẮM GIỮ",
        "ai_score": 76,
        "ai_summary": "Doanh số bán hàng bàn giao dự án Vinhomes Royal Island tiếp tục hạch toán tích cực. Mô hình biểu đồ đang sideway biên độ hẹp chờ cú hích thanh khoản.",
        "resistance": 44.50,
        "support": 40.80,
        "rsi": 51.3,
        "macd": "+0.08 (Neutral)"
    },
    {
        "symbol": "MWG",
        "name": "Công ty Cổ phần Đầu tư Thế Giới Di Động",
        "sector": "Bán Lẻ & Hàng Tiêu Dùng",
        "price": 67.80,
        "change": 1.80,
        "change_percent": 2.73,
        "volume": "9,840,300",
        "market_cap": "99,100 Tỷ",
        "pe": "25.3",
        "eps": "2,680 VNĐ",
        "roe": "17.4%",
        "high_52w": 72.0,
        "low_52w": 41.0,
        "foreign_buy": "2,850,000",
        "foreign_sell": "320,000",
        "ai_signal": "MUA",
        "ai_score": 91,
        "ai_summary": "Chuỗi Bách Hóa Xanh duy trì đà có lãi vững chắc, doanh số bán lẻ phục hồi theo chu kỳ cuối năm. AI phát hiện dòng tiền Big Boys gom vùng 65.",
        "resistance": 72.00,
        "support": 64.50,
        "rsi": 64.0,
        "macd": "+1.10 (Bullish)"
    },
    {
        "symbol": "VPB",
        "name": "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)",
        "sector": "Ngân Hàng",
        "price": 19.40,
        "change": 0.15,
        "change_percent": 0.78,
        "volume": "14,250,800",
        "market_cap": "154,000 Tỷ",
        "pe": "11.5",
        "eps": "1,680 VNĐ",
        "roe": "13.2%",
        "high_52w": 21.0,
        "low_52w": 16.5,
        "foreign_buy": "3,400,000",
        "foreign_sell": "1,100,000",
        "ai_signal": "MUA",
        "ai_score": 82,
        "ai_summary": "Năng lực vốn hàng đầu sau khi SMBC tham gia cổ đông chiến lược. FE Credit có dấu hiệu hồi phục biên lợi nhuận.",
        "resistance": 20.80,
        "support": 18.70,
        "rsi": 56.7,
        "macd": "+0.18 (Bullish)"
    },
    {
        "symbol": "MSN",
        "name": "Công ty Cổ phần Tập đoàn Masan",
        "sector": "Bán Lẻ & Hàng Tiêu Dùng",
        "price": 76.50,
        "change": -0.80,
        "change_percent": -1.03,
        "volume": "3,810,600",
        "market_cap": "109,200 Tỷ",
        "pe": "32.1",
        "eps": "2,380 VNĐ",
        "roe": "11.0%",
        "high_52w": 82.0,
        "low_52w": 62.5,
        "foreign_buy": "890,000",
        "foreign_sell": "1,350,000",
        "ai_signal": "NẮM GIỮ",
        "ai_score": 74,
        "ai_summary": "WinCommerce bùng nổ chuỗi bán lẻ nông thôn MiniMall. Cổ phiếu điền vào nền giá tích lũy ổn định, kiên nhẫn chờ động lượng mua lên.",
        "resistance": 80.00,
        "support": 74.00,
        "rsi": 48.5,
        "macd": "-0.21 (Neutral)"
    },
    {
        "symbol": "MBB",
        "name": "Ngân hàng TMCP Quân Đội",
        "sector": "Ngân Hàng",
        "price": 24.80,
        "change": 0.50,
        "change_percent": 2.06,
        "volume": "16,840,000",
        "market_cap": "131,200 Tỷ",
        "pe": "5.8",
        "eps": "4,270 VNĐ",
        "roe": "23.5%",
        "high_52w": 26.0,
        "low_52w": 18.0,
        "foreign_buy": "2,900,000",
        "foreign_sell": "400,000",
        "ai_signal": "MUA MẠNH",
        "ai_score": 93,
        "ai_summary": "Tăng trưởng tín dụng vượt trội, nền tảng số hóa thu hút khách hàng trẻ. Định giá P/E hấp dẫn dưới 6 lần.",
        "resistance": 26.00,
        "support": 23.80,
        "rsi": 65.1,
        "macd": "+0.45 (Bullish)"
    },
    {
        "symbol": "ACB",
        "name": "Ngân hàng TMCP Á Châu",
        "sector": "Ngân Hàng",
        "price": 25.40,
        "change": 0.20,
        "change_percent": 0.79,
        "volume": "7,420,000",
        "market_cap": "113,500 Tỷ",
        "pe": "6.4",
        "eps": "3,960 VNĐ",
        "roe": "24.1%",
        "high_52w": 27.5,
        "low_52w": 21.0,
        "foreign_buy": "1,100,000",
        "foreign_sell": "200,000",
        "ai_signal": "MUA",
        "ai_score": 85,
        "ai_summary": "Quản trị rủi ro hàng đầu ngành với tỷ lệ bao phủ nợ xấu cao. Lực cầu ổn định từ các quỹ ngoại kín room.",
        "resistance": 26.50,
        "support": 24.50,
        "rsi": 58.2,
        "macd": "+0.22 (Bullish)"
    },
    {
        "symbol": "VNM",
        "name": "Công ty Cổ phần Sữa Việt Nam (Vinamilk)",
        "sector": "Bán Lẻ & Hàng Tiêu Dùng",
        "price": 66.20,
        "change": -0.30,
        "change_percent": -0.45,
        "volume": "3,120,000",
        "market_cap": "138,400 Tỷ",
        "pe": "15.9",
        "eps": "4,160 VNĐ",
        "roe": "28.5%",
        "high_52w": 75.0,
        "low_52w": 63.0,
        "foreign_buy": "650,000",
        "foreign_sell": "850,000",
        "ai_signal": "NẮM GIỮ",
        "ai_score": 71,
        "ai_summary": "Cổ tức tiền mặt đều đặn, tái định vị thương hiệu mang lại hiệu ứng tích cực tại các thành phố lớn.",
        "resistance": 69.00,
        "support": 64.50,
        "rsi": 46.8,
        "macd": "-0.10 (Neutral)"
    },
    {
        "symbol": "GAS",
        "name": "Tổng Công ty Khí Việt Nam (PV GAS)",
        "sector": "Công Nghệ & Viễn Thông",
        "price": 78.90,
        "change": 0.80,
        "change_percent": 1.02,
        "volume": "1,250,000",
        "market_cap": "180,600 Tỷ",
        "pe": "16.1",
        "eps": "4,900 VNĐ",
        "roe": "21.0%",
        "high_52w": 85.0,
        "low_52w": 72.0,
        "foreign_buy": "450,000",
        "foreign_sell": "180,000",
        "ai_signal": "MUA",
        "ai_score": 80,
        "ai_summary": "Kho cảng LNG Thị Vải đi vào vận hành thương mại giúp mở rộng dư địa tăng trưởng doanh thu khí đốt sạch.",
        "resistance": 82.00,
        "support": 76.50,
        "rsi": 55.4,
        "macd": "+0.35 (Bullish)"
    },
    {
        "symbol": "BID",
        "name": "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
        "sector": "Ngân Hàng",
        "price": 48.60,
        "change": 0.70,
        "change_percent": 1.46,
        "volume": "2,450,000",
        "market_cap": "278,900 Tỷ",
        "pe": "12.4",
        "eps": "3,920 VNĐ",
        "roe": "18.6%",
        "high_52w": 54.0,
        "low_52w": 41.5,
        "foreign_buy": "820,000",
        "foreign_sell": "210,000",
        "ai_signal": "MUA",
        "ai_score": 84,
        "ai_summary": "Quy mô tổng tài sản lớn nhất hệ thống, kế hoạch phát hành riêng lẻ cho đối tác ngoại thúc đẩy định giá.",
        "resistance": 51.00,
        "support": 47.00,
        "rsi": 57.8,
        "macd": "+0.42 (Bullish)"
    },
    {
        "symbol": "CTG",
        "name": "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)",
        "sector": "Ngân Hàng",
        "price": 36.25,
        "change": 0.45,
        "change_percent": 1.26,
        "volume": "6,890,000",
        "market_cap": "194,600 Tỷ",
        "pe": "9.1",
        "eps": "3,980 VNĐ",
        "roe": "17.9%",
        "high_52w": 38.5,
        "low_52w": 28.0,
        "foreign_buy": "1,650,000",
        "foreign_sell": "340,000",
        "ai_signal": "MUA",
        "ai_score": 87,
        "ai_summary": "Trích lập dự phòng rủi ro đạt đỉnh, chất lượng tài sản cải thiện rõ nét mở đường cho tăng trưởng lợi nhuận.",
        "resistance": 38.00,
        "support": 35.00,
        "rsi": 62.0,
        "macd": "+0.55 (Bullish)"
    },
    {
        "symbol": "STB",
        "name": "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)",
        "sector": "Ngân Hàng",
        "price": 31.80,
        "change": 0.90,
        "change_percent": 2.91,
        "volume": "21,450,000",
        "market_cap": "59,900 Tỷ",
        "pe": "8.2",
        "eps": "3,870 VNĐ",
        "roe": "19.2%",
        "high_52w": 34.0,
        "low_52w": 26.0,
        "foreign_buy": "3,800,000",
        "foreign_sell": "650,000",
        "ai_signal": "MUA MẠNH",
        "ai_score": 92,
        "ai_summary": "Tiến trình tái cơ cấu đề án VAMC sắp hoàn tất, kỳ vọng bán đấu giá quỹ cổ phiếu Phong Phú mang về dòng tiền khủng.",
        "resistance": 33.50,
        "support": 30.20,
        "rsi": 67.4,
        "macd": "+0.78 (Bullish)"
    },
    {
        "symbol": "HDB",
        "name": "Ngân hàng TMCP Phát triển TP.HCM (HDBank)",
        "sector": "Ngân Hàng",
        "price": 27.10,
        "change": 0.30,
        "change_percent": 1.12,
        "volume": "8,210,000",
        "market_cap": "78,800 Tỷ",
        "pe": "6.8",
        "eps": "3,990 VNĐ",
        "roe": "23.8%",
        "high_52w": 28.5,
        "low_52w": 20.0,
        "foreign_buy": "1,450,000",
        "foreign_sell": "280,000",
        "ai_signal": "MUA",
        "ai_score": 86,
        "ai_summary": "Hiệu quả sinh lời ROE cao hàng đầu khối ngân hàng cổ phần tư nhân. Tăng trưởng tín dụng bán lẻ nông nghiệp bền vững.",
        "resistance": 28.50,
        "support": 26.00,
        "rsi": 60.3,
        "macd": "+0.38 (Bullish)"
    },
    {
        "symbol": "VRE",
        "name": "Công ty Cổ phần Vincom Retail",
        "sector": "Thép & BĐS",
        "price": 22.40,
        "change": -0.20,
        "change_percent": -0.88,
        "volume": "4,150,000",
        "market_cap": "51,000 Tỷ",
        "pe": "11.2",
        "eps": "2,000 VNĐ",
        "roe": "14.1%",
        "high_52w": 28.0,
        "low_52w": 20.5,
        "foreign_buy": "720,000",
        "foreign_sell": "1,100,000",
        "ai_signal": "NẮM GIỮ",
        "ai_score": 69,
        "ai_summary": "Tỷ lệ lấp đầy mặt bằng TTTM trên 90%. Giá tích lũy quanh vùng đáy dài hạn tạo biên an toàn cao cho đầu tư trung hạn.",
        "resistance": 24.50,
        "support": 21.50,
        "rsi": 45.2,
        "macd": "-0.08 (Neutral)"
    },
    {
        "symbol": "SAB",
        "name": "Tổng Công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn (Sabeco)",
        "sector": "Bán Lẻ & Hàng Tiêu Dùng",
        "price": 54.20,
        "change": -0.50,
        "change_percent": -0.91,
        "volume": "1,100,000",
        "market_cap": "69,500 Tỷ",
        "pe": "17.4",
        "eps": "3,110 VNĐ",
        "roe": "19.5%",
        "high_52w": 65.0,
        "low_52w": 52.0,
        "foreign_buy": "230,000",
        "foreign_sell": "450,000",
        "ai_signal": "NẮM GIỮ",
        "ai_score": 67,
        "ai_summary": "Doanh số chịu ảnh hưởng ngắn hạn từ kiểm soát nồng độ cồn nhưng biên lợi nhuận cải thiện nhờ tối ưu chi phí nguyên liệu.",
        "resistance": 57.50,
        "support": 53.00,
        "rsi": 43.8,
        "macd": "-0.25 (Neutral)"
    }
]

INITIAL_NEWS_DATA = [
    {
        "title": "FPT bùng nổ đơn hàng chuyển đổi số toàn cầu, lợi nhuận trước thuế tăng 24.5% so với cùng kỳ",
        "summary": "Dòng tiền từ khối ngoại tiếp tục bứt phá tại FPT sau khi công ty công bố các thỏa thuận hợp tác bán dẫn và trí tuệ nhân tạo (AI) trị giá trên 100 triệu USD với đối tác Mỹ và Nhật Bản.",
        "category": "💻 Công Nghệ & Bán Lẻ",
        "symbol": "FPT",
        "source": "VN30 Alpha Research",
        "sentiment": "TÍCH CỰC",
        "sentiment_score": 96,
        "tags": "Chuyển đổi số, Bán dẫn, Khối ngoại gom"
    },
    {
        "title": "HPG: Lò cao số 2 Dung Quất chuẩn bị bốc lửa, sản lượng thép cuộn cán nóng (HRC) dự kiến tăng gấp đôi",
        "summary": "Với chi phí sản xuất được tiết giảm tới 8% nhờ chuyển đổi năng lượng xanh, biên lợi nhuận gộp của Tập đoàn Hòa Phát được AI dự báo sẽ bùng nổ trong quý tới khi nhu cầu hạ tầng phục hồi.",
        "category": "🏭 Bất Động Sản & Thép",
        "symbol": "HPG",
        "source": "Bloomberg Vietnam",
        "sentiment": "MUA MẠNH",
        "sentiment_score": 92,
        "tags": "Dung Quất 2, HRC, Đầu tư công"
    },
    {
        "title": "VCB duy trì vị thế 'Anh cả' ngân hàng với CASA dẫn đầu, trích lập dự phòng giảm mạnh giúp LNTT vượt đỉnh",
        "summary": "Tỷ lệ nợ xấu duy trì dưới 0.8% - mức thấp nhất toàn bộ hệ thống tài chính Việt Nam. Lực mua chủ động từ các Quỹ ETF chi phối bảng điện phiên chiều nay.",
        "category": "🏦 Ngân Hàng & Tài Chính",
        "symbol": "VCB",
        "source": "FireAnt Financial AI",
        "sentiment": "TÍCH CỰC",
        "sentiment_score": 88,
        "tags": "CASA, Top Ngân hàng, ETF gom"
    },
    {
        "title": "SSI ghi nhận thanh khoản phái sinh và dư nợ cho vay margin vượt 20,000 tỷ đồng trước làn sóng KRX",
        "summary": "Hoạt động tự doanh và cho vay ký quỹ của SSI tiếp tục mang về doanh thu thặng dư lớn khi thị trường chứng khoán trong nước liên tục duy trì giá trị khớp lệnh trên 1 tỷ USD/phiên.",
        "category": "🏦 Ngân Hàng & Tài Chính",
        "symbol": "SSI",
        "source": "VnEconomy & AI Alpha",
        "sentiment": "MUA MẠNH",
        "sentiment_score": 94,
        "tags": "KRX, Margin record, Thanh khoản"
    },
    {
        "title": "MWG: Chuỗi Bách Hóa Xanh giữ vững chuỗi 6 tháng liên tiếp có lãi thuần, đóng góp 38% tổng doanh thu",
        "summary": "Tối ưu hóa hành trình logistics và giảm hao hụt hàng tươi sống đã giúp Bách Hóa Xanh lột xác hoàn toàn. Mô hình AI Alpha phát hiện dấu hiệu tích lũy nền giá tại vùng cản 65.",
        "category": "💻 Công Nghệ & Bán Lẻ",
        "symbol": "MWG",
        "source": "Cafef & Alpha Engine",
        "sentiment": "TÍCH CỰC",
        "sentiment_score": 85,
        "tags": "Bách Hóa Xanh, Bán lẻ, Turnaround"
    },
    {
        "title": "TCB (Techcombank) công bố lộ trình thanh toán cổ tức bằng tiền mặt tỷ lệ 15% sau hơn thập kỷ tích lũy vốn",
        "summary": "Chính sách chia thưởng cổ tức bằng tiền mặt kết hợp vị thế tiền gửi CASA khôi phục mạnh vùng 40% làm bùng nổ lượng mua ròng từ các nhà đầu tư cá nhân VIP.",
        "category": "🏦 Ngân Hàng & Tài Chính",
        "symbol": "TCB",
        "source": "VN30 Alpha Research",
        "sentiment": "TÍCH CỰC",
        "sentiment_score": 89,
        "tags": "Cổ tức tiền mặt, CASA 40%, Ngân hàng"
    },
    {
        "title": "VIC (Vingroup) đẩy mạnh cam kết trung hòa carbon và bàn giao lô xe điện VinFast xuất khẩu tiếp theo",
        "summary": "Diễn biến kỹ thuật giao dịch xung quanh EMA50 đang tạo tín hiệu rút rủi ro ngắn hạn, nhà đầu tư chờ đợi số liệu giao xe chính thức và sự mở rộng hệ thống trạm sạc toàn quốc.",
        "category": "🏭 Bất Động Sản & Thép",
        "symbol": "VIC",
        "source": "Reuters Vietnam",
        "sentiment": "TRUNG TÍNH",
        "sentiment_score": 72,
        "tags": "Xe điện, Xuất khẩu Mỹ, Trạm sạc"
    }
]

def generate_synthetic_candles(base_price: float, total_days: int = 90, timeframe: str = "1D") -> List[Dict[str, Any]]:
    """Generates realistic chronological OHLCV candlestick data."""
    data = []
    dates = []
    curr = datetime.now()

    if timeframe == "1D":
        while len(dates) < total_days:
            curr -= timedelta(days=1)
            if curr.weekday() not in (5, 6):  # Skip Sat, Sun
                dates.append(curr.strftime("%Y-%m-%d"))
        dates.reverse()
    elif timeframe == "1W":
        while len(dates) < total_days:
            curr -= timedelta(weeks=1)
            dates.append(curr.strftime("%Y-%m-%d"))
        dates.reverse()
    elif timeframe == "1H":
        for i in range(total_days, 0, -1):
            t = curr - timedelta(hours=i)
            dates.append(t.strftime("%Y-%m-%d %H:00"))
    else:  # 15M
        for i in range(total_days, 0, -1):
            t = curr - timedelta(minutes=i * 15)
            dates.append(t.strftime("%Y-%m-%d %H:%M"))

    current_close = round(base_price * 0.85, 2)
    np.random.seed(int(base_price * 100) % 2**32)

    for i, date_str in enumerate(dates):
        volatility = base_price * 0.025
        change = (np.random.rand() - 0.46) * volatility
        open_p = current_close
        close_p = round(open_p + change, 2)
        if i == len(dates) - 1:
            close_p = round(base_price, 2)

        high_p = round(max(open_p, close_p) + np.random.rand() * (volatility * 0.4), 2)
        low_p = round(min(open_p, close_p) - np.random.rand() * (volatility * 0.4), 2)
        if low_p <= 0.1:
            low_p = 0.5

        volume = float(np.random.randint(2500000, 12000000))
        data.append({
            "time": date_str,
            "open": open_p,
            "high": high_p,
            "low": low_p,
            "close": close_p,
            "volume": volume,
            "timeframe": timeframe
        })
        current_close = close_p

    return data

def seed_database_if_empty(db: Session) -> None:
    """Checks and populates default data if database tables are empty."""
    try:
        # 1. Seed Demo User
        demo_user = db.query(User).filter(User.email == "investor@vn30alpha.ai").first()
        if not demo_user:
            demo_user = User(
                email="investor@vn30alpha.ai",
                full_name="Nhà Đầu Tư Alpha VIP",
                hashed_password=get_password_hash("password123"),
                plan="Premium AI Alpha VIP",
                avatar="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=VN30_Investor",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            logger.info("Seeded demo VIP user.")

        # 2. Seed Stocks
        stock_count = db.query(Stock).count()
        if stock_count == 0:
            for s_data in VN30_INITIAL_DATA:
                db_stock = Stock(**s_data)
                db.add(db_stock)
            db.commit()
            logger.info(f"Seeded {len(VN30_INITIAL_DATA)} VN30 stocks.")

            # 3. Seed OHLCV Candles for each stock (1D, 1H, 15M, 1W)
            for s_data in VN30_INITIAL_DATA:
                symbol = s_data["symbol"]
                base_price = s_data["price"]

                for tf, num_bars in [("1D", 90), ("1H", 60), ("15M", 80), ("1W", 52)]:
                    candles = generate_synthetic_candles(base_price, num_bars, tf)
                    for c in candles:
                        history_row = StockHistory(
                            symbol=symbol,
                            time=c["time"],
                            open=c["open"],
                            high=c["high"],
                            low=c["low"],
                            close=c["close"],
                            volume=c["volume"],
                            timeframe=tf
                        )
                        db.add(history_row)
            db.commit()
            logger.info("Seeded historical OHLCV candlestick data.")

        # 4. Seed News
        news_count = db.query(NewsArticle).count()
        if news_count == 0:
            for n_data in INITIAL_NEWS_DATA:
                db_news = NewsArticle(**n_data)
                db.add(db_news)
            db.commit()
            logger.info(f"Seeded {len(INITIAL_NEWS_DATA)} financial news articles.")

        # 5. Seed Default Portfolio for Demo User
        if demo_user:
            portfolio_count = db.query(PortfolioItem).filter(PortfolioItem.user_id == demo_user.id).count()
            if portfolio_count == 0:
                default_portfolio_symbols = ["FPT", "HPG", "VCB", "SSI"]
                for sym in default_portfolio_symbols:
                    stock_item = db.query(Stock).filter(Stock.symbol == sym).first()
                    p_price = stock_item.price if stock_item else 100.0
                    db_item = PortfolioItem(
                        user_id=demo_user.id,
                        symbol=sym,
                        quantity=1000.0,
                        purchase_price=round(p_price * 0.95, 2),
                        target_price=round(p_price * 1.12, 2),
                        stop_loss=round(p_price * 0.90, 2),
                        notes="Vị thế chiến lược rổ VN30 theo tín hiệu AI Alpha"
                    )
                    db.add(db_item)
                db.commit()
                logger.info("Seeded demo user portfolio.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
