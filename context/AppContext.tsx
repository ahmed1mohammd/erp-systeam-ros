
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Customer, Product, Sale, Transaction, Installment, Partner, UserRole, ProfitDistributionRecord, DashboardStats } from '../types';
import api from '../services/api';
import { customersApi } from '../services/customers.api';
import { productsApi } from '../services/products.api';
import { salesApi } from '../services/sales.api';
import { safesApi } from '../services/safes.api';
import { partnersApi } from '../services/partners.api';
import { installmentsApi } from '../services/installments.api';
import { reportsApi } from '../services/reports.api';

interface Theme {
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  installments: Installment[];
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>;
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  distributionHistory: ProfitDistributionRecord[];
  setDistributionHistory: React.Dispatch<React.SetStateAction<ProfitDistributionRecord[]>>;
  dashboardStats: DashboardStats | null;
  safeBalance: number;
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  selectedInvoice: any | null;
  setSelectedInvoice: (invoice: any | null) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  triggerPrint: (type: 'INVOICE' | 'REPORT', payload: any) => void;
}

const defaultTheme: Theme = {
  primary: '#16423C',
  secondary: '#6A9C89',
  bg: '#E9EFEC',
  accent: '#C4DAD2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [distributionHistory, setDistributionHistory] = useState<ProfitDistributionRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [safeBalance, setSafeBalance] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('rostech_theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const refreshData = async () => {
    if (!localStorage.getItem('rostech_token')) return;
    setIsLoading(true);
    try {
      const [custRes, prodRes, salesRes, safeRes, partRes, instRes, distRes, dashRes] = await Promise.all([
        customersApi.getAll(),
        productsApi.getAll(),
        salesApi.getAll(),
        safesApi.getSafe(),
        partnersApi.getAll(),
        installmentsApi.getAll(),
        partnersApi.getHistory(),
        reportsApi.getDashboard()
      ]);

      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
      setSales(salesRes.data || []);
      setSafeBalance(safeRes.data?.balance || 0);
      setTransactions(safeRes.data?.transactions || []);
      setPartners(partRes.data || []);
      setInstallments(instRes.data || []);
      setDistributionHistory(distRes.data || []);
      setDashboardStats(dashRes.data || null);
    } catch (error) {
      console.error("Backend Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('rostech_token');
    const savedUser = localStorage.getItem('rostech_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-secondary', theme.secondary);
    root.style.setProperty('--brand-bg', theme.bg);
    root.style.setProperty('--brand-accent', theme.accent);
    localStorage.setItem('rostech_theme', JSON.stringify(theme));
  }, [theme]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('rostech_token', data.token);
      localStorage.setItem('rostech_user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rostech_token');
    localStorage.removeItem('rostech_user');
  };

  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const triggerPrint = (type: 'INVOICE' | 'REPORT', payload: any) => {
    if (type === 'INVOICE') {
      setSelectedInvoice(payload);
      setTimeout(() => window.print(), 500);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, login, logout, 
      customers, setCustomers, 
      products, setProducts, 
      sales, setSales,
      transactions, setTransactions,
      installments, setInstallments,
      partners, setPartners,
      distributionHistory, setDistributionHistory,
      dashboardStats,
      safeBalance,
      theme, updateTheme,
      selectedInvoice, setSelectedInvoice,
      isLoading,
      refreshData,
      triggerPrint
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
