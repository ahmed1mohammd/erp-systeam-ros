
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { 
  PieChart, 
  HandCoins, 
  CheckCircle, 
  Info, 
  Users,
  History,
  DollarSign,
  Calculator,
  ArrowDownCircle,
  TrendingUp
} from 'lucide-react';

const ProfitDistribution: React.FC = () => {
  const { transactions, partners, setPartners, setTransactions, distributionHistory, setDistributionHistory } = useApp();
  
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});

  // 1. حساب إجمالي الإيرادات
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  
  // 2. حساب مصاريف التشغيل فقط (إيجار، رواتب، إلخ) واستبعاد مبالغ "صرف الأرباح"
  // هذا يضمن أن توزيع الربح لا يقلل من الربح نفسه في المعادلة
  const operationalExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && t.category !== 'صرف أرباح')
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. صافي الربح الحقيقي للمحل (قبل التوزيع)
  const netProfit = Math.max(0, totalIncome - operationalExpenses);

  const handleInputChange = (partnerId: string, value: string) => {
    setPayAmounts(prev => ({ ...prev, [partnerId]: value }));
  };

  const handlePayPartner = (partnerId: string) => {
    const amountToPay = parseFloat(payAmounts[partnerId] || '0');
    const partner = partners.find(p => p.id === partnerId);
    
    if (!partner) return;

    // نصيب الشريك من الربح الكلي
    const totalShare = netProfit * (partner.sharePercentage / 100);
    // المتبقي الفعلي له
    const currentRemaining = totalShare - partner.paidAmount;

    if (amountToPay <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amountToPay > currentRemaining + 0.1) {
      alert(`المبلغ المدخل أكبر من المتبقي للشريك (${FORMAT_CURRENCY(currentRemaining)})`);
      return;
    }

    // تحديث ما تم صرفه للشريك في الحالة (State)
    setPartners(prev => prev.map(p => 
      p.id === partnerId ? { ...p, paidAmount: p.paidAmount + amountToPay } : p
    ));

    // تسجيل العملية في الخزنة كـ "صرف أرباح" (يتم استبعادها من حسبة صافي الربح فوق)
    const expenseTx = {
      id: `TX-PROF-${Date.now()}`,
      type: 'EXPENSE' as const,
      category: 'صرف أرباح',
      amount: amountToPay,
      date: new Date().toISOString().split('T')[0],
      description: `صرف أرباح للشريك: ${partner.name}`,
    };
    setTransactions(prev => [expenseTx, ...prev]);

    // تسجيل في سجل التوزيعات
    const historyRecord = {
      id: `HIST-${Date.now()}`,
      partnerName: partner.name,
      amount: amountToPay,
      date: new Date().toISOString().split('T')[0],
    };
    setDistributionHistory(prev => [historyRecord, ...prev]);

    setPayAmounts(prev => ({ ...prev, [partnerId]: '' }));
    alert(`تم صرف ${FORMAT_CURRENCY(amountToPay)} بنجاح.`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20" dir="rtl">
      {/* 1. Dashboard Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-blue-500/20 rounded-3xl text-blue-400 border border-blue-500/20 shadow-inner">
              <PieChart size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-black">نظام توزيع الأرباح</h1>
              <p className="text-slate-400 font-bold mt-1">تثبيت الحصص والتحكم اليدوي في المبالغ المتبقية</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-500 uppercase">أرباح المحل الكلية</span>
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <p className="text-3xl font-black text-white">{FORMAT_CURRENCY(netProfit)}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold">هذا الرقم ثابت ولا يتأثر بعمليات صرف الأرباح</p>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-500 uppercase">إجمالي الإيرادات</span>
                </div>
                <p className="text-2xl font-black text-green-400">{FORMAT_CURRENCY(totalIncome)}</p>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-500 uppercase">مصاريف التشغيل</span>
                </div>
                <p className="text-2xl font-black text-red-400">{FORMAT_CURRENCY(operationalExpenses)}</p>
              </div>
          </div>
        </div>
      </div>

      {/* 2. Partners Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map(partner => {
          const totalShare = netProfit * (partner.sharePercentage / 100);
          const remaining = Math.max(0, totalShare - partner.paidAmount);
          const isFullyPaid = remaining <= 0 && totalShare > 0;

          return (
            <div key={partner.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col border-b-8 border-b-slate-100">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Users size={28} />
                  </div>
                  <div className="bg-blue-50 px-3 py-1 text-blue-600 font-black text-xs rounded-lg">
                    {partner.sharePercentage}% نسبة
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-6">{partner.name}</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">إجمالي نصيبه:</span>
                    <span className="font-black text-slate-800">{FORMAT_CURRENCY(totalShare)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">تم صرفه:</span>
                    <span className="font-black text-blue-600">{FORMAT_CURRENCY(partner.paidAmount)}</span>
                  </div>
                  
                  {/* المتبقي - هنا التركيز الأساسي */}
                  <div className="bg-slate-900 p-5 rounded-2xl text-white mt-4 shadow-xl">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase">المتبقي له حالياً:</span>
                       <span className="text-xl font-black">{FORMAT_CURRENCY(remaining)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="ادخل مبلغ لصرفه..."
                      disabled={remaining <= 0}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-center font-black disabled:opacity-50"
                      value={payAmounts[partner.id] || ''}
                      onChange={(e) => handleInputChange(partner.id, e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={() => handlePayPartner(partner.id)}
                    disabled={remaining <= 0 || !payAmounts[partner.id]}
                    className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all 
                      ${remaining > 0 && payAmounts[partner.id]
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    <HandCoins size={18} />
                    <span>تأكيد صرف المبلغ</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Historical Log */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
               <History size={24} />
             </div>
             <h3 className="text-xl font-black text-slate-900">سجل المدفوعات</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">اسم الشريك</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">المبلغ</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">التاريخ</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase text-left">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributionHistory.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{record.partnerName}</td>
                  <td className="px-8 py-5 font-black text-green-600">{FORMAT_CURRENCY(record.amount)}</td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-bold">{record.date}</td>
                  <td className="px-8 py-5 text-left font-black text-[10px] text-green-600">تم الخصم من المتبقي</td>
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
