
import { useApp } from '../context/AppContext';

export const usePrintInvoice = () => {
  const { triggerPrint, customers, products } = useApp();

  const printInvoice = (salePayload: any) => {
    // إثراء البيانات إذا كانت ناقصة (مثل جلب اسم العميل من الـ Context)
    const enrichedPayload = {
      ...salePayload,
      customerName: salePayload.customerName || customers.find(c => c.id === salePayload.customerId)?.name || 'عميل مجهول',
      productName: salePayload.productName || products.find(p => p.id === salePayload.productId)?.name || 'منتج مجهول',
    };
    triggerPrint('INVOICE', enrichedPayload);
  };

  const printReport = (reportPayload: any) => {
    triggerPrint('REPORT', reportPayload);
  };

  const printReceipt = (transactionPayload: any) => {
    // تحويل حركات الخزنة إلى شكل فاتورة مبسطة للطباعة
    const payload = {
      id: transactionPayload.id,
      date: transactionPayload.date,
      customerName: transactionPayload.description,
      productName: `سند مالي: ${transactionPayload.category}`,
      totalAmount: transactionPayload.amount,
      downPayment: transactionPayload.amount,
      type: transactionPayload.type === 'INCOME' ? 'CASH' : 'EXPENSE'
    };
    triggerPrint('INVOICE', payload);
  };

  return { printInvoice, printReport, printReceipt };
};
