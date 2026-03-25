'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Activity,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalParts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayMovements: number;
  todayRevenue: number;
  monthlyRevenue: number;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    partCount: number;
    totalValue: number;
  }>;
  recentMovements: Array<{
    id: string;
    type: string;
    quantity: number;
    totalPrice: number;
    createdAt: string;
    part?: {
      name: string;
      reference: string;
    };
  }>;
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'ENTRY': return { label: 'Entrée', bgColor: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant', icon: ArrowDownRight };
      case 'EXIT': return { label: 'Sortie', bgColor: 'bg-error-container', textColor: 'text-on-error-container', icon: ArrowUpRight };
      case 'ADJUST': return { label: 'Ajustement', bgColor: 'bg-sky-100', textColor: 'text-sky-700', icon: RefreshCw };
      case 'RETURN': return { label: 'Retour', bgColor: 'bg-tertiary-fixed', textColor: 'text-on-tertiary-fixed-variant', icon: ArrowDownRight };
      default: return { label: type, bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: ArrowUpRight };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
          <p className="text-on-surface-variant font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <p className="text-on-surface mb-4">Erreur lors du chargement des données</p>
        <Button onClick={fetchDashboardStats} className="bg-primary text-on-primary">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-label uppercase tracking-[0.2em] text-primary font-bold">Tableau de bord</span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mt-1">Vue d&apos;ensemble du stock</h1>
      </header>

      {/* Bento Grid: Stats & Trends */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Stat Card: Total Parts */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider font-semibold">Total Pièces</span>
            <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-2">{stats.totalParts}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">+4.2% ce mois</span>
          </div>
        </div>

        {/* Stat Card: Stock Value */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider font-semibold">Valeur Totale</span>
            <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-2">{formatCurrency(stats.totalValue)}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">Performance élevée</span>
          </div>
        </div>

        {/* Graph Card: Inbound/Outbound */}
        <div className="col-span-12 md:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider font-semibold">Tendances</span>
              <h3 className="text-xl font-headline font-bold text-on-surface">Flux Hebdomadaire</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="text-[10px] font-label font-bold uppercase">Entrées</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-label font-bold uppercase">Sorties</span>
              </div>
            </div>
          </div>
          {/* Visual Placeholder for Bar Chart */}
          <div className="h-24 flex items-end gap-1 px-2 mt-4">
            <div className="flex-1 bg-primary-fixed/50 rounded-t-sm h-[40%]"></div>
            <div className="flex-1 bg-primary-fixed/70 rounded-t-sm h-[60%]"></div>
            <div className="flex-1 bg-primary rounded-t-sm h-[85%]"></div>
            <div className="flex-1 bg-primary-container rounded-t-sm h-[70%]"></div>
            <div className="flex-1 bg-primary rounded-t-sm h-[90%]"></div>
            <div className="flex-1 bg-primary-fixed/70 rounded-t-sm h-[55%]"></div>
            <div className="flex-1 bg-primary-fixed/50 rounded-t-sm h-[45%]"></div>
          </div>
        </div>
      </div>

      {/* Middle Section: Detailed Table & Alerts */}
      <div className="grid grid-cols-12 gap-8">
        {/* Low Stock Alerts Section */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-bold text-on-surface">Alertes Critiques</h2>
            <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-full">
              {stats.lowStockCount + stats.outOfStockCount} ALERTES
            </span>
          </div>
          <div className="space-y-4">
            {stats.alerts.length === 0 ? (
              <div className="p-4 bg-surface-container-lowest rounded-xl text-center">
                <Sparkles className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-on-surface-variant">Aucune alerte active</p>
              </div>
            ) : (
              stats.alerts.slice(0, 3).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 bg-surface-container-lowest rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${
                    alert.type === 'out_of_stock' ? 'border-error' : 'border-tertiary'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${alert.type === 'out_of_stock' ? 'bg-error-container' : 'bg-tertiary-fixed'}`}>
                    <AlertTriangle className={`w-5 h-5 ${alert.type === 'out_of_stock' ? 'text-error' : 'text-tertiary'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-headline">{alert.title}</p>
                    <p className="text-xs text-on-surface-variant mb-3">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Movements Table */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface">Mouvements Récents</h2>
              <p className="text-sm text-on-surface-variant">Activité des dernières 24 heures</p>
            </div>
            <Button variant="ghost" className="text-sm font-bold text-primary flex items-center gap-2 px-4 py-2 hover:bg-primary-fixed/30 rounded-lg transition-colors">
              Voir tout
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-outline-variant/20">
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Pièce</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Réf.</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Action</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Statut</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {stats.recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-on-surface-variant">Aucun mouvement récent</p>
                    </td>
                  </tr>
                ) : (
                  stats.recentMovements.slice(0, 5).map((movement) => {
                    const typeInfo = getMovementTypeLabel(movement.type);
                    const Icon = typeInfo.icon;
                    
                    return (
                      <tr key={movement.id} className="group hover:bg-surface-container-low transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-sm font-bold font-headline">
                              {movement.part?.name || 'Pièce inconnue'}
                            </span>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded">
                            {movement.part?.reference || '-'}
                          </span>
                        </td>
                        <td className="py-5">
                          <span className={`text-xs font-bold ${movement.type === 'ENTRY' ? 'text-primary' : movement.type === 'EXIT' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="py-5">
                          <span className={`${typeInfo.bgColor} ${typeInfo.textColor} text-[10px] font-bold px-3 py-1 rounded-full`}>
                            {movement.type === 'ENTRY' ? 'REÇU' : movement.type === 'EXIT' ? 'EXPÉDIÉ' : 'AJUSTÉ'}
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          <span className="text-xs text-on-surface-variant">{formatDate(movement.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory Efficiency Score */}
      <div className="mt-12 bg-primary rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10">
          <h3 className="text-2xl font-headline font-extrabold mb-2">Score d&apos;Efficacité</h3>
          <p className="text-white/70 text-sm max-w-md">
            Votre taux de rotation est actuellement 15% plus élevé que la moyenne du secteur automobile.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tertiary-fixed-dim to-primary-fixed w-[88%] rounded-full" />
            </div>
            <span className="text-xl font-headline font-bold">88%</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 flex items-center justify-center rotate-12">
          <TrendingUp className="w-48 h-48" />
        </div>
      </div>
    </div>
  );
}
