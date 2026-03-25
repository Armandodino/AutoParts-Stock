'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import LoginPage from '@/components/LoginPage';
import SetupPage from '@/components/SetupPage';
import Dashboard from '@/components/Dashboard';
import PartsPage from '@/components/PartsPage';
import MovementsPage from '@/components/MovementsPage';
import AlertsPage from '@/components/AlertsPage';
import SettingsPage from '@/components/SettingsPage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSetup, setIsSetup] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check if app is initialized
    fetch('/api/auth/setup')
      .then(res => res.json())
      .then(data => {
        setIsSetup(data.data?.initialized || false);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show setup page if not initialized
  if (!isSetup) {
    return <SetupPage onComplete={() => setIsSetup(true)} />;
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Main application
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'parts':
        return <PartsPage />;
      case 'movements':
        return <MovementsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
