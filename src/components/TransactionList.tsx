import { Transaction, Category } from '../types';
import { formatMoney } from '../utils/formatMoney';
import './TransactionList.css';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

function TransactionList({ transactions, categories, onEdit, onDelete, onComplete }: TransactionListProps) {
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate daily expense total for each date
  const getDailyExpenseTotal = (dateTransactions: Transaction[]) => {
    return dateTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions yet. Add your first transaction!</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {sortedDates.map(date => {
        const dateTransactions = groupedTransactions[date];
        const dailyExpense = getDailyExpenseTotal(dateTransactions);

        return (
          <div key={date} className="date-group">
            <div className="date-header">
              <h3 className="date-title">{formatDate(date)}</h3>
              {dailyExpense > 0 && (
                <span className="date-total-expense">
                  Total Expense: {formatMoney(dailyExpense)}
                </span>
              )}
            </div>
            {dateTransactions.map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.type} ${transaction.isPending ? 'pending' : ''}`}>
                <div
                  className="transaction-category-indicator"
                  style={{ backgroundColor: getCategoryColor(transaction.category) }}
                />
                {transaction.isPending && (
                  <div className="pending-badge">Pending</div>
                )}

                <div className="transaction-details">
                  <div className="transaction-header">
                    <span className="transaction-category">{transaction.category}</span>
                    <span className="transaction-date">
                {new Date(transaction.date).toLocaleDateString()}
              </span>
                  </div>
                  {transaction.description && (
                    <p className="transaction-description">{transaction.description}</p>
                  )}
                </div>

                <div className="transaction-amount-section">
            <span className={`transaction-amount ${transaction.type}`}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatMoney(transaction.amount)}
            </span>
                  <div className="transaction-actions">
                    {transaction.isPending && (
                      <button
                        className="complete-btn"
                        onClick={() => onComplete(transaction.id)}
                        title="Mark as completed"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(transaction)}
                      title="Edit transaction"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this transaction?')) {
                          onDelete(transaction.id);
                        }
                      }}
                      title="Delete transaction"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default TransactionList;
