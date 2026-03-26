'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  // Calculate health percentage
  const healthPercentage = alerts.length > 0 
    ? Math.round((alerts.length - criticalCount) / alerts.length * 100) 
    : 100;

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
          <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <div>
              <p className="text-[10px] font-label text-slate-500 uppercase font-bold">Critique</p>
              <p className="text-lg font-headline font-bold leading-none">{criticalCount} Articles</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="text-[10px] font-label text-slate-500 uppercase font-bold">Avertissement</p>
              <p className="text-lg font-headline font-bold leading-none">{lowCount} Articles</p>
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
                <p className="text-slate-500 font-body text-sm mt-1">{filteredAlerts[0].message}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-headline font-extrabold text-error">
                  {String(filteredAlerts[0].part?.quantity || 0).padStart(2, '0')}
                </p>
                <p className="text-xs font-label text-slate-400 uppercase">Unités Restantes</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-[10px] font-label text-slate-500 uppercase mb-1">Stock de Sécurité</p>
                <p className="font-headline font-bold">{filteredAlerts[0].part?.minStock || 0} Unités</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-[10px] font-label text-slate-500 uppercase mb-1">Drain Hebdomadaire</p>
                <p className="font-headline font-bold text-tertiary">1.2 Unités/jour</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-[10px] font-label text-slate-500 uppercase mb-1">Délai de Livraison</p>
                <p className="font-headline font-bold">14 Jours</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-sm">inventory_2</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                  +{alerts.length}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="px-6 py-2.5 rounded-xl border-2 border-outline-variant font-bold text-sm hover:bg-surface-container transition-all">
                  Mettre à jour
                </Button>
                <Button 
                  onClick={() => handleResolve([filteredAlerts[0].id])}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  Commander
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
              <p className="text-xs mt-2 opacity-90 max-w-[200px]">
                {criticalCount > 0 
                  ? `${criticalCount} articles en rupture de stock nécessitent une attention immédiate.`
                  : 'Tous les articles sont en stock suffisant.'
                }
              </p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10">local_shipping</span>
          </div>

          {/* Secondary Alert Card with Progress Bar */}
          {filteredAlerts.filter(a => a.type === 'low_stock').length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-tertiary shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-headline font-bold text-lg leading-tight">{filteredAlerts.find(a => a.type === 'low_stock')?.title || 'Article'}</h4>
                <span className="text-tertiary font-headline font-extrabold text-xl">
                  {filteredAlerts.find(a => a.type === 'low_stock')?.part?.quantity || 0}
                </span>
              </div>
              <div className="w-full bg-surface-container-low h-2 rounded-full mb-6">
                <div className="bg-tertiary h-full rounded-full" style={{ width: `${Math.min(((filteredAlerts.find(a => a.type === 'low_stock')?.part?.quantity || 0) / (filteredAlerts.find(a => a.type === 'low_stock')?.part?.minStock || 1)) * 100, 100)}%` }} />
              </div>
              <button className="w-full py-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold text-xs uppercase tracking-wider hover:brightness-95 transition-all">
                Commander Rapidement
              </button>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-headline font-bold">Toutes les Alertes Stock</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-sm">filter_list</span>
              </button>
              <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-sm">sort</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary-fixed border-t-primary animate-spin" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-primary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-on-surface font-medium">Aucune alerte active</p>
              <p className="text-sm text-on-surface-variant mt-1">Toutes les alertes ont été résolues</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest">Nom de la Pièce</th>
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest">Catégorie</th>
                    <th className="px-8 py-4 font-label text-[10px] uppercase font-bold text-slate-500 tracking-widest">Stock Actuel</th>
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
                            <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                          </div>
                          <div>
                            <p className="font-headline font-bold text-on-surface">{alert.title}</p>
                            <p className="text-xs text-slate-400 font-body">SKU: {alert.part?.reference || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-body text-slate-600">
                        {alert.part?.minStock ? 'Stock' : '-'}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-headline font-bold text-lg">{String(alert.part?.quantity || 0).padStart(2, '0')}</span>
                        <span className="text-xs text-slate-400 ml-1">/ {alert.part?.minStock || 0}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-label uppercase ${
                          alert.type === 'out_of_stock' 
                            ? 'bg-error-container text-on-error-container' 
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {alert.type === 'out_of_stock' ? 'Critique' : 'Faible'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all" title="Mettre à jour">
                            <span className="material-symbols-outlined text-slate-600">edit</span>
                          </button>
                          <button 
                            onClick={() => handleResolve([alert.id])}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                            title="Résoudre"
                          >
                            <span className="material-symbols-outlined text-sm">shopping_cart</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-surface-container-low border-t border-slate-100 flex justify-center">
                <button className="text-primary font-bold font-manrope text-sm flex items-center gap-2 hover:underline">
                  Voir toutes les {alerts.length} alertes stock
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Gauge Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-8 shadow-sm flex items-center gap-8">
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
                strokeDashoffset={251.2 * (1 - healthPercentage / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-headline font-extrabold leading-none">{healthPercentage}%</span>
              <span className="text-[8px] uppercase font-bold text-slate-400">Santé</span>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-lg mb-1">Jauge de Santé Stock</h4>
            <p className="text-sm text-slate-500 font-body leading-relaxed">
              {criticalCount === 0 
                ? 'Tous vos articles sont dans des niveaux de stock sûrs.'
                : `${criticalCount} articles nécessitent une attention.`
              }
            </p>
          </div>
        </div>
        <div className="bg-surface-container-highest rounded-xl p-8 flex items-center justify-between border-2 border-dashed border-outline-variant/50">
          <div className="max-w-[200px]">
            <h4 className="font-headline font-bold text-lg mb-1">Rapport par Lot</h4>
            <p className="text-sm text-on-surface-variant font-body">Générez un rapport complet de réconciliation d&apos;inventaire pour la semaine en cours.</p>
          </div>
          <button className="bg-on-surface text-surface px-6 py-3 rounded-xl font-bold font-manrope text-sm hover:bg-primary transition-colors">
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  );
}
