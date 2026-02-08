
import api from './api';
import { Transaction } from '../types';

export const safesApi = {
  getTransactions: () => api.get<Transaction[]>('/safe/transactions'),
  getBalance: () => api.get<{ balance: number }>('/safe/balance'),
  addTransaction: (data: Partial<Transaction>) => api.post<Transaction>('/safe/transactions', data),
};
