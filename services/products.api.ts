
import api from './api';
import { Product } from '../types';

export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  adjustStock: (id: string, amount: number) => api.patch(`/products/${id}/stock`, { amount }),
  // Added delete method to fix the error in pages/Products.tsx line 71 where productsApi.delete is called
  delete: (id: string) => api.delete(`/products/${id}`),
};
