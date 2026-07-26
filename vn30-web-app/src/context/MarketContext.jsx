import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_VN30_STOCKS } from '../data/mockVn30';

const MarketContext = createContext();

export function MarketProvider({ children }) {
  const [stocks, setStocks] = useState(() => {
    return INITIAL_VN30_STOCKS.map(stock => ({
      ...stock,
      flash: null // 'up' | 'down' | null
    }));
  });

  const [isLiveSimulation, setIsLiveSimulation] = useState(true);

  // Quản lý danh mục theo dõi cá nhân trong localStorage
  const [portfolioSymbols, setPortfolioSymbols] = useState(() => {
    const saved = localStorage.getItem('vn30_portfolio');
    return saved ? JSON.parse(saved) : ['FPT', 'HPG', 'VCB', 'SSI'];
  });

  // Quản lý tài khoản người dùng trực tuyến (Auth Simulation)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vn30_user');
    return saved !== null ? JSON.parse(saved) : {
      name: 'Nhà Đầu Tư Alpha VIP',
      email: 'investor@vn30alpha.ai',
      plan: 'Premium AI Alpha',
      avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=VN30_Investor'
    };
  });

  const login = useCallback((email) => {
    const newUser = {
      name: email.split('@')[0].toUpperCase(),
      email: email,
      plan: 'Premium AI Alpha',
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(email)}`
    };
    setUser(newUser);
    localStorage.setItem('vn30_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vn30_user');
    setUser(null);
  }, []);

  useEffect(() => {
    localStorage.setItem('vn30_portfolio', JSON.stringify(portfolioSymbols));
  }, [portfolioSymbols]);

  const togglePortfolio = useCallback((symbol) => {
    setPortfolioSymbols(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  }, []);

  const getStockBySymbol = useCallback((symbol) => {
    if (!symbol) return stocks[0];
    const found = stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    return found || stocks[0];
  }, [stocks]);

  // Bộ mô phỏng nháy giá thời gian thực (Real-time Stock Exchange Tick Engine)
  useEffect(() => {
    if (!isLiveSimulation) return;

    const interval = setInterval(() => {
      setStocks(currentStocks => {
        // Chọn ngẫu nhiên 2-3 mã để biến động giá
        const indexesToChange = new Set();
        const numChanges = Math.floor(Math.random() * 3) + 1;
        while (indexesToChange.size < numChanges && indexesToChange.size < currentStocks.length) {
          indexesToChange.add(Math.floor(Math.random() * currentStocks.length));
        }

        return currentStocks.map((stock, idx) => {
          if (!indexesToChange.has(idx)) {
            // Reset flash nếu đã qua
            return stock.flash ? { ...stock, flash: null } : stock;
          }

          // Dao động bước giá tài chính Việt Nam (0.05, 0.1, hoặc 0.15 nghìn VNĐ)
          const step = [0.05, 0.1, 0.15][Math.floor(Math.random() * 3)];
          const isUp = Math.random() >= 0.45; 
          const priceDelta = isUp ? step : -step;
          
          let newPrice = Number((stock.price + priceDelta).toFixed(2));
          if (newPrice <= 0.1) newPrice = 0.5;

          const newChange = Number((stock.change + priceDelta).toFixed(2));
          const basePrice = Number((stock.price - stock.change).toFixed(2));
          const newChangePercent = basePrice > 0 ? Number(((newChange / basePrice) * 100).toFixed(2)) : 0;

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            flash: isUp ? 'up' : 'down'
          };
        });
      });
    }, 3200); // Mỗi 3.2 giây cập nhật giá bảng điện

    return () => clearInterval(interval);
  }, [isLiveSimulation]);

  // Tự động xóa trạng thái flash chớp sáng sau 1.2 giây để tạo hiệu ứng đẹp
  useEffect(() => {
    const hasFlash = stocks.some(s => s.flash !== null);
    if (!hasFlash) return;

    const timer = setTimeout(() => {
      setStocks(current => current.map(s => s.flash ? { ...s, flash: null } : s));
    }, 1200);

    return () => clearTimeout(timer);
  }, [stocks]);

  // Tính toán tổng quan thị trường (VN30 Index aggregate stats)
  const marketStats = useMemo(() => {
    let upCount = 0;
    let downCount = 0;
    let refCount = 0;
    let indexChange = 0;

    stocks.forEach(s => {
      if (s.change > 0) upCount++;
      else if (s.change < 0) downCount++;
      else refCount++;

      indexChange += (s.change * 0.4); // Trọng lượng ước tính VN30
    });

    const baseIndex = 1272.05;
    const currentIndex = Number((baseIndex + indexChange).toFixed(2));
    const percentIndex = Number(((indexChange / baseIndex) * 100).toFixed(2));

    return {
      vn30Index: currentIndex,
      indexChange: Number(indexChange.toFixed(2)),
      percentIndex,
      upCount,
      downCount,
      refCount,
      totalVolume: '248.5M',
      totalValue: '8,450.2B'
    };
  }, [stocks]);

  return (
    <MarketContext.Provider value={{
      stocks,
      marketStats,
      portfolioSymbols,
      togglePortfolio,
      getStockBySymbol,
      isLiveSimulation,
      setIsLiveSimulation,
      user,
      login,
      logout
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}
