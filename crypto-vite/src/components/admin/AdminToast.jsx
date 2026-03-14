const AdminToast = ({ toasts, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-message">{toast.message}</div>
          <button 
            className="toast-close" 
            onClick={() => onRemove(toast.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminToast;