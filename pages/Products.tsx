
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { Search, Plus, Package, Edit2, Trash2, ArrowUpCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { productsApi } from '../services/products.api';

const Products: React.FC = () => {
  const { products, refreshData, isLoading } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({ 
    name: '', 
    costPrice: 0, 
    sellPrice: 0, 
    stock: 0 
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', costPrice: 0, sellPrice: 0, stock: 0 });
    setSelectedProduct(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await productsApi.create(formData);
      await refreshData();
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      alert("خطأ في إضافة المنتج عبر الـ API");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productsApi.update(selectedProduct.id, formData);
      await refreshData();
      setIsEditModalOpen(false);
      resetForm();
    } catch (err) {
      alert("خطأ في تحديث البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productsApi.delete(selectedProduct.id);
      await refreshData();
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert("فشل الحذف من قاعدة البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncreaseStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productsApi.adjustStock(selectedProduct.id, stockAmount);
      await refreshData();
      setIsStockModalOpen(false);
    } catch (err) {
      alert("فشل تحديث المخزن");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="البحث عن منتج..."
            className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none text-right transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-brand-primary/20 font-black active:scale-95"
        >
          <Plus size={18} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      <div className="bg-white border border-brand-accent/30 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-brand-bg/50 border-b border-brand-accent/30">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-brand-secondary uppercase tracking-widest">اسم المنتج</th>
                <th className="px-6 py-4 text-xs font-black text-brand-secondary uppercase tracking-widest">سعر التكلفة</th>
                <th className="px-6 py-4 text-xs font-black text-brand-secondary uppercase tracking-widest">سعر البيع</th>
                <th className="px-6 py-4 text-xs font-black text-brand-secondary uppercase tracking-widest">المخزون</th>
                <th className="px-6 py-4 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-primary mb-4" size={40} />
                    <p className="font-bold text-brand-secondary">جاري مزامنة بيانات المستودع...</p>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-brand-bg/30 transition-colors group">
                  <td className="px-6 py-4 font-black text-brand-primary">{product.name}</td>
                  <td className="px-6 py-4 text-brand-secondary font-bold">{FORMAT_CURRENCY(product.costPrice)}</td>
                  <td className="px-6 py-4 font-black text-brand-primary">{FORMAT_CURRENCY(product.sellPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-black ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock} قـطعة
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => { setSelectedProduct(product); setStockAmount(0); setIsStockModalOpen(true); }} className="p-2 text-brand-primary hover:bg-brand-bg rounded-lg transition-colors"><ArrowUpCircle size={18}/></button>
                       <button onClick={() => { setSelectedProduct(product); setFormData(product); setIsEditModalOpen(true); }} className="p-2 text-brand-secondary hover:bg-brand-bg rounded-lg transition-colors"><Edit2 size={18}/></button>
                       <button onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modals following the same pattern as Customers.tsx with isSubmitting check */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-accent/50">
              <div className="p-8 border-b border-brand-bg flex items-center justify-between">
                <h3 className="text-2xl font-black text-brand-primary">{isEditModalOpen ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h3>
                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}><X size={28} /></button>
              </div>
              <form onSubmit={isEditModalOpen ? handleUpdateProduct : handleAddProduct} className="p-10 space-y-6">
                <input 
                  type="text" 
                  placeholder="اسم المنتج"
                  required
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold text-right"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="سعر التكلفة"
                    className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold text-center"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                  />
                  <input 
                    type="number" 
                    placeholder="سعر البيع"
                    className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold text-center"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({...formData, sellPrice: Number(e.target.value)})}
                  />
                </div>
                <input 
                    type="number" 
                    placeholder="الكمية الافتتاحية"
                    className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold text-center"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-brand-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                  <span>{isEditModalOpen ? 'تحديث البيانات' : 'حفظ المنتج'}</span>
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Products;
