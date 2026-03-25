'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  CheckCircle, 
  Package,
  RefreshCw,
  Sparkles,
  Edit,
  ShoppingCart
} from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'sync_error' | 'backup_failed' | 'system';
  title: string;
  message: string;
  partId?: string | null;
  part?: {
    name: string;
    reference: string;
    quantity: number;
    minStock: number;
  } | null;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Toutes les alertes marquées comme lues');
        fetchAlerts();
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const handleResolve = async (alertIds: string[]) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', alertIds })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Alerte résolue');
        fetchAlerts();
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'resolved') return alert.isResolved;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const resolvedCount = alerts.filter(a => a.isResolved).length;
  const criticalCount = alerts.filter(a => a.type === 'out_of_stock').length;
  const lowCount = alerts.filter(a => a.type === 'low_stock').length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Alertes Stock</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-label text-sm uppercase tracking-widest text-slate-500 font-semibold">Surveillance Prioritaire</span>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-3 border border-outline-variant/10">
            <AlertTriangle className="w-5 h-5 text-error" />
            <div>
              <p className="text-[10px] font-label text-slate-500 uppercase font-bold">Critique</p>
              <p className="text-lg font-headline font-bold leading-none">{criticalCount}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-3 border border-outline-variant/10">
            <Sparkles className="w-5 h-5 text-tertiary" />
            <div>
              <p className="text-[10px] font-label text-slate-500 uppercase font-bold">Avertissement</p>
              <p className="text-lg font-headline font-bold leading-none">{lowCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout for Alerts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Critical Focus Card */}
        {filteredAlerts.length > 0 && filteredAlerts[0].type === 'out_of_stock' && (
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 border-l-8 border-error shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold font-label tracking-tighter uppercase">
                  Action Immédiate Requise
                </span>
                <h3 className="text-2xl font-headline font-bold mt-4">{filteredAlerts[0].title}</h3>
                <p className="text-slate-500 text-sm mt-1">{filteredAlerts[0].message}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-headline font-extrabold text-error">0</p>
                <p className="text-xs font-label text-slate-400 uppercase">Unités Restantes</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex gap-3">
                <Button variant="outline" className="px-6 py-2.5 rounded-xl border-2 border-outline-variant font-bold text-sm">
                  Mettre à jour
                </Button>
                <Button 
                  onClick={() => handleResolve([filteredAlerts[0].id])}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20"
                >
                  Marquer résolu
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Sidebar */}
        <div className={`flex flex-col gap-6 ${filteredAlerts.length > 0 && filteredAlerts[0].type === 'out_of_stock' ? 'col-span-12 lg:col-span-4' : 'col-span-12'}`}>
          {/* Quick Metric */}
          <div className="bg-tertiary-container rounded-xl p-6 text-on-tertiary-container relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-label uppercase font-bold tracking-widest opacity-80">Risque Approvisionnement</p>
              <p className="text-3xl font-headline font-extrabold mt-1">
                {criticalCount > 0 ? 'Élevé' : 'Faible'}
              </p>
              <p className="text-xs mt-2 opacity-90">
                {criticalCount > 0 
                  ? `${criticalCount} articles en rupture de stock nécessitent une attention immédiate.`
                  : 'Tous les articles sont en stock suffisant.'
                }
              </p>
            </div>
            <Package className="absolute -bottom-4 -right-4 text-8xl opacity-10" />
          </div>
        </div>

        {/* List Section */}
        <div className="col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-headline font-bold">Toutes les Alertes</h3>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-primary text-on-primary' : ''}
              >
                Toutes ({alerts.length})
              </Button>
              <Button 
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-primary text-on-primary' : ''}
              >
                Non lues ({unreadCount})
              </Button>
              <Button 
                variant={filter === 'resolved' ? 'default' : 'outline'}
                onClick={() => setFilter('resolved')}
                className={filter === 'resolved' ? 'bg-primary text-on-primary' : ''}
              >
                Résolues ({resolvedCount})
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary-fixed border-t-primary animate-spin" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
              <p className="text-on-surface font-medium">Aucune alerte active</p>
              <p className="text-sm text-on-surface-variant mt-1">Toutes les alertes ont été résolues</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest">Pièce</th>
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest">Stock</th>
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest">Statut</th>
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-surface transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-headline font-bold text-on-surface">{alert.title}</p>
                            <p className="text-xs text-slate-400">{alert.part?.reference || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-headline font-bold text-lg">{alert.part?.quantity || 0}</span>
                        <span className="text-xs text-slate-400"> / {alert.part?.minStock || 0}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          alert.type === 'out_of_stock' 
                            ? 'bg-error-container text-on-error-container' 
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {alert.type === 'out_of_stock' ? 'Critique' : 'Faible'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="hover:bg-surface-container-high rounded-lg">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleResolve([alert.id])}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Health Gauge */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm flex items-center gap-8">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-slate-100" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
              <circle 
                className="text-primary" 
                cx="48" 
                cy="48" 
                fill="transparent" 
                r="40" 
                stroke="currentColor" 
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - (alerts.length - criticalCount) / alerts.length)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-headline font-extrabold leading-none">
                {alerts.length > 0 ? Math.round((alerts.length - criticalCount) / alerts.length * 100) : 100}%
              </span>
              <span className="text-[8px] uppercase font-bold text-slate-400">Santé</span>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-lg mb-1">Jauge de Santé Stock</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {criticalCount === 0 
                ? 'Tous vos articles sont dans des niveaux de stock sûrs.'
                : `${criticalCount} articles nécessitent une attention.`
              }
            </p>
          </div>
        </div>
        <div className="bg-primary text-white rounded-xl p-8 relative overflow-hidden">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-4xl text-primary-fixed mb-4 block">offline_pin</span>
            <h3 className="font-headline font-bold text-xl mb-2">Capacité Hors-ligne</h3>
            <p className="text-primary-fixed/80 text-sm mb-6">
              Vos données sont sauvegardées localement. Vous pouvez continuer à gérer le stock même sans connexion internet active.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
              <span className="text-xs font-bold tracking-wide">SYSTÈME PRÊT</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full border border-white/10 blur-2xl" />
        </div>
      </div>
    </div>
  );
}
