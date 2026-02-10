
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NAV_ITEMS, LOGO_URL, SYSTEM_NAME } from '../constants';
import { Menu, User as UserIcon, LogOut, ChevronLeft, X } from 'lucide-react';
import Invoice from './Invoice';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, selectedInvoice, setSelectedInvoice, customers, products } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInvoiceProps = (payload: any) => {
    if (!payload) return null;

    const extractId = (val: any) => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val._id || val.id || null;
      return null;
    };

    const custId = extractId(payload.customerId);
    const prodId = extractId(payload.productId);

    const customer = (customers || []).find(c => (c.id === custId || c._id === custId));
    const product = (products || []).find(p => (p.id === prodId || p._id === prodId));

    const getName = (field: any, fallback: string) => {
      if (!field) return fallback;
      if (typeof field === 'string') return field;
      if (typeof field === 'object') return field.name || field.title || fallback;
      return String(field);
    };

    const custName = payload.customerName || customer?.name || getName(payload.customerId, 'عميل غير معروف');
    const prodName = payload.productName || product?.name || getName(payload.productId, 'منتج غير معروف');
    
    return {
      id: String(payload.id || payload._id || 'INV-000'),
      date: String(payload.date || new Date().toLocaleDateString('ar-EG')),
      customerName: String(custName),
      productName: String(prodName),
      totalAmount: Number(payload.totalAmount || 0),
      paidAmount: Number(payload.paidAmount || payload.downPayment || 0),
      paymentMethod: String(payload.paymentMethod || payload.paymentType || payload.type || 'CASH')
    };
  };

  return (
    <div className="min-h-screen flex bg-brand-bg font-['Tajawal']" dir="rtl">
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative p-4 sm:p-8">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 bg-brand-bg hover:bg-red-50 text-brand-primary hover:text-red-600 rounded-2xl transition-all z-20"
            >
              <X size={24} />
            </button>
            <div className="print:p-0">
               {getInvoiceProps(selectedInvoice) && <Invoice {...getInvoiceProps(selectedInvoice)!} />}
               <div className="mt-8 flex justify-center gap-4 no-print">
                  <button 
                    onClick={() => window.print()} 
                    className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-95"
                  >
                    طباعة المستند
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-brand-primary text-white transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <img src={LOGO_URL} alt={SYSTEM_NAME} className="h-10 brightness-0 invert" />
            <h1 className="text-xl font-black">{SYSTEM_NAME}</h1>
          </div>
          <nav className="flex-1 space-y-1">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${location.pathname === item.path ? 'bg-white/10 text-brand-secondary' : 'hover:bg-white/5 text-brand-accent'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-300 hover:bg-red-500/10 transition-all font-bold mt-auto">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-brand-accent/30 h-20 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-brand-primary hover:bg-brand-bg rounded-xl">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-black text-brand-primary">
              {filteredNav.find(n => n.path === location.pathname)?.label || 'الرئيسية'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-start ml-4">
                <span className="text-xs font-black text-brand-primary leading-none mb-1">{user.name}</span>
                <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest">{user.role}</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-brand-bg text-brand-primary flex items-center justify-center border border-brand-accent/20">
                <UserIcon size={20} />
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
