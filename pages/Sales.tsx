
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  Calculator, 
  CheckCircle2, 
  X, 
  Eye, 
  History, 
  Plus,
  ArrowRight,
  FileText,
  Search
} from 'lucide-react';
import { Sale, Installment } from '../types';

const Sales: React.FC = () => {
  const { customers, setCustomers, products, setSales, sales, setTransactions, transactions, installments, setInstallments, setSelectedInvoice } = useApp();
  
  const [view, setView] = useState<'LIST' | 'CREATE' | 'SUCCESS'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [paymentType, setPaymentType] = useState<'CASH' | 'INSTALLMENT'>('CASH');
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(1);
  const [lastSaleId, setLastSaleId] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const monthlyInstallment = useMemo(() => {
    if (!selectedProduct || paymentType === 'CASH') return 0;
    const remaining = selectedProduct.sellPrice - downPayment;
    return remaining / installmentsCount;
  }, [selectedProduct, paymentType, downPayment, installmentsCount]);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedCustomerId) return;

    const saleId = `S-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const newSale: Sale = {
      id: saleId,
      customerId: selectedCustomerId,
      productId: selectedProductId,
      type: paymentType,
      totalAmount: selectedProduct.sellPrice,
      downPayment: paymentType === 'CASH' ? selectedProduct.sellPrice : downPayment,
      date: new Date().toISOString().split('T')[0],
      installmentsCount: paymentType === 'CASH' ? 0 : installmentsCount,
    };

    if (paymentType === 'INSTALLMENT') {
      const debt = selectedProduct.sellPrice - downPayment;
      const newInstallments: Installment[] = Array.from({ length: installmentsCount }).map((_, idx) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + idx + 1);
        return {
          id: `INST-${saleId}-${idx + 1}`,
          saleId: saleId,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: debt / installmentsCount,
          status: 'PENDING'
        };
      });
      setInstallments(prev => [...prev, ...newInstallments]);
      
      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomerId ? { ...c, totalBalance: c.totalBalance + debt } : c
      ));
    }

    setSales([newSale, ...sales]);
    setLastSaleId(saleId);

    const cashEntry = {
      id: `TX-${Date.now()}`,
      type: 'INCOME' as const,
      category: 'مبيعات',
      amount: newSale.downPayment,
      date: newSale.date,
      description: `فاتورة بيع ${saleId} - ${selectedProduct.name}`,
    };
    setTransactions([cashEntry, ...transactions]);

    setView('SUCCESS');
  };

  const reset = () => {
    setView('LIST');
    setSelectedCustomerId('');
    setSelectedProductId('');
    setDownPayment(0);
    setInstallmentsCount(1);
    setLastSaleId('');
  };

  const filteredSales = sales.filter(s => {
    const customer = customers.find(c => c.id === s.customerId);
    return s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {view === 'LIST' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg">
                    <History size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-brand-primary">سجل المبيعات</h2>
                    <p className="text-brand-secondary font-bold">إدارة وعرض كافة عمليات البيع السابقة</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                    <input 
                        type="text" 
                        placeholder="بحث برقم الفاتورة أو العميل..."
                        className="pr-10 pl-4 py-2.5 bg-white border border-brand-accent rounded-xl outline-none focus:ring-2 focus:ring-brand-primary w-64 text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setView('CREATE')}
                    className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20"
                >
                    <Plus size={20} />
                    <span>فاتورة جديدة</span>
                </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-brand-accent/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-brand-bg border-b border-brand-accent/30">
                        <tr>
                            <th className="px-8 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">رقم الفاتورة</th>
                            <th className="px-8 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">العميل</th>
                            <th className="px-8 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">المنتج</th>
                            <th className="px-8 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">التاريخ</th>
                            <th className="px-8 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">الإجمالي</th>
                            <th className="px-8 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-bg">
                        {filteredSales.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-5 font-black text-brand-primary">{sale.id}</td>
                                <td className="px-8 py-5 font-bold text-slate-700">
                                    {customers.find(c => c.id === sale.customerId)?.name}
                                </td>
                                <td className="px-8 py-5 text-brand-secondary font-black text-sm">
                                    {products.find(p => p.id === sale.productId)?.name}
                                </td>
                                <td className="px-8 py-5 text-slate-500 font-bold">{sale.date}</td>
                                <td className="px-8 py-5 text-left font-black text-brand-primary">
                                    {FORMAT_CURRENCY(sale.totalAmount)}
                                    <span className={`mr-2 px-2 py-0.5 rounded-lg text-[10px] ${sale.type === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {sale.type === 'CASH' ? 'كاش' : 'تقسيط'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-left">
                                    <button 
                                        onClick={() => setSelectedInvoice(sale)}
                                        className="p-2.5 bg-brand-bg text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-inner"
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
        </div>
      )}

      {view === 'CREATE' && (
        <div className="bg-white rounded-[2.5rem] border border-brand-accent/50 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div className="bg-brand-primary p-10 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <ShoppingBag className="text-brand-secondary" size={32} />
                </div>
                <h2 className="text-3xl font-black">إصدار فاتورة بيع جديدة</h2>
            </div>
            <button onClick={() => setView('LIST')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                <ArrowRight size={24} className="rotate-180" />
            </button>
          </div>

          <form onSubmit={handleCreateSale} className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">العميل</label>
                <select 
                  required
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-right font-bold transition-all"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- اختر العميل من القائمة --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">المنتج</label>
                <select 
                  required
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-right font-bold transition-all"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">-- اختر المنتج --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - {FORMAT_CURRENCY(p.sellPrice)}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-brand-primary pr-1">نظام السداد</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setPaymentType('CASH')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black ${paymentType === 'CASH' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-brand-accent text-brand-secondary'}`}
                  >
                    <CreditCard size={20} />
                    <span>نقدي كاش</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentType('INSTALLMENT')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black ${paymentType === 'INSTALLMENT' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-brand-accent text-brand-secondary'}`}
                  >
                    <Calendar size={20} />
                    <span>بالتقسيط</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {paymentType === 'INSTALLMENT' && (
                <div className="bg-brand-primary/5 p-8 rounded-[2rem] border-2 border-dashed border-brand-primary/20 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-3 text-brand-primary font-black">
                     <Calculator size={22} className="text-brand-secondary" />
                     <span>تفاصيل خطة التقسيط</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-brand-secondary uppercase tracking-widest">المقدم (كاش)</label>
                        <input 
                        type="number" 
                        className="w-full px-5 py-3 bg-white border-2 border-brand-accent rounded-xl outline-none focus:border-brand-primary text-center font-black"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-brand-secondary uppercase tracking-widest">عدد الشهور</label>
                        <select 
                        className="w-full px-5 py-3 bg-white border-2 border-brand-accent rounded-xl outline-none focus:border-brand-primary text-center font-black"
                        value={installmentsCount}
                        onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                        >
                        <option value={1}>شهر واحد</option>
                        <option value={2}>شهران</option>
                        <option value={3}>3 شهور</option>
                        </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-brand-primary p-8 rounded-[2rem] text-white shadow-xl shadow-brand-primary/20 space-y-4">
                <div className="flex justify-between items-center text-brand-accent font-bold">
                  <span>إجمالي القيمة:</span>
                  <span className="text-xl">{selectedProduct ? FORMAT_CURRENCY(selectedProduct.sellPrice) : '--'}</span>
                </div>
                {paymentType === 'INSTALLMENT' && (
                  <>
                    <div className="flex justify-between items-center text-green-400 font-bold border-t border-white/10 pt-4">
                      <span>المدفوع مقدماً:</span>
                      <span>{FORMAT_CURRENCY(downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-secondary font-black text-lg bg-white/5 p-4 rounded-xl">
                      <span>القسط الشهري:</span>
                      <span>{FORMAT_CURRENCY(monthlyInstallment)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center font-black text-2xl border-t-4 border-brand-secondary pt-4 mt-2">
                  <span>الصافي المطلوب:</span>
                  <span>{selectedProduct ? FORMAT_CURRENCY(selectedProduct.sellPrice) : '--'}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!selectedProductId || !selectedCustomerId}
                className="w-full bg-brand-primary hover:bg-brand-secondary disabled:bg-slate-200 text-white font-black py-5 rounded-[1.5rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={24} />
                <span>إتمام عملية البيع الآن</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'SUCCESS' && (
        <div className="bg-white p-12 rounded-[3rem] border border-brand-primary/20 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto border-t-[12px] border-t-brand-primary">
           <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-200">
             <CheckCircle2 size={48} className="animate-bounce" />
           </div>
           <div>
             <h2 className="text-4xl font-black text-brand-primary mb-3">تم البيع بنجاح!</h2>
             <p className="text-xl text-brand-secondary font-bold italic">رقم الفاتورة: {lastSaleId}</p>
             <p className="text-slate-500 mt-2 font-bold">يمكنك الآن عرض تفاصيل الفاتورة أو العودة للسجل.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => setSelectedInvoice(sales.find(s => s.id === lastSaleId))}
                className="flex items-center justify-center gap-3 px-8 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-lg hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20"
              >
                <Eye size={24} />
                عرض الفاتورة
              </button>
              <button 
                onClick={reset}
                className="flex items-center justify-center gap-3 px-8 py-5 border-2 border-brand-accent text-brand-primary rounded-[1.5rem] font-black text-lg hover:bg-brand-bg transition-all"
              >
                <FileText size={24} />
                العودة للسجل
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
