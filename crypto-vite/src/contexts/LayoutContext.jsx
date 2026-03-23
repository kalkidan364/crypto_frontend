import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Keep expanded by default
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleRightPanel = () => {
    setRightPanelVisible(!rightPanelVisible);
  };

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    rightPanelVisible,
    setRightPanelVisible,
    toggleRightPanel
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;