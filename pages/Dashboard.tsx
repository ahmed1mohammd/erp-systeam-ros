
import React from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CalendarDays, ShoppingBag, PieChart as PieChartIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { dashboardStats, safeBalance, theme } = useApp();
  
  if (!dashboardStats) return (
    <div className="flex flex-col items-center justify-center h-96 text-brand-secondary gap-4">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black">جاري مزامنة بيانات النظام السحابي...</p>
    </div>
  );

  const chartData = [
    { name: 'يناير', sales: dashboardStats.monthlySales * 0.8, profit: dashboardStats.netProfit * 0.8 },
    { name: 'فبراير', sales: dashboardStats.monthlySales * 0.9, profit: dashboardStats.netProfit * 0.85 },
    { name: 'مارس', sales: dashboardStats.monthlySales, profit: dashboardStats.netProfit },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="flex items-center gap-3 bg-brand-primary/10 px-4 py-3 rounded-2xl w-fit border border-brand-primary/20">
        <CalendarDays size={20} className="text-brand-primary" />
        <span className="text-brand-primary font-black text-sm sm:text-base">نظرة عامة على الأداء</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        <StatCard 
          title="رصيد الخزنة الحالي" 
          value={FORMAT_CURRENCY(safeBalance)} 
          icon={<Wallet size={24}/>} 
          trend="Real-time" 
          trendType="up" 
          color="main" 
        />
        <StatCard 
          title="مبيعات الشهر" 
          value={FORMAT_CURRENCY(dashboardStats.monthlySales)} 
          icon={<ShoppingBag size={24}/>} 
          trend={`${dashboardStats.salesGrowth}%`} 
          trendType={dashboardStats.salesGrowth >= 0 ? 'up' : 'down'} 
          color="second" 
        />
        <StatCard 
          title="صافي الأرباح" 
          value={FORMAT_CURRENCY(dashboardStats.netProfit)} 
          icon={<TrendingUp size={24}/>} 
          trend={`${dashboardStats.profitGrowth}%`} 
          trendType={dashboardStats.profitGrowth >= 0 ? 'up' : 'down'} 
          color="main" 
        />
        <StatCard 
          title="مصروفات التشغيل" 
          value={FORMAT_CURRENCY(dashboardStats.expenses)} 
          icon={<TrendingDown size={24}/>} 
          trend={`${dashboardStats.expensesGrowth}%`} 
          trendType={dashboardStats.expensesGrowth >= 0 ? 'down' : 'up'} 
          color="four" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 shadow-sm min-w-0 overflow-hidden">
          <h3 className="text-lg sm:text-xl font-black text-brand-primary mb-8">نمو الإيرادات والأرباح</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.primary} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} />
                <YAxis orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} />
                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', textAlign: 'right'}} />
                <Area type="monotone" dataKey="sales" stroke={theme.primary} fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke={theme.secondary} fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 shadow-sm min-w-0 flex flex-col justify-center items-center text-center space-y-6">
           <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary">
              <PieChartIcon size={40} />
           </div>
           <div>
              <h4 className="text-xl font-black text-brand-primary">توزيع الموارد</h4>
              <p className="text-brand-secondary font-bold text-sm mt-2">نظام ROS TECH يقوم بتحليل بياناتك لحظياً لتقديم أدق التقارير المالية والضريبية.</p>
           </div>
           <div className="w-full pt-6 space-y-3">
              <div className="flex justify-between text-xs font-black uppercase">
                 <span className="text-slate-400">كفاءة الأرباح</span>
                 <span className="text-brand-primary">84%</span>
              </div>
              <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
                 <div className="h-full bg-brand-primary w-[84%]"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend: string, trendType: 'up' | 'down', color: 'main' | 'second' | 'four' }> = ({ title, value, icon, trend, trendType, color }) => {
  const colorMap = {
    main: 'bg-brand-primary/10 text-brand-primary',
    second: 'bg-brand-secondary/10 text-brand-secondary',
    four: 'bg-brand-accent/20 text-brand-primary',
  };
  return (
    <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-accent/30 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 text-right group">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${colorMap[color]} transition-colors group-hover:bg-brand-primary group-hover:text-white`}>{icon}</div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${trendType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-black text-brand-secondary mb-1 uppercase tracking-wider">{title}</p>
        <p className="text-lg sm:text-2xl font-black text-brand-primary truncate">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
