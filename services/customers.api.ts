
import api from './api';
import { Customer } from '../types';

export const customersApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};
