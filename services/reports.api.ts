
import api from './api';
import { DashboardStats, SendReportResponse } from '../types';

export const reportsApi = {
  getDashboard: () => api.get<DashboardStats>('/reports/dashboard'),
  sendEmail: (email: string, month: number, year: number) => 
    api.post<SendReportResponse>('/reports/send-email', { email, month, year }),
};
