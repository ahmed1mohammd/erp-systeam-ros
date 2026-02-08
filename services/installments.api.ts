
import api from './api';
import { Installment } from '../types';

export const installmentsApi = {
  getAll: () => api.get<Installment[]>('/installments'),
  getOverdue: () => api.get<Installment[]>('/installments/overdue'),
  getBySale: (saleId: string) => api.get<Installment[]>(`/installments/sale/${saleId}`),
};
