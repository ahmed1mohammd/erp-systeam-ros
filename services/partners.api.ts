
import api from './api';
import { Partner, ProfitDistributionRecord } from '../types';

export const partnersApi = {
  getAll: () => api.get<Partner[]>('/partners'),
  getHistory: () => api.get<ProfitDistributionRecord[]>('/profits/history'),
  distribute: (partnerId: string, amount: number) => 
    api.post('/profits/distribute', { partnerId, amount }),
};
