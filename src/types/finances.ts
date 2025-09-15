export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 'competition' | 'minibus' | 'materiel' | 'organisation_championnat' | 'licence_affiliation';

export type IncomeCategory = 'dons' | 'location_minibus' | 'remboursement_joueur' | 'buvette' | 'unadev' | 'inscription_championnat' | 'subvention';

export interface FinancialTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  expense_category?: ExpenseCategory;
  income_category?: IncomeCategory;
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
  expense_category?: ExpenseCategory;
  income_category?: IncomeCategory;
  description?: string;
  document?: File;
}

// Translation objects for categories
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  'competition': { label: 'Compétition', icon: 'Trophy', color: 'bg-red-500' },
  'minibus': { label: 'Minibus', icon: 'Bus', color: 'bg-amber-500' },
  'materiel': { label: 'Matériel', icon: 'Package', color: 'bg-slate-500' },
  'organisation_championnat': { label: 'Organisation Championnat', icon: 'Calendar', color: 'bg-rose-500' },
  'licence_affiliation': { label: 'Licence et Affiliation', icon: 'FileCheck', color: 'bg-violet-500' }
};

export const INCOME_CATEGORIES: Record<IncomeCategory, { label: string; icon: string; color: string }> = {
  'dons': { label: 'Dons', icon: 'Heart', color: 'bg-emerald-500' },
  'location_minibus': { label: 'Location Minibus', icon: 'Bus', color: 'bg-blue-500' },
  'remboursement_joueur': { label: 'Remboursement Joueur', icon: 'CreditCard', color: 'bg-indigo-500' },
  'buvette': { label: 'Buvette', icon: 'Coffee', color: 'bg-orange-500' },
  'unadev': { label: 'UNADEV', icon: 'Building', color: 'bg-purple-500' },
  'inscription_championnat': { label: 'Inscription Championnat', icon: 'FileText', color: 'bg-cyan-500' },
  'subvention': { label: 'Subvention', icon: 'Award', color: 'bg-green-600' }
};