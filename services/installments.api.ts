
import api from './api';
import { Installment } from '../types';

export const installmentsApi = {
  getAll: () => api.get<Installment[]>('/installments'),
  pay: (id: string) => api.post(`/installments/pay/${id}`),
};
