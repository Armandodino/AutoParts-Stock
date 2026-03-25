'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Mail, AlertCircle, Loader2, CheckCircle, Rocket, CloudOff } from 'lucide-react';
import { toast } from 'sonner';

interface SetupPageProps {
  onComplete: () => void;
}

export default function SetupPage({ onComplete }: SetupPageProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('Administrateur');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, email: email || undefined })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Application initialisée avec succès !');
        onComplete();
      } else {
        setError(data.error || 'Erreur lors de l\'initialisation');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(#005147 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-fixed/30 blur-[120px] rounded-full" />

      <div className="w-full max-w-lg px-6 relative z-10">
        <Card className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden border-0">
          {/* Header */}
          <div className="pt-12 pb-8 px-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container/10 rounded-xl mb-6">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight mb-2">AutoParts Stock</h1>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest font-semibold">Première utilisation</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-error-container text-on-error-container border-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <Label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Nom d&apos;utilisateur *
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <Label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <Label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                Email (optionnel)
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
                <Input
                  type="email"
                  placeholder="admin@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <Label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <Label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
                  Confirmer *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 bg-surface-container-high border-0 border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-secondary-container/30 rounded-xl p-5 text-sm">
              <p className="font-semibold text-secondary mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Cette configuration va :
              </p>
              <ul className="space-y-2 text-secondary ml-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Créer votre compte administrateur
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Initialiser les catégories par défaut
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Configurer les paramètres de base
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-lg text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #005147 0%, #006b5f 100%)' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Configuration...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Initialiser l&apos;application
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Offline Status */}
        <div className="mt-8 flex items-center justify-center gap-3 px-5 py-2.5 bg-secondary-container/50 backdrop-blur-md rounded-full border border-secondary-fixed-dim/20 shadow-sm">
          <CloudOff className="w-4 h-4 text-on-secondary-container" />
          <span className="font-label text-xs font-bold text-on-secondary-container tracking-wide uppercase">Mode Hors-ligne</span>
        </div>
      </div>
    </div>
  );
}
