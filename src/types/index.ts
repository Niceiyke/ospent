export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  category_name?: string;
  category_color?: string;
  description: string;
  paymentMethod?: string;
  status?: 'cleared' | 'pending';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budgetLimit: number;
  budgetInterval: 'weekly' | 'monthly' | 'yearly';
  type: TransactionType;
  isCapital?: boolean;
  isRecurring?: boolean;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  surplus: number;
}
