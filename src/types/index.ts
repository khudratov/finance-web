export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  isPending: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalPending: number;
  balanceWithPending: number;
}
