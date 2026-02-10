
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { Search, Plus, Edit2, Trash2, Eye, X, Loader2 } from 'lucide-react';
import { Customer } from '../types';
import { customersApi } from '../services/customers.api';

const Customers: React.FC = () => {
  const { customers, refreshData, isLoading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Customer>>({ name: '', phone: '', address: '' });

  const filteredCustomers = (customers || []).filter(c => {
    const name = c?.name || '';
    const phone = c?.phone || '';
    const search = searchTerm || '';
    return name.toLowerCase().includes(search.toLowerCase()) || 
           phone.includes(search);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customersApi.create(formData);
      await refreshData();
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', address: '' });
    } catch (error) {
      alert("فشل في إضافة العميل، يرجى التحقق من اتصال الـ API");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العميل؟")) return;
    try {
      await customersApi.delete(id);
      await refreshData();
    } catch (error) {
      alert("فشل حذف العميل");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="البحث عن عميل..."
            className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none text-right transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-brand-primary/20 font-black active:scale-95"
        >
          <Plus size={18} />
          <span>إضافة عميل</span>
        </button>
      </div>

      <div className="bg-white border border-brand-accent/30 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-brand-bg/50 border-b border-brand-accent/30">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">اسم العميل</th>
                <th className="px-6 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">رقم الهاتف</th>
                <th className="px-6 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">الرصيد المتبقي</th>
                <th className="px-6 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">تاريخ الانضمام</th>
                <th className="px-6 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="p-20 text-center text-brand-secondary font-bold">
                     <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                     جاري جلب بيانات العملاء من الـ API...
                   </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-brand-bg/30 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-sm shadow-sm">
                        {customer.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-black text-brand-primary leading-none mb-1">{customer.name}</p>
                        <p className="text-[10px] text-brand-secondary font-bold uppercase">{customer.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-brand-secondary font-bold text-sm tracking-tighter">{customer.phone}</td>
                  <td className="px-6 py-5">
                    <span className={`font-black text-lg ${customer.totalBalance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {FORMAT_CURRENCY(customer.totalBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-bold text-xs">{customer.joinDate}</td>
                  <td className="px-6 py-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="p-2.5 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-inner"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-accent/50 animate-in zoom-in-95">
            <div className="p-8 border-b border-brand-bg flex items-center justify-between bg-brand-bg/30">
              <h3 className="text-2xl font-black text-brand-primary">إضافة عميل جديد</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-brand-secondary hover:text-brand-primary p-2 hover:bg-white rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  placeholder="أدخل اسم العميل الثلاثي"
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary text-right font-bold transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  required
                  placeholder="01xxxxxxxxx"
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary text-right font-bold transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">العنوان</label>
                <textarea 
                  placeholder="أدخل عنوان العميل بالتفصيل"
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary h-32 text-right resize-none font-bold transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-5 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                <span>حفظ بيانات العميل</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
