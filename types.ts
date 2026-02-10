
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  ACCOUNTANT = 'ACCOUNTANT'
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Customer {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  address: string;
  totalBalance: number;
  joinDate: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
}

export interface Installment {
  id: string;
  _id?: string;
  saleId: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface Sale {
  id?: string;
  _id?: string;
  customerId: any; 
  productId: any;  
  paymentMethod?: 'CASH' | 'INSTALLMENT';
  paymentType?: 'CASH' | 'INSTALLMENT';
  type?: 'CASH' | 'INSTALLMENT';
  totalAmount: number;
  downPayment?: number;
  paidAmount?: number;
  date: string;
  installments?: Installment[];
  installmentsCount?: number;
  customerName?: string;
  productName?: string;
}

export interface Transaction {
  id: string;
  _id?: string;
  type: 'INCOME' | 'EXPENSE' | 'WITHDRAWAL';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Partner {
  id: string;
  _id?: string;
  name: string;
  sharePercentage: number;
  currentBalance: number;
  totalWithdrawn: number;
}

export interface ProfitDistributionRecord {
  id: string;
  _id?: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  type: 'DISTRIBUTION' | 'WITHDRAWAL';
  date: string;
}

export interface DashboardStats {
  monthlySales: number;
  netProfit: number;
  expenses: number;
  safeBalance: number;
  salesGrowth: number;
  profitGrowth: number;
  expensesGrowth: number;
}

export interface SendReportResponse {
  message: string;
}
