
import React from 'react';
import { SYSTEM_NAME, LOGO_URL, FORMAT_CURRENCY } from '../constants';

interface ReportProps {
  type: string;
  month: number;
  year: number;
  data: any[];
  summary: {
    label: string;
    value: number;
    color?: string;
  }[];
}

const MonthlyReportTemplate: React.FC<ReportProps> = ({ type, month, year, data, summary }) => {
  return (
    <div className="bg-white p-10 max-w-[1000px] mx-auto font-['Tajawal'] text-[#16423C] min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-[#16423C] pb-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-[#16423C] rounded-2xl shadow-xl">
             <img src={LOGO_URL} alt={SYSTEM_NAME} className="h-16 w-16 object-contain brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-4xl font-[900] tracking-tighter text-[#16423C] uppercase">{SYSTEM_NAME}</h1>
            <p className="text-[#6A9C89] font-bold">نظام التقارير المالية والإدارية</p>
          </div>
        </div>
        <div className="text-left">
           <div className="bg-[#16423C] text-white px-8 py-3 rounded-bl-3xl font-black text-xl mb-2">
              تقرير {type}
           </div>
           <p className="font-black text-slate-500">الفترة: {month} / {year}</p>
           <p className="text-xs font-bold text-[#6A9C89]">تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {summary.map((item, idx) => (
          <div key={idx} className="bg-[#E9EFEC]/30 p-6 rounded-3xl border border-[#C4DAD2]/30 text-center">
             <p className="text-[10px] font-black text-[#6A9C89] uppercase tracking-widest mb-2">{item.label}</p>
             <p className={`text-xl font-black ${item.color || 'text-[#16423C]'}`}>{FORMAT_CURRENCY(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="flex-1">
        <table className="w-full text-right border-collapse rounded-2xl overflow-hidden border border-[#C4DAD2]/30">
          <thead className="bg-[#16423C] text-white">
            <tr>
              <th className="p-4 font-black text-sm">#</th>
              <th className="p-4 font-black text-sm">التفاصيل</th>
              <th className="p-4 font-black text-sm text-center">التاريخ</th>
              <th className="p-4 font-black text-sm text-left">القيمة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C4DAD2]/20">
            {data.map((item, idx) => (
              <tr key={idx} className="even:bg-slate-50">
                <td className="p-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                <td className="p-4 font-black text-[#16423C]">
                   <p>{item.description || item.productName || item.customerName || item.partnerName}</p>
                   {item.category && <span className="text-[10px] text-[#6A9C89]">{item.category}</span>}
                </td>
                <td className="p-4 text-center font-bold text-slate-500">{item.date || item.dueDate}</td>
                <td className="p-4 text-left font-black text-[#16423C]">{FORMAT_CURRENCY(item.amount || item.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Stamps */}
      <div className="mt-20 border-t-2 border-[#E9EFEC] pt-10 flex justify-between items-end">
         <div className="space-y-4">
            <p className="text-xs font-black text-[#6A9C89]">اعتماد المراجعة المالية</p>
            <div className="w-48 h-20 border-2 border-dashed border-[#C4DAD2] rounded-2xl flex items-center justify-center text-slate-200">
               <span className="text-[10px] font-bold">ختم المراجعة</span>
            </div>
         </div>
         <div className="text-left space-y-1">
            <p className="text-xs font-bold text-slate-400">نظام ROS TECH السحابي</p>
            <p className="text-[10px] font-black text-[#16423C]">صفحة 1 من 1</p>
         </div>
         <div className="space-y-4 text-left">
            <p className="text-xs font-black text-[#6A9C89]">توقيع مدير النظام</p>
            <div className="w-48 h-20 border-2 border-dashed border-[#C4DAD2] rounded-2xl flex items-center justify-center text-slate-200">
               <span className="text-[10px] font-bold">توقيع المعتمد</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MonthlyReportTemplate;
