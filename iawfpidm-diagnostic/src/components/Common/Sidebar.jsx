import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

/**
 * Sidebar Component
 *
 * Branded sidebar navigation for IAWPIDM system.
 * Responsive, collapsible sidebar with active link highlighting.
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/diagnostics', label: 'Diagnostics', icon: '🛠️' },
    { path: '/dtc', label: 'DTC Analysis', icon: '⚠️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        <span className={styles.logo}>IAWPIDM</span>
        <button
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
