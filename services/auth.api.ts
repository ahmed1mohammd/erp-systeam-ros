
import api from './api';
import { User } from '../types';

export const authApi = {
  login: (credentials: { email: string; password?: string }) => 
    api.post<{user: User, token: string}>('/auth/login', credentials),
  
  createUser: (data: any) => 
    api.post('/auth/create-user', data),
  
  getAllUsers: () => 
    api.get<User[]>('/auth/users'),
  
  deleteUser: (id: string) => 
    api.delete(`/auth/users/${id}`),
    
  logout: () => api.post('/auth/logout'),
};
