
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  Wallet, 
  PieChart,
  FileBarChart,
  Settings
} from 'lucide-react';

export const SYSTEM_NAME = "ROS TECH";
export const LOGO_URL = "https://ro-s.net/img/logo.png";

export const NAV_ITEMS = [
  { label: 'لوحة التحكم', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'CASHIER'] },
  { label: 'العملاء', path: '/customers', icon: <Users size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'CASHIER'] },
  { label: 'المنتجات', path: '/products', icon: <Package size={20} />, roles: ['ADMIN', 'ACCOUNTANT'] },
  { label: 'المبيعات', path: '/sales', icon: <ShoppingBag size={20} />, roles: ['ADMIN', 'CASHIER'] },
  { label: 'التحصيل', path: '/payments', icon: <CreditCard size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'CASHIER'] },
  { label: 'الخزنة', path: '/safe', icon: <Wallet size={20} />, roles: ['ADMIN', 'ACCOUNTANT'] },
  { label: 'توزيع الأرباح', path: '/profit', icon: <PieChart size={20} />, roles: ['ADMIN'] },
  { label: 'التقارير الشهرية', path: '/reports', icon: <FileBarChart size={20} />, roles: ['ADMIN', 'ACCOUNTANT'] },
  { label: 'الإعدادات', path: '/settings', icon: <Settings size={20} />, roles: ['ADMIN'] },
];

export const FORMAT_CURRENCY = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};
