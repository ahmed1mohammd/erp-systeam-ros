
export enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  CASHIER = 'CASHIER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalBalance: number;
  joinDate: string;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
}

export interface Installment {
  id: string;
  saleId: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface Sale {
  id: string;
  customerId: string;
  productId: string;
  type: 'CASH' | 'INSTALLMENT';
  totalAmount: number;
  downPayment: number;
  date: string;
  installmentsCount: number;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'WITHDRAWAL';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Partner {
  id: string;
  name: string;
  sharePercentage: number;
  paidAmount: number;
}

export interface ProfitDistributionRecord {
  id: string;
  partnerName: string;
  amount: number;
  date: string;
}
