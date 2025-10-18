import { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';
import './TransactionForm.css';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

function TransactionForm({ categories, onSubmit, editingTransaction, onCancelEdit }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isPending: false
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        description: editingTransaction.description,
        date: editingTransaction.date,
        isPending: editingTransaction.isPending
      });
    }
  }, [editingTransaction]);

  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      isPending: formData.isPending
    });

    // Reset form
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isPending: false
    });
  };

  const handleCancel = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isPending: false
    });
    onCancelEdit?.();
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Type</label>
        <div className="type-selector">
          <button
            type="button"
            className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
          >
            Income
          </button>
          <button
            type="button"
            className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
          >
            Expense
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount *</label>
        <input
          type="number"
          id="amount"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
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
          {filteredCategories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.isPending}
            onChange={(e) => setFormData({ ...formData, isPending: e.target.checked })}
          />
          <span>Mark as pending (will be completed soon)</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
        </button>
        {editingTransaction && (
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TransactionForm;
