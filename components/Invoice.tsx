
import React from 'react';
import { SYSTEM_NAME, LOGO_URL, FORMAT_CURRENCY } from '../constants';

interface InvoiceProps {
  id: string;
  date: string;
  customerName: string;
  productName: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
}

const Invoice: React.FC<InvoiceProps> = ({ 
  id, date, customerName, productName, totalAmount, paidAmount, paymentMethod 
}) => {
  const remaining = totalAmount - paidAmount;

  return (
    <div className="bg-white p-0 w-full mx-auto font-['Tajawal'] text-[#16423C] relative overflow-hidden flex flex-col h-full sm:h-auto">
      
      {/* Dynamic Header Section - Responsive */}
      <div className="relative z-10 bg-brand-primary p-6 sm:p-12 flex flex-col sm:flex-row justify-between items-center text-white sm:rounded-t-[2.5rem] gap-6 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-right">
          <div className="p-3 bg-white rounded-2xl shadow-xl w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <img src={LOGO_URL} alt={SYSTEM_NAME} className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none mb-1">{SYSTEM_NAME}</h1>
            <p className="text-brand-accent font-bold text-[10px] sm:text-xs uppercase tracking-widest opacity-80">سند مالي معتمد</p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
          <div className="bg-white/10 px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-xl mb-1 sm:mb-2 backdrop-blur-md border border-white/10 w-full sm:w-auto text-center">
             رقم السند: #{id}
          </div>
          <p className="font-bold text-brand-accent text-[10px] sm:text-sm">تاريخ المعاملة: {date}</p>
        </div>
      </div>

      {/* Main Content Area - Padding adjustments */}
      <div className="p-5 sm:p-12 space-y-6 sm:space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-12">
          <div className="p-5 sm:p-8 bg-brand-bg/50 rounded-2xl sm:rounded-[2rem] border border-brand-accent/30">
            <h3 className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2 sm:mb-4">إلى السيد/ة</h3>
            <p className="text-lg sm:text-3xl font-black text-brand-primary truncate">{customerName}</p>
            <div className="h-1 w-12 sm:w-20 bg-brand-secondary mt-2 sm:mt-4 rounded-full"></div>
          </div>
          <div className="p-5 sm:p-8 bg-brand-bg/50 rounded-2xl sm:rounded-[2rem] border border-brand-accent/30 flex flex-col sm:items-end justify-center">
            <h3 className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2 sm:mb-4">طريقة التحصيل</h3>
            <span className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-sm sm:text-lg w-fit ${paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {paymentMethod === 'CASH' ? 'دفع نقدي (كاش)' : 'سداد بالأقساط'}
            </span>
          </div>
        </div>

        {/* Item Details - Compact Table on Mobile */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-brand-bg overflow-hidden shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead className="bg-brand-bg/80 text-brand-primary hidden sm:table-header-group">
              <tr>
                <th className="px-10 py-5 font-black text-xs uppercase tracking-widest">بيان السلعة / الخدمة</th>
                <th className="px-10 py-5 font-black text-xs uppercase tracking-widest text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 sm:px-10 py-5 sm:py-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black text-sm sm:text-base shrink-0">
                      {productName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-black text-brand-primary leading-tight">{productName}</p>
                      <span className="sm:hidden text-[10px] font-bold text-brand-secondary">القيمة الإجمالية</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 sm:px-10 py-5 sm:py-8 text-left">
                  <p className="text-lg sm:text-2xl font-black text-brand-primary">{FORMAT_CURRENCY(totalAmount)}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary - Stacked on Mobile */}
        <div className="flex justify-end pt-2 sm:pt-6">
          <div className="w-full sm:max-w-sm space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center py-3 sm:py-4 border-b border-brand-bg">
              <span className="text-brand-secondary text-sm font-bold">المدفوع سلفاً:</span>
              <span className="text-base sm:text-xl font-black text-green-600">{FORMAT_CURRENCY(paidAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-4 sm:py-6 bg-brand-primary text-white px-6 sm:px-8 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-brand-primary/20">
              <span className="text-sm sm:text-lg font-bold">المتبقي المطلوب:</span>
              <span className="text-2xl sm:text-4xl font-black">{FORMAT_CURRENCY(remaining)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding - Adjusted for digital view */}
      <div className="mt-auto p-6 sm:p-10 bg-brand-bg/30 text-center border-t border-brand-accent/20">
        <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-2">تم إنشاء هذا السند عبر نظام ROS TECH السحابي</p>
        <div className="flex justify-center items-center gap-3 text-[9px] font-black text-brand-primary/50">
           <span className="flex items-center gap-1">CERTIFIED TRANSACTION</span>
           <div className="w-1 h-1 rounded-full bg-brand-secondary"></div>
           <span>CONFIDENTIAL</span>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
