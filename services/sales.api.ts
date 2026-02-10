
import api from './api';
import { Sale } from '../types';

export const salesApi = {
  getAll: () => api.get<Sale[]>('/sales'),
  create: (data: {
    customerId: string;
    productId: string;
    paymentMethod: 'CASH' | 'INSTALLMENT';
    downPayment: number;
    installments?: { amount: number; dueDate: string }[];
  }) => api.post<Sale>('/sales', data),
};
