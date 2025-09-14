import React, { useState, useEffect } from 'react';
import './App.css';

import LoginPage from './components/Auth/LoginPage';
import MainApplication from './components/Main/MainApplication';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import { DiagnosticProvider } from './contexts/DiagnosticContext';
import { ModuleProvider } from './contexts/ModuleContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Simulate app initialization (can be replaced with real async init logic)
  useEffect(() => {
    const initApp = async () => {
      console.log('🚀 Initializing IAWFPIDM System...');
      // Simulate delay for load (e.g., fetching config, checks)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('✅ Initialization Complete');
      setIsLoading(false);
    };
    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        {/* Show loading screen while initializing */}
        <div className="loading-spinner"></div>
        <h2 className="loading-text">Loading IAWFPIDM System...</h2>
      </div>
    );
  }

  return (
    <AuthProvider>
      <VehicleProvider>
        <DiagnosticProvider>
          <div className="app-wrapper">
            {!isAuthenticated ? (
              // Show login page if not authenticated
              <LoginPage appName="IAWFPIDM" />
            ) : (
              // Show main app if authenticated
              <MainApplication appName="IAWFPIDM" />
            )}
          </div>
        </DiagnosticProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;
