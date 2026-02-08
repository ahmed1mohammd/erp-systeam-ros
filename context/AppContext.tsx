
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Customer, Product, Sale, Transaction, Installment, Partner, UserRole, ProfitDistributionRecord } from '../types';
import { customersApi } from '../services/customers.api';
import { productsApi } from '../services/products.api';
import { salesApi } from '../services/sales.api';
import { safesApi } from '../services/safes.api';
import { partnersApi } from '../services/partners.api';
import { installmentsApi } from '../services/installments.api';

interface Theme {
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
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

// --- بيانات المحاكاة (Mock Data) ---
const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'أحمد محمد علي', phone: '01012345678', address: 'القاهرة، مدينة نصر', totalBalance: 5000, joinDate: '2024-01-15' },
  { id: '2', name: 'سارة محمود حسن', phone: '01298765432', address: 'الجيزة، الهرم', totalBalance: 0, joinDate: '2024-02-10' },
  { id: '3', name: 'شركة السلام للتوريدات', phone: '01155667788', address: 'القليوبية، بنها', totalBalance: 12500, joinDate: '2024-03-01' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'هاتف ذكي S24', costPrice: 25000, sellPrice: 32000, stock: 15 },
  { id: 'p2', name: 'شاشة LED 55 بوصة', costPrice: 12000, sellPrice: 15500, stock: 8 },
  { id: 'p3', name: 'لابتوب Core i7', costPrice: 35000, sellPrice: 42000, stock: 4 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INCOME', category: 'مبيعات', amount: 32000, date: '2024-05-20', description: 'بيع هاتف S24 كاش' },
  { id: 't2', type: 'EXPENSE', category: 'إيجار', amount: 5000, date: '2024-05-18', description: 'إيجار المحل شهر مايو' },
  { id: 't3', type: 'INCOME', category: 'تحصيل أقساط', amount: 1500, date: '2024-05-21', description: 'تحصيل قسط أحمد محمد' },
];

const MOCK_PARTNERS: Partner[] = [
  { id: 'p1', name: 'م/ محمد علي', sharePercentage: 20, paidAmount: 0 },
  { id: 'p2', name: 'أ/ خالد حسن', sharePercentage: 20, paidAmount: 0 },
  { id: 'p3', name: 'م/ ياسر محمود', sharePercentage: 20, paidAmount: 0 },
  { id: 'p4', name: 'أ/ إبراهيم سعيد', sharePercentage: 20, paidAmount: 0 },
  { id: 'p5', name: 'أ/ مصطفى طه', sharePercentage: 20, paidAmount: 0 },
];

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
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('rostech_theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const refreshData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // محاولة الاتصال بالـ API الحقيقي
      const [custRes, prodRes, salesRes, safeRes, partRes, instRes, distRes] = await Promise.all([
        customersApi.getAll(),
        productsApi.getAll(),
        salesApi.getAll(),
        safesApi.getTransactions(),
        partnersApi.getAll(),
        installmentsApi.getAll(),
        partnersApi.getHistory()
      ]);

      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setSales(salesRes.data);
      setTransactions(safeRes.data);
      setPartners(partRes.data);
      setInstallments(instRes.data);
      setDistributionHistory(distRes.data);
    } catch (error) {
      // في حالة وجود Network Error، نستخدم البيانات الوهمية تلقائياً
      console.warn("Backend connection failed (Network Error). Using fallback Mock Data.");
      
      // تعبئة البيانات فقط إذا كانت فارغة
      if (customers.length === 0) setCustomers(MOCK_CUSTOMERS);
      if (products.length === 0) setProducts(MOCK_PRODUCTS);
      if (transactions.length === 0) setTransactions(MOCK_TRANSACTIONS);
      if (partners.length === 0) setPartners(MOCK_PARTNERS);
    } finally {
      setIsLoading(false);
    }
  };

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

  const login = (email: string, role: UserRole) => {
    setUser({ id: 'u1', name: email.split('@')[0], email, role });
    localStorage.setItem('rostech_token', 'mock_token_123');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rostech_token');
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
