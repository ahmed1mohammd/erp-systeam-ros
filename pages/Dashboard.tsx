
import React from 'react';
import { useApp } from '../context/AppContext';
import { FORMAT_CURRENCY } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { transactions, theme } = useApp();
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  
  const totalSafeBalance = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0) - 
                          transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  const chartData = [
    { name: 'أسبوع 1', income: monthlyIncome * 0.2, expense: monthlyExpense * 0.15 },
    { name: 'أسبوع 2', income: monthlyIncome * 0.3, expense: monthlyExpense * 0.25 },
    { name: 'أسبوع 3', income: monthlyIncome * 0.25, expense: monthlyExpense * 0.3 },
    { name: 'أسبوع 4', income: monthlyIncome * 0.25, expense: monthlyExpense * 0.3 },
  ];

  const pieData = [
    { name: 'مبيعات كاش', value: 60 },
    { name: 'أقساط محصلة', value: 30 },
    { name: 'أخرى', value: 10 },
  ];
  
  const COLORS = [theme.primary, theme.secondary, theme.accent];

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center gap-3 bg-brand-primary/10 px-4 py-3 rounded-2xl w-fit border border-brand-primary/20">
        <CalendarDays size={20} className="text-brand-primary" />
        <span className="text-brand-primary font-black text-sm sm:text-base">ملخص شهر {currentMonth} / {currentYear}</span>
      </div>

      {/* Stats Grid - Responsive Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        <StatCard title="رصيد الخزنة" value={FORMAT_CURRENCY(totalSafeBalance)} icon={<Wallet size={24}/>} trend="إجمالي" trendType="up" color="main" />
        <StatCard title="إيرادات الشهر" value={FORMAT_CURRENCY(monthlyIncome)} icon={<TrendingUp size={24}/>} trend="+12%" trendType="up" color="second" />
        <StatCard title="المصروفات" value={FORMAT_CURRENCY(monthlyExpense)} icon={<TrendingDown size={24}/>} trend="-5%" trendType="down" color="four" />
        <StatCard title="صافي الأرباح" value={FORMAT_CURRENCY(monthlyIncome - monthlyExpense)} icon={<TrendingUp size={24}/>} trend="+8%" trendType="up" color="main" />
      </div>

      {/* Charts Section - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 shadow-sm min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg sm:text-xl font-black text-brand-primary">حركة التدفق المالي</h3>
          </div>
          <div className="h-[250px] sm:h-[350px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.primary} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} />
                <YAxis orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', textAlign: 'right'}}
                />
                <Area type="monotone" dataKey="income" stroke={theme.primary} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-accent/30 shadow-sm min-w-0">
          <h3 className="text-lg sm:text-xl font-black text-brand-primary mb-8">تحليل المبيعات</h3>
          <div className="h-[200px] sm:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 sm:space-y-4 mt-6">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                  <span className="text-brand-secondary font-bold">{item.name}</span>
                </div>
                <span className="font-black text-brand-primary">{item.value}%</span>
              </div>
            ))}
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
