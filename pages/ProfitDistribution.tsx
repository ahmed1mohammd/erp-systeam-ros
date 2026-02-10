
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { partnersApi } from '../services/partners.api';
import { 
  PieChart, 
  HandCoins, 
  Users,
  History,
  TrendingUp,
  Loader2,
  DollarSign,
  PlusCircle
} from 'lucide-react';

const ProfitDistribution: React.FC = () => {
  const { partners, refreshData, distributionHistory, dashboardStats } = useApp();
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});
  const [distAmount, setDistAmount] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);

  const handleInputChange = (partnerId: string, value: string) => {
    setPayAmounts(prev => ({ ...prev, [partnerId]: value }));
  };

  const handleDistribute = async () => {
    const amount = parseFloat(distAmount);
    if (!amount || amount <= 0) return;
    setIsDistributing(true);
    try {
      await partnersApi.distribute(amount);
      await refreshData();
      setDistAmount('');
      alert('تم توزيع الأرباح على محافظ الشركاء بنجاح');
    } catch (error) {
      alert('فشل توزيع الأرباح');
    } finally {
      setIsDistributing(false);
    }
  };

  const handleWithdraw = async (partnerId: string) => {
    const amount = parseFloat(payAmounts[partnerId] || '0');
    if (!amount || amount <= 0) return;
    
    setIsWithdrawing(partnerId);
    try {
      await partnersApi.withdraw(partnerId, amount);
      await refreshData();
      setPayAmounts(prev => ({ ...prev, [partnerId]: '' }));
      alert('تم تسجيل عملية السحب بنجاح');
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل السحب');
    } finally {
      setIsWithdrawing(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20" dir="rtl">
      {/* 1. Header with Distribution Form */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/20 rounded-3xl text-blue-400 border border-blue-500/20 shadow-inner">
                <PieChart size={36} />
              </div>
              <div>
                <h1 className="text-3xl font-black">نظام الشركاء والمحافظ</h1>
                <p className="text-slate-400 font-bold mt-1">توزيع أرباح وسحب مبالغ نقدية</p>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">توزيع أرباح مجمعة</p>
                <input 
                  type="number" 
                  placeholder="المبلغ الإجمالي للتوزيع"
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none w-full"
                  value={distAmount}
                  onChange={(e) => setDistAmount(e.target.value)}
                />
              </div>
              <button 
                onClick={handleDistribute}
                disabled={isDistributing || !distAmount}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-8 py-2 rounded-xl h-fit self-end flex items-center gap-2"
              >
                {isDistributing ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                توزيع الآن
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <span className="text-xs font-black text-slate-500 uppercase">إجمالي الربح الصافي</span>
                <p className="text-3xl font-black text-white">{FORMAT_CURRENCY(dashboardStats?.netProfit || 0)}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <span className="text-xs font-black text-slate-500 uppercase">إجمالي المسحوبات</span>
                <p className="text-2xl font-black text-red-400">{FORMAT_CURRENCY(partners.reduce((a,b)=>a+b.totalWithdrawn, 0))}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <span className="text-xs font-black text-slate-500 uppercase">الرصيد المتاح للشركاء</span>
                <p className="text-2xl font-black text-green-400">{FORMAT_CURRENCY(partners.reduce((a,b)=>a+b.currentBalance, 0))}</p>
              </div>
          </div>
        </div>
      </div>

      {/* 2. Partners Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map(partner => (
          <div key={partner.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col border-b-8 border-b-brand-primary/10">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-bg text-brand-primary flex items-center justify-center">
                  <Users size={28} />
                </div>
                <div className="bg-brand-accent/30 px-3 py-1 text-brand-primary font-black text-xs rounded-lg">
                  {partner.sharePercentage}% حصة
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-6">{partner.name}</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">إجمالي ما سحبه:</span>
                  <span className="font-black text-red-600">{FORMAT_CURRENCY(partner.totalWithdrawn)}</span>
                </div>
                
                <div className="bg-brand-primary p-5 rounded-2xl text-white mt-4 shadow-xl">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-brand-accent uppercase">الرصيد المتاح حالياً:</span>
                     <span className="text-xl font-black">{FORMAT_CURRENCY(partner.currentBalance)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 mt-auto">
              <div className="space-y-4">
                <input 
                  type="number" 
                  placeholder="مبلغ للسحب..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary text-center font-black"
                  value={payAmounts[partner.id] || ''}
                  onChange={(e) => handleInputChange(partner.id, e.target.value)}
                />
                <button 
                  onClick={() => handleWithdraw(partner.id)}
                  disabled={isWithdrawing === partner.id || !payAmounts[partner.id]}
                  className="w-full py-4 bg-brand-primary text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-lg"
                >
                  {isWithdrawing === partner.id ? <Loader2 size={18} className="animate-spin" /> : <HandCoins size={18} />}
                  <span>صرف مبلغ كاش</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. History */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
           <History size={24} className="text-brand-secondary" />
           <h3 className="text-xl font-black text-brand-primary">سجل المحافظ (آخر العمليات)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase">
              <tr>
                <th className="px-8 py-5">الشريك</th>
                <th className="px-8 py-5">النوع</th>
                <th className="px-8 py-5">المبلغ</th>
                <th className="px-8 py-5">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {distributionHistory.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-brand-primary">{record.partnerName}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] ${record.type === 'DISTRIBUTION' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {record.type === 'DISTRIBUTION' ? 'إيداع أرباح' : 'سحب كاش'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black">{FORMAT_CURRENCY(record.amount)}</td>
                  <td className="px-8 py-5 text-slate-400 text-sm">{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitDistribution;
