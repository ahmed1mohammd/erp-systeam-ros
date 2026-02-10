
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Filter, X, Eye, Receipt, Loader2, Check } from 'lucide-react';
import { Transaction } from '../types';
import { safesApi } from '../services/safes.api';

const Safe: React.FC = () => {
  const { transactions, refreshData, setSelectedInvoice, isLoading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: 'EXPENSE', amount: '', category: '', description: '' });

  // Extremely defensive rendering helper for React Children
  const safeRender = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      // Check for common nested identity properties
      const displayVal = val.name || val.title || val.description || val._id || val.id;
      if (typeof displayVal === 'string' || typeof displayVal === 'number') return String(displayVal);
      return 'حركة نظام مركبة';
    }
    return 'بيانات غير صالحة';
  };

  const totalIncome = (transactions || []).filter(t => t.type === 'INCOME').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalExpense = (transactions || []).filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await safesApi.addTransaction({
        type: formData.type as any,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date().toISOString().split('T')[0]
      });
      await refreshData();
      setIsModalOpen(false);
      setFormData({ type: 'EXPENSE', amount: '', category: '', description: '' });
    } catch (error) {
      alert("خطأ في تسجيل الحركة المالية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = (tx: Transaction) => {
    const payload = {
      id: tx.id || tx._id,
      date: tx.date,
      customerName: safeRender(tx.description),
      productName: `حركة مالية: ${safeRender(tx.category)}`,
      totalAmount: tx.amount,
      downPayment: tx.amount,
      type: tx.type === 'INCOME' ? 'CASH' : 'EXPENSE'
    };
    setSelectedInvoice(payload);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      {/* Header Info */}
      <div className="bg-brand-primary rounded-[3rem] p-8 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-brand-secondary border border-white/10 shadow-inner shrink-0">
             <Wallet size={40} />
          </div>
          <div>
            <p className="text-brand-accent font-black uppercase tracking-widest text-[10px] mb-1">رصيد الخزنة الفعلي (Real-time)</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">{FORMAT_CURRENCY(balance)}</h1>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6 relative z-10 w-full md:w-auto">
          <div className="bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/10 flex-1 md:flex-none">
            <p className="text-[10px] text-brand-secondary font-black uppercase mb-1">إجمالي الدخل</p>
            <p className="text-xl font-black text-green-400">{FORMAT_CURRENCY(totalIncome)}</p>
          </div>
          <div className="bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/10 flex-1 md:flex-none">
            <p className="text-[10px] text-brand-secondary font-black uppercase mb-1">إجمالي المصروف</p>
            <p className="text-xl font-black text-red-400">{FORMAT_CURRENCY(totalExpense)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-black text-brand-primary self-start">سجل العمليات الأخير</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-brand-primary text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all font-black shadow-xl shadow-brand-primary/20"
        >
          <Plus size={22} />
          <span>إضافة حركة يدوية</span>
        </button>
      </div>

      <div className="bg-white border border-brand-accent/30 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead className="bg-brand-bg/50 border-b border-brand-accent/30">
              <tr>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest">الوصف</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest">التصنيف</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest text-center">التاريخ</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">المبلغ</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="p-20 text-center text-brand-secondary">
                     <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                     <p className="font-black text-sm uppercase tracking-widest">Syncing with Secure Vault...</p>
                   </td>
                </tr>
              ) : (transactions || []).length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-20 text-center text-brand-secondary font-bold">لا توجد عمليات مسجلة حالياً.</td>
                </tr>
              ) : (transactions || []).map((tx: any) => (
                <tr key={tx.id || tx._id} className="hover:bg-brand-bg/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type === 'INCOME' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                      </div>
                      <span className="font-black text-brand-primary text-base truncate max-w-xs">
                        {safeRender(tx.description)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-brand-bg text-brand-primary rounded-xl text-[10px] font-black uppercase border border-brand-accent/20">
                        {safeRender(tx.category)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-brand-secondary font-bold text-xs text-center">{safeRender(tx.date)}</td>
                  <td className="px-8 py-6 text-lg font-black text-left">
                    <span className={tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'INCOME' ? '+' : '-'}{FORMAT_CURRENCY(tx.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-left">
                     <button 
                       onClick={() => handleViewReceipt(tx)}
                       className="p-3 text-brand-primary bg-brand-bg rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-inner"
                       title="عرض التفاصيل"
                     >
                       <Eye size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-accent/50 animate-in zoom-in-95">
            <div className="p-8 border-b border-brand-bg flex items-center justify-between bg-brand-bg/30">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-brand-primary text-white rounded-2xl">
                    <Receipt size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-brand-primary">تسجيل حركة نقدية</h3>
               </div>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-secondary hover:text-brand-primary p-2 hover:bg-white rounded-full transition-all">
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">نوع المعاملة</label>
                <select 
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary text-right font-black"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="EXPENSE">مصروف (سحب من الخزنة)</option>
                  <option value="INCOME">إيداع (توريد للخزنة)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">المبلغ (EGP)</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-5 py-5 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary text-center font-black text-3xl"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">وصف الحركة</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: سداد فاتورة كهرباء"
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary text-right font-bold"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 px-8 py-5 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                <span>اعتماد الحركة وتحديث الرصيد</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Safe;
