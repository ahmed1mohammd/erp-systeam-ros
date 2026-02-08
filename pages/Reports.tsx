
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { FileBarChart, Calendar, ArrowLeftRight, CreditCard, ShoppingBag, PieChart, ChevronRight, Eye } from 'lucide-react';

const Reports: React.FC = () => {
  const { sales, transactions, installments, distributionHistory, products, customers, setSelectedInvoice } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'SALES' | 'INSTALLMENTS' | 'SAFE' | 'PROFITS'>('SALES');

  const filteredData = useMemo(() => {
    const filterFn = (item: any) => {
      const d = new Date(item.date || item.dueDate);
      return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
    };

    return {
      sales: sales.filter(filterFn).map(s => ({
        ...s,
        productName: products.find(p => p.id === s.productId)?.name || 'منتج غير معروف',
        customerName: customers.find(c => c.id === s.customerId)?.name || 'عميل غير معروف',
        amount: s.totalAmount
      })),
      transactions: transactions.filter(filterFn),
      installments: installments.filter(filterFn).map(i => {
         const sale = sales.find(s => s.id === i.saleId);
         return { ...i, customerName: customers.find(c => c.id === sale?.customerId)?.name || 'عميل مجهول' };
      }),
      profits: distributionHistory.filter(filterFn),
    };
  }, [selectedMonth, selectedYear, sales, transactions, installments, distributionHistory, products, customers]);

  const reportConfig = useMemo(() => {
    switch (activeTab) {
      case 'SALES':
        return {
          type: 'المبيعات',
          data: filteredData.sales,
          summary: [
            { label: 'إجمالي المبيعات', value: filteredData.sales.reduce((acc, s) => acc + s.totalAmount, 0) },
            { label: 'عدد الفواتير', value: filteredData.sales.length },
            { label: 'المحصل مقدماً', value: filteredData.sales.reduce((acc, s) => acc + s.downPayment, 0), color: 'text-green-600' }
          ]
        };
      case 'INSTALLMENTS':
        const paid = filteredData.installments.filter(i => i.status === 'PAID');
        const pending = filteredData.installments.filter(i => i.status !== 'PAID');
        return {
          type: 'الأقساط',
          data: filteredData.installments,
          summary: [
            { label: 'محصل حقيقي', value: paid.reduce((acc, i) => acc + i.amount, 0), color: 'text-green-600' },
            { label: 'متبقي معلق', value: pending.reduce((acc, i) => acc + i.amount, 0), color: 'text-amber-600' },
            { label: 'عدد الحصص', value: filteredData.installments.length }
          ]
        };
      case 'SAFE':
        const income = filteredData.transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const expense = filteredData.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
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
            { label: 'إجمالي الموزع', value: filteredData.profits.reduce((acc, p) => acc + p.amount, 0), color: 'text-blue-600' },
            { label: 'عدد الحصص', value: filteredData.profits.length }
          ]
        };
    }
  }, [activeTab, filteredData]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header with Month Selector */}
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
               </select>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Tabs - Scrollable on Mobile */}
      <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide -mx-1 px-1">
        <TabButton active={activeTab === 'SALES'} onClick={() => setActiveTab('SALES')} label="المبيعات" icon={<ShoppingBag size={18}/>} />
        <TabButton active={activeTab === 'INSTALLMENTS'} onClick={() => setActiveTab('INSTALLMENTS')} label="الأقساط" icon={<CreditCard size={18}/>} />
        <TabButton active={activeTab === 'SAFE'} onClick={() => setActiveTab('SAFE')} label="الخزنة" icon={<ArrowLeftRight size={18}/>} />
        <TabButton active={activeTab === 'PROFITS'} onClick={() => setActiveTab('PROFITS')} label="الأرباح" icon={<PieChart size={18}/>} />
      </div>

      {/* Report Preview - Responsive Layout */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 overflow-hidden shadow-sm">
        <div className="p-5 sm:p-8 border-b border-brand-bg bg-brand-bg/10 flex items-center justify-between">
           <h3 className="text-lg font-black text-brand-primary">بيانات {reportConfig.type}</h3>
           <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-brand-secondary">
             <Calendar size={14} />
             <span>{selectedMonth} / {selectedYear}</span>
           </div>
        </div>

        {/* Summary Stats in Report */}
        <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
           {reportConfig.summary.map((item, idx) => (
             <div key={idx} className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl sm:rounded-[1.5rem] text-center">
                <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-lg sm:text-xl font-black ${item.color || 'text-brand-primary'}`}>
                  {typeof item.value === 'number' && item.label.includes('عدد') ? item.value : FORMAT_CURRENCY(item.value as number)}
                </p>
             </div>
           ))}
        </div>

        {/* Responsive Table for Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[600px] sm:min-w-0">
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
                  <tr key={idx} className="hover:bg-brand-bg/30 transition-colors group">
                    <td className="px-5 sm:px-8 py-4">
                       <p className="font-black text-brand-primary text-sm">{item.description || item.productName || item.customerName || item.partnerName}</p>
                       {item.category && <span className="text-[10px] text-brand-secondary font-bold">{item.category}</span>}
                    </td>
                    <td className="px-5 sm:px-8 py-4 text-center text-slate-500 font-bold text-xs">{item.date || item.dueDate}</td>
                    <td className="px-5 sm:px-8 py-4 text-left font-black text-brand-primary text-sm">{FORMAT_CURRENCY(item.amount || item.totalAmount)}</td>
                    {activeTab === 'SALES' && (
                      <td className="px-5 sm:px-8 py-4 text-left">
                        <button 
                          onClick={() => setSelectedInvoice(item)}
                          className="p-2 text-brand-primary bg-brand-bg rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-inner"
                          title="عرض الفاتورة"
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
