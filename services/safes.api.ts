

import api from './api';
import { Transaction } from '../types';

export const safesApi = {
  getSafe: () => api.get<{ balance: number, transactions: Transaction[] }>('/safe'),
  deposit: (data: { amount: number, description: string, category: string }) => 
    api.post('/safe/deposit', data),
  withdraw: (data: { amount: number, description: string, category: string }) => 
    api.post('/safe/withdraw', data),
  // Added addTransaction to handle generic manual entries from the UI
  addTransaction: (data: { 
    type: 'INCOME' | 'EXPENSE' | 'WITHDRAWAL'; 
    amount: number; 
    category: string; 
    description: string; 
    date: string 
  }) => api.post<Transaction>('/safe/transaction', data),
};