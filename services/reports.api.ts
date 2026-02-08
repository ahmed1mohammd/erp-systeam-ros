
import api from './api';

export const reportsApi = {
  getMonthly: (month: number, year: number) => 
    api.get('/reports/monthly', { params: { month, year } }),
  getDashboardStats: () => api.get('/reports/dashboard'),
};
