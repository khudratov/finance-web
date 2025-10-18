import { Summary } from '../types';
import { formatMoney } from '../utils/formatMoney';
import './SummaryCard.css';

interface SummaryCardProps {
  summary: Summary;
}

function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <div className="summary-item income">
        <div className="summary-icon">↑</div>
        <div className="summary-details">
          <p className="summary-label">Total Income</p>
          <p className="summary-amount">{formatMoney(summary.totalIncome)}</p>
        </div>
      </div>

      <div className="summary-item expense">
        <div className="summary-icon">↓</div>
        <div className="summary-details">
          <p className="summary-label">Total Expense</p>
          <p className="summary-amount">{formatMoney(summary.totalExpense)}</p>
        </div>
      </div>

      <div className="summary-item balance">
        <div className="summary-icon">=</div>
        <div className="summary-details">
          <p className="summary-label">Balance</p>
          <p className="summary-amount">{formatMoney(summary.balance)}</p>
        </div>
      </div>

      <div className="summary-item pending">
        <div className="summary-icon">⏱</div>
        <div className="summary-details">
          <p className="summary-label">Pending</p>
          <p className="summary-amount">{formatMoney(summary.totalPending)}</p>
        </div>
      </div>

      <div className="summary-item total">
        <div className="summary-icon">💰</div>
        <div className="summary-details">
          <p className="summary-label">Balance + Pending</p>
          <p className="summary-amount">{formatMoney(summary.balanceWithPending)}</p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
