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
        toast.success('Connexion réussie ! Bienvenue');
      } else {
        setError(data.error || 'Échec de la connexion');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(#005147 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-300/30 blur-[120px] rounded-full" />

      <div className="w-full max-w-[440px] px-6 relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="pt-12 pb-8 px-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl mb-6">
              <span className="material-symbols-outlined text-emerald-700 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                directions_car
              </span>
            </div>
            <h1 className="font-extrabold text-3xl text-emerald-900 tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              AutoParts Stock
            </h1>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">
              Connexion Administrateur
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">
            {error && (
              <Alert className="bg-red-50 text-red-700 border-0">
                <span className="material-symbols-outlined text-lg">error</span>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Username */}
              <div className="group">
                <Label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Nom d&apos;utilisateur
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    person
                  </span>
                  <Input
                    type="text"
                    placeholder="Entrez votre identifiant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-emerald-600 focus:ring-0 rounded-lg transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <Label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Mot de passe
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    lock
                  </span>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-emerald-600 focus:ring-0 rounded-lg transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-4 rounded-lg text-white font-bold text-lg shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #005147 0%, #006b5f 100%)' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Mode Hors-ligne */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 backdrop-blur-md rounded-full border border-emerald-200 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
              Mode Hors-ligne Actif
            </span>
            <span className="material-symbols-outlined text-sm text-emerald-700">cloud_off</span>
          </div>
          <p className="text-xs text-slate-500 text-center leading-relaxed max-w-[300px]">
            Cette application fonctionne en mode local. Toutes vos données sont sauvegardées sur cet appareil.
          </p>
        </div>
      </div>
    </div>
  );
}
