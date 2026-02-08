
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Safe from './pages/Safe';
import ProfitDistribution from './pages/ProfitDistribution';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Reusable PrivateRoute component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
          <Route path="/safe" element={<PrivateRoute><Safe /></PrivateRoute>} />
          <Route path="/profit" element={<PrivateRoute><ProfitDistribution /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
