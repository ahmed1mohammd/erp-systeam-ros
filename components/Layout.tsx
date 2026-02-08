
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
    const customer = customers.find(c => c.id === payload.customerId);
    const product = products.find(p => p.id === payload.productId);

    return {
      id: payload.id,
      date: payload.date,
      customerName: payload.customerName || customer?.name || 'عميل غير معروف',
      productName: payload.productName || product?.name || 'منتج غير معروف',
      totalAmount: payload.totalAmount || 0,
      paidAmount: payload.downPayment || payload.totalAmount || 0,
      paymentMethod: payload.type || 'CASH'
    };
  };

  return (
    <div className="min-h-screen flex bg-brand-bg font-['Tajawal']" dir="rtl">
      {/* Global Invoice Details Modal - Fully Responsive */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 p-2 sm:p-3 bg-brand-primary text-white rounded-xl sm:rounded-2xl hover:bg-brand-secondary transition-all shadow-xl"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="p-1 sm:p-2">
              <Invoice {...getInvoiceProps(selectedInvoice)!} />
            </div>
            <div className="p-4 sm:p-8 bg-brand-bg/50 border-t border-brand-accent/30 flex justify-center">
               <button 
                 onClick={() => setSelectedInvoice(null)}
                 className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-brand-primary text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-brand-secondary transition-all shadow-xl"
               >
                 إغلاق النافذة
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive Width */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-brand-primary text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-brand-secondary/20">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt={SYSTEM_NAME} className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-none">{SYSTEM_NAME}</h1>
                <p className="text-[10px] text-brand-secondary font-bold uppercase mt-1">Cloud Management</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-brand-secondary text-white shadow-lg shadow-brand-primary/40' 
                      : 'text-brand-accent hover:bg-brand-secondary/20 hover:text-white'}
                  `}
                >
                  <span className={isActive ? 'text-white' : 'text-brand-secondary group-hover:text-white'}>{item.icon}</span>
                  <span className="font-bold text-sm sm:text-base">{item.label}</span>
                  {isActive && <ChevronLeft size={16} className="mr-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-brand-secondary/20 bg-brand-primary/30">
            <div className="flex items-center gap-3 px-3 py-2 text-brand-accent">
              <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center text-white border border-brand-secondary/30 shrink-0">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{user.name}</p>
                <p className="text-[10px] text-brand-secondary uppercase font-bold truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 mt-2 text-brand-accent hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            >
              <LogOut size={18} className="transform rotate-180" />
              <span className="font-bold text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-brand-accent/30 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2.5 text-brand-primary bg-brand-bg rounded-xl hover:bg-brand-accent/30 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
               <h2 className="text-lg sm:text-xl font-black text-brand-primary truncate max-w-[150px] sm:max-w-none">
                {filteredNav.find(n => n.path === location.pathname)?.label || 'الرئيسية'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-brand-primary leading-none">{user.name}</span>
                <span className="text-[10px] font-bold text-brand-secondary mt-1">متصل الآن • ROS TECH</span>
             </div>
             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-primary text-white flex items-center justify-center font-black border-2 border-brand-accent/50 shadow-md text-lg uppercase shrink-0">
               {user.name.charAt(0)}
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-brand-bg/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
