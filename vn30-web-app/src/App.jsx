import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MarketProvider, useMarket } from './context/MarketContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { user } = useMarket();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user } = useMarket();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<StockDetail />} />
        <Route path="stock/:symbol" element={<StockDetail />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="news" element={<News />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <MarketProvider>
      <Router>
        <AppRoutes />
      </Router>
    </MarketProvider>
  );
}

export default App;
