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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-emerald-800 flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <div className="absolute inset-0 h-20 w-20 rounded-2xl bg-emerald-800 animate-ping opacity-20" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-emerald-900 font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Kinetic Ledger</p>
            <p className="text-slate-500 text-sm">Loading system...</p>
            <div className="flex gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-800 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-800 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSetup) {
    return <SetupPage onComplete={() => setIsSetup(true)} />;
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

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
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <Header currentPage={currentPage} />
        <main className="flex-1 pt-24 px-8 pb-12 overflow-auto">
          {renderPage()}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
