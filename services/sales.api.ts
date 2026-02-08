
import api from './api';
import { Sale, Installment } from '../types';

export const salesApi = {
  // جلب كافة المبيعات
  getAll: () => api.get<Sale[]>('/sales'),
  
  // جلب فاتورة محددة
  getById: (id: string) => api.get<Sale>(`/sales/${id}`),
  
  // إنشاء عملية بيع جديدة
  create: (data: Partial<Sale>) => api.post<Sale>('/sales', data),
  
  // جلب كافة الأقساط المرتبطة بالمبيعات
  getAllInstallments: () => api.get<Installment[]>('/installments'),
  
  // تحصيل قسط معين
  payInstallment: (id: string, amount: number) => 
    api.post(`/payments/${id}`, { amount, date: new Date().toISOString().split('T')[0] }),
};
