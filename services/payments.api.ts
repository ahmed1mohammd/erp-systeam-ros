
import api from './api';

export const paymentsApi = {
  payInstallment: (installmentId: string, amount: number) => 
    api.post(`/payments/${installmentId}`, { amount }),
};
