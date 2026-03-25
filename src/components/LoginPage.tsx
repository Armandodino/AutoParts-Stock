'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User, AlertCircle, Loader2, Wrench, CloudOff } from 'lucide-react';
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
        toast.success('Connexion réussie ! Bienvenue');
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch {
      setError('Erreur de connexion au serveur');
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
        <Card className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden border-0">
          {/* Header Section */}
          <div className="pt-12 pb-8 px-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container/10 rounded-xl mb-6">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight mb-2">AutoParts Stock</h1>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest font-semibold">Accès Administrateur</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-error-container text-on-error-container border-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Username Field */}
              <div className="group">
                <Label htmlFor="username" className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Nom d&apos;utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <Label htmlFor="password" className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg transition-all"
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
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Offline Status Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-secondary-container/50 backdrop-blur-md rounded-full border border-secondary-fixed-dim/20 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="font-label text-xs font-bold text-on-secondary-container tracking-wide uppercase">Mode Hors-ligne Actif</span>
            <div className="h-4 w-px bg-on-secondary-container/20" />
            <CloudOff className="w-4 h-4 text-on-secondary-container" />
          </div>
          <p className="text-[11px] text-outline text-center leading-relaxed max-w-[280px]">
            Cette application fonctionne en mode local. Toutes les données sont synchronisées automatiquement.
          </p>
        </div>
      </div>

      {/* Version Footer */}
      <footer className="fixed bottom-6 left-0 w-full px-10 flex justify-between items-end pointer-events-none">
        <div className="font-label text-[10px] text-outline-variant uppercase tracking-[0.2em] font-bold">
          AutoParts Stock
        </div>
        <div className="font-label text-[10px] text-outline-variant uppercase tracking-[0.2em] font-bold">
          v1.0.0
        </div>
      </footer>
    </div>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
  );
}
