import './Sidebar.css';

interface SidebarProps {
  currentView: 'dashboard' | 'transactions';
  onNavigate: (view: 'dashboard' | 'transactions') => void;
}

function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">💰 Finance</h2>
        <p className="sidebar-subtitle">Tracker</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Finance Dashboard</span>
        </button>

        <button
          className={`nav-item ${currentView === 'transactions' ? 'active' : ''}`}
          onClick={() => onNavigate('transactions')}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">Transactions</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">
          <p className="footer-version">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
