import { useState, useEffect, useRef } from 'react';
import { Transaction, Category, Summary } from './types';
import { transactionAPI, categoryAPI, dataAPI } from './services/api';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCard from './components/SummaryCard';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportData = async () => {
    try {
      const response = await dataAPI.exportData();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      if (!data.transactions || !data.categories) {
        alert('Invalid data format');
        return;
      }

      const replaceExisting = confirm(
        'Do you want to replace all existing data?\n\nClick OK to replace everything, or Cancel to merge with existing data.'
      );

      await dataAPI.importData({
        transactions: data.transactions,
        categories: data.categories,
        replaceExisting
      });

      fetchData();
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading && currentView === 'transactions') {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      <div className="app-content">
        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <div className="app">
            <header className="header">
              <h1>💰 Finance Tracker</h1>
              <div className="header-actions">
                <button onClick={handleExportData} className="btn btn-export">
                  Export Data
                </button>
                <button onClick={handleImportData} className="btn btn-import">
                  Import Data
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
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
        )}
      </div>
    </div>
  );
}

export default App;
