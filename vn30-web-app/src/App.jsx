import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MarketProvider } from './context/MarketContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <MarketProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock" element={<StockDetail />} />
            <Route path="stock/:symbol" element={<StockDetail />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="news" element={<News />} />
          </Route>
        </Routes>
      </Router>
    </MarketProvider>
  );
}

export default App;
