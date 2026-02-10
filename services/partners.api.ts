
import api from './api';
import { Partner, ProfitDistributionRecord } from '../types';

export const partnersApi = {
  getAll: () => api.get<Partner[]>('/partners'),
  distribute: (amount: number) => 
    api.post('/partners/distribute', { amount }),
  withdraw: (partnerId: string, amount: number) => 
    api.post('/partners/withdraw', { partnerId, amount }),
  getHistory: () => api.get<ProfitDistributionRecord[]>('/partners/history'),
};
