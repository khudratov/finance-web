import { useState, useEffect } from 'react';
import { RecurringExpense, Category, Summary } from '../types';
import { recurringExpenseAPI, categoryAPI, transactionAPI } from '../services/api';
import { formatMoney } from '../utils/formatMoney';
import './Dashboard.css';

function Dashboard() {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<{ monthlyTotal: number; count: number }>({
    monthlyTotal: 0,
    count: 0
  });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    category: '',
    dayOfMonth: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes, summaryRes, monthlySummaryRes] = await Promise.all([
        recurringExpenseAPI.getAll(),
        categoryAPI.getAll(),
        transactionAPI.getSummary(),
        recurringExpenseAPI.getMonthlySummary()
      ]);

      setRecurringExpenses(expensesRes.data);
      setCategories(categoriesRes.data.filter(c => c.type === 'expense'));
      setSummary(summaryRes.data);
      setMonthlySummary(monthlySummaryRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense?: RecurringExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        dayOfMonth: expense.dayOfMonth.toString(),
        isActive: expense.isActive
      });
    } else {
      setEditingExpense(null);
      setFormData({
        name: '',
        amount: '',
        description: '',
        category: '',
        dayOfMonth: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.name || !formData.amount || !formData.category || !formData.dayOfMonth) {
        setError('Please fill in all required fields');
        return;
      }

      const data = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        dayOfMonth: parseInt(formData.dayOfMonth),
        isActive: formData.isActive
      };

      if (editingExpense) {
        await recurringExpenseAPI.update(editingExpense.id, data);
      } else {
        await recurringExpenseAPI.create(data);
      }

      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError('Failed to save recurring expense');
      console.error('Error saving recurring expense:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    try {
      await recurringExpenseAPI.delete(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete recurring expense');
      console.error('Error deleting recurring expense:', err);
    }
  };

  const handleToggleActive = async (expense: RecurringExpense) => {
    try {
      await recurringExpenseAPI.update(expense.id, { isActive: !expense.isActive });
      fetchData();
    } catch (err) {
      setError('Failed to update recurring expense');
      console.error('Error updating recurring expense:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>Finance Dashboard</h1>
          <p className="dashboard-subtitle">Manage your recurring monthly expenses</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="summary-cards">
        <div className="summary-card-item income-card">
          <div className="summary-card-header">
            <span>💰</span>
            <h3>Total Income</h3>
          </div>
          <div className="summary-card-amount">{formatMoney(summary?.totalIncome || 0)}</div>
        </div>

        <div className="summary-card-item expense-card">
          <div className="summary-card-header">
            <span>💸</span>
            <h3>Total Expenses</h3>
          </div>
          <div className="summary-card-amount">{formatMoney(summary?.totalExpense || 0)}</div>
        </div>

        <div className="summary-card-item balance-card">
          <div className="summary-card-header">
            <span>💵</span>
            <h3>Balance</h3>
          </div>
          <div className="summary-card-amount">{formatMoney(summary?.balance || 0)}</div>
        </div>
      </div>

      <div className="recurring-section">
        <div className="recurring-header">
          <div className="recurring-title-section">
            <h2>Recurring Monthly Expenses</h2>
            <p className="recurring-subtitle">
              Total Monthly: {formatMoney(monthlySummary.monthlyTotal)} ({monthlySummary.count} active)
            </p>
          </div>
          <button className="add-btn" onClick={() => handleOpenDialog()}>
            + Add Expense
          </button>
        </div>

        <div className="divider"></div>

        {recurringExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No recurring expenses yet</h3>
            <p>Add your first recurring expense to track monthly bills</p>
          </div>
        ) : (
          <div className="recurring-list">
            {recurringExpenses.map((expense) => (
              <div key={expense.id} className={`recurring-item ${!expense.isActive ? 'inactive' : ''}`}>
                <div className="recurring-details">
                  <div className="recurring-name-row">
                    <h3 className="recurring-name">{expense.name}</h3>
                    <span
                      className="category-chip"
                      style={{ backgroundColor: expense.categoryColor }}
                    >
                      {expense.category}
                    </span>
                    {!expense.isActive && (
                      <span className="inactive-chip">Inactive</span>
                    )}
                  </div>
                  <p className="recurring-description">
                    {expense.description || 'No description'}
                  </p>
                  <div className="recurring-info">
                    <span>Amount: <strong>{formatMoney(expense.amount)}</strong></span>
                    <span>Day: <strong>{expense.dayOfMonth}</strong> of each month</span>
                  </div>
                </div>

                <div className="recurring-actions">
                  <label className="toggle-label">
                    <span className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={expense.isActive}
                        onChange={() => handleToggleActive(expense)}
                      />
                      <span className="toggle-slider"></span>
                    </span>
                    Active
                  </label>

                  <div className="action-buttons">
                    <button
                      className="icon-btn edit-icon-btn"
                      onClick={() => handleOpenDialog(expense)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete-icon-btn"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {openDialog && (
        <div className="modal-overlay" onClick={handleCloseDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Amount *</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dayOfMonth">Day of Month (1-31) *</label>
                  <input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                    required
                  />
                  <p className="form-helper">The day of the month when this expense occurs</p>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseDialog}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingExpense ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
