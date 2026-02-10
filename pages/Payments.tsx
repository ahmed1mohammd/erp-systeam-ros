
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { Search, CheckCircle2, Clock, Filter, Calendar, AlertTriangle, CheckCircle, X, Check, Eye, Loader2 } from 'lucide-react';
import { installmentsApi } from '../services/installments.api';

const Payments: React.FC = () => {
  const { customers, sales, installments, refreshData, setSelectedInvoice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ amount: number, customer: string, saleId: string } | null>(null);

  // Safe string extractor to prevent Error #31
  const safeStr = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val._id || val.id || val.name || 'N/A';
    }
    return '';
  };

  const displayInstallments = useMemo(() => {
    return (installments || []).map(inst => {
      // Handle cases where saleId might be a populated object from the API
      const saleIdStr = safeStr(inst.saleId);
      const sale = (sales || []).find(s => (s.id === saleIdStr || s._id === saleIdStr));
      
      const custId = sale?.customerId?._id || sale?.customerId;
      const customer = (customers || []).find(c => (c.id === custId || c._id === custId));
      
      const today = new Date();
      const dueDate = new Date(inst.dueDate);
      
      let status = inst.status;
      if (status === 'PENDING' && dueDate < today) {
        status = 'OVERDUE';
      }

      return {
        ...inst,
        status,
        customerName: customer?.name || sale?.customerName || 'عميل غير معروف',
        customerId: custId || '',
        saleIdDisplay: saleIdStr,
        saleData: sale
      };
    });
  }, [installments, sales, customers]);

  const filteredInstallments = (displayInstallments || []).filter(inst => {
    const customerName = inst.customerName || '';
    const saleId = String(inst.saleIdDisplay || '');
    const search = searchTerm || '';
    
    const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) || 
                         saleId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterOverdue ? inst.status === 'OVERDUE' : true;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (a.status === 'PAID' && b.status !== 'PAID') return 1;
    if (a.status !== 'PAID' && b.status === 'PAID') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handlePayInstallment = async (instId: string, amount: number, customerName: string, saleId: string) => {
      setIsProcessing(instId);
      try {
        await installmentsApi.pay(instId);
        await refreshData();
        setSuccessMessage({ amount, customer: customerName, saleId });
      } catch (error: any) {
        alert(error.response?.data?.message || "فشل في تسجيل عملية التحصيل");
      } finally {
        setIsProcessing(null);
      }
  };

  const handleViewReceipt = (inst: any) => {
    if (inst.saleData) {
        setSelectedInvoice(inst.saleData);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="space-y-6 relative" dir="rtl">
      {successMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-[#16423C] text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border-2 border-[#6A9C89]/30 min-w-[350px]">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 border border-green-500/30">
              <CheckCircle size={24} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">تم التحصيل بنجاح!</p>
              <p className="text-xs text-[#C4DAD2] font-bold">
                مبلغ {FORMAT_CURRENCY(successMessage.amount)} من {successMessage.customer}
              </p>
            </div>
            <button 
              onClick={() => {
                const saleIdStr = successMessage.saleId;
                const sale = sales.find(s => (s.id === saleIdStr || s._id === saleIdStr));
                if (sale) setSelectedInvoice(sale);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <Eye size={18} />
            </button>
            <button onClick={() => setSuccessMessage(null)} className="text-[#6A9C89] hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A9C89]" size={18} />
          <input 
            type="text"
            placeholder="البحث بالعميل أو رقم الفاتورة..."
            className="w-full pr-10 pl-4 py-3 bg-white border-2 border-[#C4DAD2]/30 rounded-2xl focus:ring-4 focus:ring-[#16423C]/10 focus:border-[#16423C] outline-none text-right transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setFilterOverdue(!filterOverdue)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all shadow-sm border-2 ${
            filterOverdue 
            ? 'bg-red-500 text-white border-red-500' 
            : 'bg-white border-[#C4DAD2]/30 text-[#16423C] hover:bg-[#E9EFEC]'
          }`}
        >
           <Filter size={18} />
           <span>{filterOverdue ? 'عرض الكل' : 'تصفية المتأخرات'}</span>
        </button>
      </div>

      <div className="bg-white border border-[#C4DAD2]/50 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#E9EFEC]/50 border-b border-[#C4DAD2]/30">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-[#6A9C89] uppercase tracking-widest">العميل</th>
                <th className="px-8 py-5 text-xs font-black text-[#6A9C89] uppercase tracking-widest">رقم الفاتورة</th>
                <th className="px-8 py-5 text-xs font-black text-[#6A9C89] uppercase tracking-widest">تاريخ الاستحقاق</th>
                <th className="px-8 py-5 text-xs font-black text-[#6A9C89] uppercase tracking-widest">قيمة القسط</th>
                <th className="px-8 py-5 text-xs font-black text-[#6A9C89] uppercase tracking-widest text-left">الحالة والإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFEC]">
              {filteredInstallments.length > 0 ? (
                filteredInstallments.map((inst) => {
                  const isOverdue = inst.status === 'OVERDUE';
                  const isPaid = inst.status === 'PAID';
                  const instId = inst.id || inst._id;

                  return (
                    <tr 
                      key={instId} 
                      className={`transition-all duration-300 ${isPaid ? 'bg-green-50/40 opacity-80' : isOverdue ? 'bg-red-50/70 hover:bg-red-100/70' : 'hover:bg-[#E9EFEC]/30'}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors ${
                            isPaid ? 'bg-green-100 text-green-600 border-green-200' :
                            isOverdue ? 'bg-red-100 text-red-600 border-red-200' : 
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {isPaid ? <Check size={20} /> : isOverdue ? <AlertTriangle size={20} /> : <Clock size={20} />}
                          </div>
                          <p className={`font-black transition-colors ${isPaid ? 'text-green-700' : 'text-[#16423C]'}`}>{safeStr(inst.customerName)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[#6A9C89] font-black">{safeStr(inst.saleIdDisplay)}</td>
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-1.5 font-bold ${isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          <Calendar size={14} />
                          {new Date(inst.dueDate).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-lg text-[#16423C]">
                        {FORMAT_CURRENCY(inst.amount)}
                      </td>
                      <td className="px-8 py-5 text-left">
                        <div className="flex items-center justify-end gap-3">
                          {isPaid ? (
                            <>
                                <button 
                                  onClick={() => handleViewReceipt(inst)}
                                  className="p-2.5 text-brand-primary bg-white border border-brand-accent rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-inner"
                                >
                                  <Eye size={18} />
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-black rounded-xl shadow-lg">
                                  <CheckCircle2 size={16} />
                                  <span>تم التحصيل</span>
                                </div>
                            </>
                          ) : (
                            <>
                              {isOverdue && (
                                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg animate-pulse uppercase">متأخر</span>
                              )}
                              <button 
                                disabled={isProcessing === instId}
                                onClick={() => handlePayInstallment(instId, inst.amount, inst.customerName, inst.saleIdDisplay)}
                                className="px-6 py-2 bg-[#16423C] hover:bg-[#6A9C89] text-white rounded-xl font-black text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                              >
                                {isProcessing === instId ? <Loader2 size={16} className="animate-spin" /> : 'تحصيل الآن'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-[#6A9C89] font-bold bg-[#E9EFEC]/10">
                    <p className="text-xl">لا يوجد أقساط مطابقة للبحث.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
