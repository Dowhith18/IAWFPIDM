import React from 'react';
import styles from './UniversalTabNavigation.module.css';

/**
 * UniversalTabNavigation Component
 * 
 * Renders the tab navigation for UniversalModuleDiagnostic (Page 6).
 * Tabs: DTC Analysis, ECU Identification, Live Data, Actuator Tests, Diagnostic Routines.
 * Each tab unlocks progressively based on ModuleContext state.
 *
 * Props:
 * - activeTab: string - currently selected tab ID
 * - onTabSelect: (tabId: string) => void - handler for tab click
 * - unlockedTabs: { [tabId: string]: boolean } - which tabs are enabled
 */
const UniversalTabNavigation = ({ activeTab, onTabSelect, unlockedTabs }) => {
  const tabs = [
    { id: 'DTC', label: 'DTC Analysis' },
    { id: 'ECU_ID', label: 'ECU Identification' },
    { id: 'LIVE_DATA', label: 'Live Data' },
    { id: 'ACTUATORS', label: 'Actuator Tests' },
    { id: 'ROUTINES', label: 'Diagnostic Routines' },
  ];

  return (
    <div className={styles.tabContainer}>
      {tabs.map(tab => {
        const isUnlocked = unlockedTabs[tab.id];
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`
              ${styles.tabButton}
              ${isActive ? styles.active : ''}
              ${!isUnlocked ? styles.locked : ''}
            `}
            onClick={() => isUnlocked && onTabSelect(tab.id)}
            disabled={!isUnlocked}
            aria-label={tab.label}
          >
            {tab.label}
            {!isUnlocked && <span className={styles.lockIcon}>🔒</span>}
          </button>
        );
      })}
    </div>
  );
};

export default UniversalTabNavigation;
