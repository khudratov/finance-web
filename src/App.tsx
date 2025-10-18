import { useState, useEffect } from 'react';
import { Transaction, Category, Summary } from './types';
import { transactionAPI, categoryAPI } from './services/api';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCard from './components/SummaryCard';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, categoriesRes, summaryRes] = await Promise.all([
        transactionAPI.getAll(),
        categoryAPI.getAll(),
        transactionAPI.getSummary()
      ]);

      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, data);
        setEditingTransaction(null);
      } else {
        await transactionAPI.create(data);
      }
      fetchData();
    } catch (error) {
      console.error('Error adding/updating transaction:', error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleCompleteTransaction = async (id: string) => {
    try {
      await transactionAPI.update(id, { isPending: false });
      fetchData();
    } catch (error) {
      console.error('Error completing transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Finance Tracker</h1>
      </header>

      <main className="main">
        <SummaryCard summary={summary} />

        <div className="content">
          <div className="form-section">
            <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <TransactionForm
              categories={categories}
              onSubmit={handleAddTransaction}
              editingTransaction={editingTransaction}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          <div className="list-section">
            <h2>Recent Transactions</h2>
            <TransactionList
              transactions={transactions}
              categories={categories}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onComplete={handleCompleteTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
