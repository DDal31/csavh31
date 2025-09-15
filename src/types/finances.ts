export type TransactionType = 'income' | 'expense';

export interface FinancialTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  document_path?: string;
  document_name?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface TransactionFormData {
  title: string;
  amount: number;
  type: TransactionType;
  description?: string;
  document?: File;
}