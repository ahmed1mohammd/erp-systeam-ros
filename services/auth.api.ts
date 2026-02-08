
import api from './api';
import { User, UserRole } from '../types';

export const authApi = {
  login: (email: string, role: UserRole) => api.post<{user: User, token: string}>('/auth/login', { email, role }),
  logout: () => api.post('/auth/logout'),
};
