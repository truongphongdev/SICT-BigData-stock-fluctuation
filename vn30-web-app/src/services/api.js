/**
 * API Service Client for VN30 Alpha Backend
 * Connects to FastAPI backend (http://localhost:8000/api/v1) with seamless fallback to mock data.
 */
import { INITIAL_VN30_STOCKS, generateCandleData } from '../data/mockVn30';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper to get auth header
function getAuthHeaders() {
  const token = localStorage.getItem('vn30_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Generic fetch wrapper with timeout and fallback
async function fetchWithFallback(endpoint, options = {}, fallbackData = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    // Return fallback gracefully without breaking the UI
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw err;
  }
}

export const authAPI = {
  async register(name, email, password) {
    return fetchWithFallback('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email, password) {
    return fetchWithFallback('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async demoLogin() {
    return fetchWithFallback('/auth/demo-login', {
      method: 'POST'
    }, {
      access_token: 'mock_vip_demo_token',
      token_type: 'bearer',
      user: {
        name: 'Nhà Đầu Tư Alpha VIP',
        email: 'investor@vn30alpha.ai',
        plan: 'Premium AI Alpha VIP',
        avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=VN30_Investor'
      }
    });
  },

  async getMe() {
    return fetchWithFallback('/auth/me', { method: 'GET' }, null);
  }
};

export const stocksAPI = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/stocks/?${query}` : '/stocks/';
    return fetchWithFallback(endpoint, { method: 'GET' }, INITIAL_VN30_STOCKS);
  },

  async getBySymbol(symbol) {
    const fallback = INITIAL_VN30_STOCKS.find(s => s.symbol.toUpperCase() === (symbol || '').toUpperCase()) || INITIAL_VN30_STOCKS[0];
    return fetchWithFallback(`/stocks/${symbol}`, { method: 'GET' }, fallback);
  },

  async getHistory(symbol, timeframe = '1D') {
    const baseStock = INITIAL_VN30_STOCKS.find(s => s.symbol.toUpperCase() === (symbol || '').toUpperCase()) || INITIAL_VN30_STOCKS[0];
    let numBars = 90;
    if (timeframe === '15M') numBars = 140;
    if (timeframe === '1H') numBars = 110;
    if (timeframe === '1W') numBars = 60;
    const fallback = generateCandleData(baseStock.price, numBars);

    return fetchWithFallback(`/stocks/${symbol}/history?timeframe=${timeframe}`, { method: 'GET' }, fallback);
  },

  async getIndicators(symbol) {
    const baseStock = INITIAL_VN30_STOCKS.find(s => s.symbol.toUpperCase() === (symbol || '').toUpperCase()) || INITIAL_VN30_STOCKS[0];
    const fallback = {
      symbol: baseStock.symbol,
      price: baseStock.price,
      rsi: baseStock.rsi || 62.4,
      rsi_status: (baseStock.rsi || 62.4) > 70 ? 'Quá mua' : ((baseStock.rsi || 62.4) < 30 ? 'Quá bán' : 'Trung tính (Neutral)'),
      macd_val: 0.85,
      macd_signal: 0.35,
      macd_hist: 0.50,
      macd_desc: baseStock.macd || '+0.85 (Bullish)',
      ema_20: round(baseStock.price * 0.98, 2),
      ema_50: round(baseStock.price * 0.95, 2),
      bb_upper: round(baseStock.price * 1.05, 2),
      bb_middle: baseStock.price,
      bb_lower: round(baseStock.price * 0.95, 2),
      support: baseStock.support || round(baseStock.price * 0.95, 2),
      resistance: baseStock.resistance || round(baseStock.price * 1.05, 2)
    };
    return fetchWithFallback(`/stocks/${symbol}/indicators`, { method: 'GET' }, fallback);
  }
};

export const marketAPI = {
  async getOverview() {
    const fallback = {
      vn30Index: 1274.85,
      indexChange: 2.80,
      percentIndex: 0.22,
      upCount: 18,
      downCount: 8,
      refCount: 4,
      totalVolume: '248.5M',
      totalValue: '8,450.2B',
      isUp: true
    };
    return fetchWithFallback('/market/overview', { method: 'GET' }, fallback);
  }
};

export const predictAPI = {
  async getPrediction(symbol) {
    const baseStock = INITIAL_VN30_STOCKS.find(s => s.symbol.toUpperCase() === (symbol || '').toUpperCase()) || INITIAL_VN30_STOCKS[0];
    const isUp = (baseStock.change || 0) >= 0;
    const delta = isUp ? round(baseStock.price * 0.018, 2) : -round(baseStock.price * 0.012, 2);
    const targetPrice = round(baseStock.price + delta, 2);

    const fallback = {
      symbol: baseStock.symbol,
      prediction_date: new Date().toISOString(),
      signal: baseStock.aiSignal || 'MUA MẠNH',
      signal_color: baseStock.aiSignalColor || 'text-market-up',
      ai_score: baseStock.aiScore || 92,
      current_price: baseStock.price,
      target_price: targetPrice,
      forecast_delta: delta,
      forecast_percent: round((delta / baseStock.price) * 100, 2),
      ai_summary: baseStock.aiSummary,
      predicted_prices: [baseStock.price, targetPrice, round(targetPrice * 1.01, 2), round(targetPrice * 1.02, 2), round(targetPrice * 1.03, 2)],
      model_version: 'v3.4-XGBoost Alpha'
    };
    return fetchWithFallback(`/predict/${symbol}`, { method: 'GET' }, fallback);
  },

  async getDeepAnalysis(symbol) {
    const baseStock = INITIAL_VN30_STOCKS.find(s => s.symbol.toUpperCase() === (symbol || '').toUpperCase()) || INITIAL_VN30_STOCKS[0];
    const isUp = (baseStock.change || 0) >= 0;
    const targetPrice = isUp ? round(baseStock.price * 1.025, 2) : round(baseStock.price * 0.985, 2);

    const fallback = {
      symbol: baseStock.symbol,
      name: baseStock.name,
      sector: baseStock.sector,
      current_price: baseStock.price,
      ai_signal: baseStock.aiSignal || 'MUA',
      ai_score: baseStock.aiScore || 88,
      target_price: targetPrice,
      stop_loss: round(baseStock.price * 0.93, 2),
      expected_return: isUp ? '+2.50%' : '-1.50%',
      risk_level: 'Thấp',
      ai_summary: baseStock.aiSummary,
      technical_summary: {
        'RSI (14)': baseStock.rsi || 61.5,
        'MACD': baseStock.macd || '+0.85 (Bullish)',
        'Xu hướng MA': 'Vượt trên EMA20 và EMA50 (Tích cực)',
        'Kháng cự': baseStock.resistance,
        'Hỗ trợ': baseStock.support
      },
      fundamental_summary: {
        'P/E': baseStock.pe,
        'EPS': baseStock.eps,
        'Vốn hóa': baseStock.marketCap
      },
      sentiment_summary: {
        'Dòng tiền khối ngoại': 'Mua ròng mạnh',
        'Tâm lý truyền thông': '94% Tích cực'
      },
      price_scenarios: {
        'Lạc quan (Bull)': round(baseStock.price * 1.08, 2),
        'Cơ sở (Base)': targetPrice,
        'Thận trọng (Bear)': round(baseStock.price * 0.94, 2)
      },
      key_drivers: [
        'Dòng tiền tổ chức gia tăng mạnh mẽ theo sóng KRX.',
        'Kết quả kinh doanh phục hồi vượt kế hoạch năm.',
        'Mẫu hình nến bứt phá cản kỹ thuật thành công.'
      ]
    };
    return fetchWithFallback(`/predict/deep-analysis/${symbol}`, { method: 'POST' }, fallback);
  }
};

export const portfolioAPI = {
  async getOverview() {
    return fetchWithFallback('/portfolio/', { method: 'GET' }, null);
  },

  async toggle(symbol) {
    return fetchWithFallback(`/portfolio/toggle/${symbol}`, { method: 'POST' });
  }
};

export const newsAPI = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/news/?${query}` : '/news/';
    return fetchWithFallback(endpoint, { method: 'GET' }, null);
  },

  async getSentimentOverview() {
    return fetchWithFallback('/news/sentiment-overview', { method: 'GET' }, null);
  }
};

function round(val, dec = 2) {
  return Number(Number(val).toFixed(dec));
}
