const StatCard = ({ icon, label, value, change, type = 'cyan', changeType = 'up' }) => {
  return (
    <div className={`stat-card`} data-accent={type}>
      <div className={`sc-icon ${type}`}>{icon}</div>
      <div className="sc-label">{label}</div>
      <div className="sc-value">{value}</div>
      <div className={`sc-change ${changeType}`}>{change}</div>
    </div>
  );
};

export default StatCard;