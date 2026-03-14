const Panel = ({ title, meta, action, children }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">{title}</div>
        {meta && <div className="panel-meta">{meta}</div>}
        {action && action}
      </div>
      <div className="panel-body">
        {children}
      </div>
    </div>
  );
};

export default Panel;