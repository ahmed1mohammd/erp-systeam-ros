
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { SYSTEM_NAME, LOGO_URL } from '../constants';
import { ShieldCheck, User as UserIcon, Lock, ChevronRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@rostech.com');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      login(email, role);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9EFEC] px-4 font-['Tajawal']" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-12 border border-[#C4DAD2]/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#16423C]/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="text-center mb-12 relative z-10">
            <img src={LOGO_URL} alt={SYSTEM_NAME} className="h-20 mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-3xl font-black text-[#16423C]">{SYSTEM_NAME}</h1>
            <p className="text-[#6A9C89] font-bold mt-2">نظام الإدارة المالية الذكي</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-sm font-black text-[#16423C] pr-1 uppercase">البريد الإلكتروني</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#6A9C89] group-focus-within:text-[#16423C] transition-colors">
                  <UserIcon size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pr-12 pl-4 py-4 bg-[#E9EFEC]/50 border-2 border-[#C4DAD2]/30 rounded-[1.5rem] focus:ring-4 focus:ring-[#16423C]/10 focus:border-[#16423C] outline-none transition-all text-right font-bold"
                  placeholder="admin@rostech.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-[#16423C] pr-1 uppercase">نوع الصلاحية</label>
              <div className="relative group">
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full px-5 py-4 bg-[#E9EFEC]/50 border-2 border-[#C4DAD2]/30 rounded-[1.5rem] focus:ring-4 focus:ring-[#16423C]/10 focus:border-[#16423C] outline-none transition-all text-right font-black text-[#16423C] appearance-none"
                >
                  <option value={UserRole.ADMIN}>مدير النظام (كامل الصلاحيات)</option>
                  <option value={UserRole.ACCOUNTANT}>محاسب (إدارة الأرقام)</option>
                  <option value={UserRole.CASHIER}>أمين خزنة (تحصيل وصرف)</option>
                </select>
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#6A9C89]">
                  <ChevronRight size={20} className="rotate-90" />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#16423C] hover:bg-[#6A9C89] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-[#16423C]/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>دخول للنظام</span>
                  <ShieldCheck size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center text-xs text-[#6A9C89] font-bold">
            <p>© {new Date().getFullYear()} {SYSTEM_NAME}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
