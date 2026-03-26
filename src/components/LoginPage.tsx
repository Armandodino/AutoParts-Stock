'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        login(data.data);
        toast.success('Login successful! Welcome back');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background Texture Elements */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(#005147 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-fixed/30 blur-[120px] rounded-full" />

      <div className="w-full max-w-[440px] px-6 relative z-10">
        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.08)] overflow-hidden">
          {/* Header Section */}
          <div className="pt-12 pb-8 px-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container/10 rounded-xl mb-6">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight mb-2">Kinetic Ledger</h1>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest font-semibold">Admin Portal Access</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">
            {error && (
              <Alert className="bg-error-container text-on-error-container border-0">
                <span className="material-symbols-outlined text-lg">error</span>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Username Field */}
              <div className="group">
                <Label htmlFor="username" className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Username <span className="text-outline/50 font-normal normal-case">(Optional)</span>
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">person</span>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. admin_01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg font-body transition-all placeholder:text-outline-variant"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <Label htmlFor="password" className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Password
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">lock</span>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg font-body transition-all placeholder:text-outline-variant"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              className="w-full py-4 rounded-lg text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #005147 0%, #006b5f 100%)' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </Button>

            {/* Auxiliary Links */}
            <div className="flex justify-between items-center pt-2">
              <a href="#" className="text-xs font-semibold text-primary hover:underline decoration-2 underline-offset-4">Forgot Password?</a>
              <a href="#" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Request Access</a>
            </div>
          </form>
        </div>

        {/* Offline Status Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-secondary-container/50 backdrop-blur-md rounded-full border border-secondary-fixed-dim/20 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="font-label text-xs font-bold text-on-secondary-container tracking-wide uppercase">Offline Mode Active</span>
            <div className="h-4 w-px bg-on-secondary-container/20" />
            <span className="material-symbols-outlined text-sm text-on-secondary-container">cloud_off</span>
          </div>
          <p className="text-[11px] text-outline text-center leading-relaxed max-w-[280px]">
            This terminal is currently operating on local storage. All changes will sync once a secure connection is established.
          </p>
        </div>
      </div>

      {/* Version & System Info */}
      <footer className="fixed bottom-6 left-0 w-full px-10 flex justify-between items-end pointer-events-none">
        <div className="font-label text-[10px] text-outline-variant uppercase tracking-[0.2em] font-bold">
          System ID: KL-DX-2024
        </div>
        <div className="font-label text-[10px] text-outline-variant uppercase tracking-[0.2em] font-bold">
          v4.2.0-Stable
        </div>
      </footer>
    </div>
  );
}
