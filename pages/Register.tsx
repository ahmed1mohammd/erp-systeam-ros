
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/auth.api';
import { SYSTEM_NAME, LOGO_URL } from '../constants';
import { ShieldCheck, User as UserIcon, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authApi.createUser({ ...formData, role: 'ADMIN' });
      alert('تم إنشاء حساب المدير بنجاح. يمكنك الآن تسجيل الدخول.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطأ في تسجيل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9EFEC] px-4 font-['Tajawal']" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-12 border border-[#C4DAD2]/50 relative overflow-hidden">
          <div className="text-center mb-10">
            <img src={LOGO_URL} alt={SYSTEM_NAME} className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-[#16423C]">إنشاء حساب جديد</h1>
            <p className="text-[#6A9C89] font-bold mt-2">انضم لنظام ROS TECH المالي</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-black text-[#16423C] pr-1">الاسم بالكامل</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A9C89]" size={18} />
                <input 
                  type="text" required
                  className="w-full pr-12 pl-4 py-4 bg-[#E9EFEC]/50 border-2 border-[#C4DAD2]/30 rounded-[1.2rem] focus:border-[#16423C] outline-none font-bold"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-black text-[#16423C] pr-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A9C89]" size={18} />
                <input 
                  type="email" required
                  className="w-full pr-12 pl-4 py-4 bg-[#E9EFEC]/50 border-2 border-[#C4DAD2]/30 rounded-[1.2rem] focus:border-[#16423C] outline-none font-bold text-left"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-black text-[#16423C] pr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A9C89]" size={18} />
                <input 
                  type="password" required
                  className="w-full pr-12 pl-4 py-4 bg-[#E9EFEC]/50 border-2 border-[#C4DAD2]/30 rounded-[1.2rem] focus:border-[#16423C] outline-none font-bold text-left"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#16423C] hover:bg-[#6A9C89] text-white font-black py-5 rounded-[1.2rem] shadow-xl transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (
                <>
                  <span>إنشاء الحساب</span>
                  <ShieldCheck size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[#16423C] font-black flex items-center justify-center gap-2 hover:underline">
              <span>لديك حساب بالفعل؟ سجل دخولك</span>
              <ArrowRight size={18} className="rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
