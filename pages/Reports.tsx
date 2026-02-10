
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { reportsApi } from '../services/reports.api';
import { 
  FileBarChart, 
  Calendar, 
  ArrowLeftRight, 
  CreditCard, 
  ShoppingBag, 
  PieChart, 
  ChevronRight, 
  Eye, 
  Mail, 
  Send, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Reports: React.FC = () => {
  const { sales, transactions, installments, distributionHistory, products, customers, setSelectedInvoice } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'SALES' | 'INSTALLMENTS' | 'SAFE' | 'PROFITS'>('SALES');

  // Email state
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const safeStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
       const display = val.name || val.title || val.description || val._id || val.id;
       if (typeof display === 'string' || typeof display === 'number') return String(display);
       return 'بيانات مركبة';
    }
    return '';
  };

  const filteredData = useMemo(() => {
    const filterFn = (item: any) => {
      const d = new Date(item.date || item.dueDate);
      return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
    };

    const extractId = (field: any) => {
      if (field === null || field === undefined) return null;
      if (typeof field === 'string') return field;
      if (typeof field === 'object') return field._id || field.id || null;
      return null;
    };

    return {
      sales: (sales || []).filter(filterFn).map(s => {
        const cid = extractId(s.customerId);
        const pid = extractId(s.productId);
        return {
          ...s,
          productName: products.find(p => (p.id === pid || p._id === pid))?.name || (s.productId?.name) || 'منتج غير معروف',
          customerName: customers.find(c => (c.id === cid || c._id === cid))?.name || (s.customerId?.name) || 'عميل غير معروف',
          amount: s.totalAmount
        };
      }),
      transactions: (transactions || []).filter(filterFn),
      installments: (installments || []).filter(filterFn).map(i => {
         const iSaleId = extractId(i.saleId);
         const sale = sales.find(s => (s.id === iSaleId || s._id === iSaleId));
         const cid = extractId(sale?.customerId);
         return { 
           ...i, 
           customerName: customers.find(c => (c.id === cid || c._id === cid))?.name || 'عميل مجهول' 
         };
      }),
      profits: (distributionHistory || []).filter(filterFn),
    };
  }, [selectedMonth, selectedYear, sales, transactions, installments, distributionHistory, products, customers]);

  const reportConfig = useMemo(() => {
    switch (activeTab) {
      case 'SALES':
        return {
          type: 'المبيعات',
          data: filteredData.sales,
          summary: [
            { label: 'إجمالي المبيعات', value: filteredData.sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0) },
            { label: 'عدد الفواتير', value: filteredData.sales.length },
            { label: 'المحصل مقدماً', value: filteredData.sales.reduce((acc, s) => acc + (Number(s.downPayment) || 0), 0), color: 'text-green-600' }
          ]
        };
      case 'INSTALLMENTS':
        const paid = filteredData.installments.filter(i => i.status === 'PAID');
        const pending = filteredData.installments.filter(i => i.status !== 'PAID');
        return {
          type: 'الأقساط',
          data: filteredData.installments,
          summary: [
            { label: 'محصل حقيقي', value: paid.reduce((acc, i) => acc + (Number(i.amount) || 0), 0), color: 'text-green-600' },
            { label: 'متبقي معلق', value: pending.reduce((acc, i) => acc + (Number(i.amount) || 0), 0), color: 'text-amber-600' },
            { label: 'عدد الحصص', value: filteredData.installments.length }
          ]
        };
      case 'SAFE':
        const income = filteredData.transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const expense = filteredData.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        return {
          type: 'الخزنة',
          data: filteredData.transactions,
          summary: [
            { label: 'داخل (إيداع)', value: income, color: 'text-green-600' },
            { label: 'خارج (مصروف)', value: expense, color: 'text-red-600' },
            { label: 'الرصيد الصافي', value: income - expense }
          ]
        };
      case 'PROFITS':
        return {
          type: 'توزيع الربح',
          data: filteredData.profits,
          summary: [
            { label: 'إجمالي الموزع', value: filteredData.profits.reduce((acc, p) => acc + (Number(p.amount) || 0), 0), color: 'text-blue-600' },
            { label: 'عدد الحصص', value: filteredData.profits.length }
          ]
        };
    }
  }, [activeTab, filteredData]);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', msg: 'يرجى إدخال بريد إلكتروني صحيح' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      await reportsApi.sendEmail(email, selectedMonth, selectedYear);
      setStatus({ type: 'success', msg: 'تم إرسال التقرير بنجاح إلى بريدك' });
      setEmail('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'حدث خطأ أثناء الإرسال' });
    } finally {
      setIsSending(false);
      // Clear status after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* 1. Page Header and Period Selector */}
      <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-primary text-white rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                <FileBarChart size={28} />
             </div>
             <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-primary">تقارير النظام</h2>
                <p className="text-[10px] sm:text-xs text-brand-secondary font-bold uppercase tracking-wider">تحليل البيانات الشهرية - ROS TECH</p>
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-bg px-4 py-3 rounded-xl sm:rounded-2xl border border-brand-accent/30 w-full sm:w-auto justify-center">
               <Calendar size={18} className="text-brand-secondary" />
               <select 
                 className="bg-transparent font-black text-brand-primary outline-none border-none cursor-pointer text-sm"
                 value={selectedMonth}
                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
               >
                 {Array.from({length: 12}).map((_, i) => (
                   <option key={i+1} value={i+1}>شهر {i+1}</option>
                 ))}
               </select>
               <select 
                 className="bg-transparent font-black text-brand-primary outline-none border-none cursor-pointer text-sm"
                 value={selectedYear}
                 onChange={(e) => setSelectedYear(Number(e.target.value))}
               >
                 <option value={2024}>2024</option>
                 <option value={2025}>2025</option>
                 <option value={2026}>2026</option>
               </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Send Email Section (New Feature) */}
      <div className="bg-brand-primary rounded-[2rem] p-6 sm:p-10 text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-brand-accent border border-white/10 backdrop-blur-md">
              <Mail size={32} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black">إرسال التقرير عبر البريد</h3>
              <p className="text-brand-accent text-sm font-bold mt-1">سيصلك ملف PDF منسق وشامل لبيانات {selectedMonth}/{selectedYear}</p>
            </div>
          </div>

          <form onSubmit={handleSendReport} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
              <input 
                type="email" 
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white focus:text-brand-primary transition-all font-bold text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSending}
              className="w-full sm:w-auto bg-brand-secondary hover:bg-brand-accent hover:text-brand-primary text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              <span>إرسال التقرير</span>
            </button>
          </form>
        </div>

        {status && (
          <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-black">{status.msg}</span>
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide -mx-1 px-1">
        <TabButton active={activeTab === 'SALES'} onClick={() => setActiveTab('SALES')} label="المبيعات" icon={<ShoppingBag size={18}/>} />
        <TabButton active={activeTab === 'INSTALLMENTS'} onClick={() => setActiveTab('INSTALLMENTS')} label="الأقساط" icon={<CreditCard size={18}/>} />
        <TabButton active={activeTab === 'SAFE'} onClick={() => setActiveTab('SAFE')} label="الخزنة" icon={<ArrowLeftRight size={18}/>} />
        <TabButton active={activeTab === 'PROFITS'} onClick={() => setActiveTab('PROFITS')} label="الأرباح" icon={<PieChart size={18}/>} />
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
           {reportConfig.summary.map((item, idx) => (
             <div key={idx} className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl sm:rounded-[1.5rem] text-center">
                <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1">{safeStr(item.label)}</p>
                <p className={`text-lg sm:text-xl font-black ${item.color || 'text-brand-primary'}`}>
                  {typeof item.value === 'number' && item.label.includes('عدد') ? item.value : FORMAT_CURRENCY(item.value as number)}
                </p>
             </div>
           ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead className="bg-brand-bg/50 border-b border-brand-accent/30">
              <tr>
                <th className="px-5 sm:px-8 py-4 text-[10px] font-black text-brand-secondary uppercase tracking-widest">التفاصيل</th>
                <th className="px-5 sm:px-8 py-4 text-[10px] font-black text-brand-secondary uppercase tracking-widest text-center">التاريخ</th>
                <th className="px-5 sm:px-8 py-4 text-[10px] font-black text-brand-secondary uppercase tracking-widest text-left">القيمة</th>
                {activeTab === 'SALES' && <th className="px-5 sm:px-8 py-4 text-[10px] font-black text-brand-secondary uppercase tracking-widest text-left">تفاصيل</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {reportConfig.data.length > 0 ? (
                reportConfig.data.map((item: any, idx: number) => (
                  <tr key={item.id || item._id || idx} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-5 sm:px-8 py-4">
                       <p className="font-black text-brand-primary text-sm">
                        {safeStr(item.description || item.productName || item.customerName || item.partnerName)}
                       </p>
                       {item.category && <span className="text-[10px] text-brand-secondary font-bold">{safeStr(item.category)}</span>}
                    </td>
                    <td className="px-5 sm:px-8 py-4 text-center text-slate-500 font-bold text-xs">{safeStr(item.date || item.dueDate)}</td>
                    <td className="px-5 sm:px-8 py-4 text-left font-black text-brand-primary text-sm">{FORMAT_CURRENCY(item.amount || item.totalAmount)}</td>
                    {activeTab === 'SALES' && (
                      <td className="px-5 sm:px-8 py-4 text-left">
                        <button 
                          onClick={() => setSelectedInvoice(item)}
                          className="p-2 text-brand-primary bg-brand-bg rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-inner"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'SALES' ? 4 : 3} className="p-16 text-center text-brand-secondary font-bold text-sm bg-brand-bg/5">لا توجد سجلات متاحة لهذه الفترة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-2xl font-black transition-all whitespace-nowrap shrink-0 ${
      active 
      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' 
      : 'bg-white text-brand-secondary border border-brand-accent/30 hover:bg-brand-bg'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
    {active && <ChevronRight size={14} className="mr-1 opacity-50" />}
  </button>
);

export default Reports;
