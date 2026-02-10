
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authApi } from '../services/auth.api';
import { UserPlus, Shield, Mail, User as UserIcon, Trash2, Key, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { UserRole, User } from '../types';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.CASHIER
  });

  const fetchUsers = async () => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      setFetchError("عذراً، هذه الصفحة متاحة للمديرين فقط.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await authApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      setFetchError(error.response?.data?.message || "فشل الوصول لسجل المستخدمين. تأكد من اتصال السيرفر.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.createUser(formData);
      await fetchUsers();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: UserRole.CASHIER });
      alert('تم إنشاء حساب الموظف بنجاح');
    } catch (error: any) {
      alert(error.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذه الخطوة.")) return;
    try {
      await authApi.deleteUser(id);
      setUsers(prev => prev.filter(u => (u.id !== id && u._id !== id)));
    } catch (error) {
      alert("فشل في حذف المستخدم");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-xl">
            <UserIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-primary">إدارة الموظفين</h2>
            <p className="text-brand-secondary font-bold">صلاحية حصرية لمدير النظام</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-brand-primary/20 font-black active:scale-95"
        >
          <UserPlus size={20} />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex items-center gap-4 text-red-700 font-bold">
           <AlertCircle size={24} />
           <p className="flex-1">{fetchError}</p>
           <button onClick={fetchUsers} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm">إعادة المحاولة</button>
        </div>
      )}

      <div className="bg-white border border-brand-accent/30 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-brand-bg bg-brand-bg/10 flex items-center gap-3">
          <Shield size={20} className="text-brand-secondary" />
          <h3 className="font-black text-brand-primary">قائمة الموظفين والمسؤولين</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-brand-bg/50">
              <tr>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest">الموظف</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest">البريد الإلكتروني</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest">الصلاحية</th>
                <th className="px-8 py-6 text-xs font-black text-brand-secondary uppercase tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
                    <p className="mt-4 text-brand-secondary font-bold">جاري مزامنة بيانات الفريق...</p>
                  </td>
                </tr>
              ) : users.length === 0 && !fetchError ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-brand-secondary font-bold">لا يوجد موظفين مسجلين حالياً أو ليس لديك صلاحية العرض.</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id || u._id} className="hover:bg-brand-bg/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-black shadow-inner">
                         {u.name?.charAt(0) || 'U'}
                       </div>
                       <span className="font-black text-brand-primary text-lg">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-500">{u.email}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                      u.role === UserRole.ACCOUNTANT ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-left">
                    <button 
                      onClick={() => handleDelete(u.id || u._id!)}
                      disabled={u.email === currentUser?.email}
                      className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-2xl transition-all disabled:opacity-30 shadow-inner"
                      title="حذف الموظف"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-accent/50 animate-in zoom-in-95">
            <div className="p-8 border-b border-brand-bg flex items-center justify-between bg-brand-primary text-white">
              <div className="flex items-center gap-3">
                 <UserPlus size={24} />
                 <h3 className="text-2xl font-black">إضافة موظف جديد</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-all"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">الاسم الكامل للموظف</label>
                <div className="relative">
                  <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input 
                    type="text" required
                    placeholder="أدخل الاسم الثلاثي"
                    className="w-full pr-12 pl-4 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold transition-all text-right"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">البريد الإلكتروني (لتسجيل الدخول)</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input 
                    type="email" required
                    placeholder="email@example.com"
                    className="w-full pr-12 pl-4 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold transition-all text-left"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">كلمة المرور المؤقتة</label>
                <div className="relative">
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input 
                    type="password" required
                    placeholder="••••••••"
                    className="w-full pr-12 pl-4 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-bold transition-all text-left"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-brand-primary pr-1">الدور الوظيفي والصلاحيات</label>
                <select 
                  className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-accent rounded-2xl outline-none focus:border-brand-primary font-black appearance-none cursor-pointer text-right"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.CASHIER}>كاشير (مبيعات وتحصيل فقط)</option>
                  <option value={UserRole.ACCOUNTANT}>محاسب (خزنة وتقارير مالية)</option>
                  <option value={UserRole.ADMIN}>مدير نظام (صلاحيات كاملة)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-primary hover:bg-brand-secondary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                <span>اعتماد إنشاء الحساب</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
