'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Package, Wallet, AlertTriangle, XCircle, Activity, 
  CheckCircle, TrendingUp, ArrowDown, ArrowUp, RefreshCw, 
  Settings, Folder, Clock, ChevronRight
} from 'lucide-react';

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
      console.error('Erreur lors du chargement des statistiques:', error);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeInfo = (type: string) => {
    switch (type) {
      case 'ENTRY': 
        return { 
          label: 'Entrée', 
          icon: ArrowDown,
          bgColor: 'bg-emerald-100', 
          textColor: 'text-emerald-700',
        };
      case 'EXIT': 
        return { 
          label: 'Sortie', 
          icon: ArrowUp,
          bgColor: 'bg-amber-100', 
          textColor: 'text-amber-700',
        };
      case 'ADJUST': 
        return { 
          label: 'Ajustement', 
          icon: RefreshCw,
          bgColor: 'bg-slate-100', 
          textColor: 'text-slate-600',
        };
      case 'RETURN': 
        return { 
          label: 'Retour', 
          icon: RefreshCw,
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-600',
        };
      default: 
        return { 
          label: type, 
          icon: Package,
          bgColor: 'bg-slate-100', 
          textColor: 'text-slate-600',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin" />
          <p className="text-slate-500 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-slate-900 mb-4">Erreur lors du chargement des données</p>
        <Button onClick={fetchDashboardStats} className="bg-emerald-800 text-white">
          Réessayer
        </Button>
      </div>
    );
  }

  // Calcul des statistiques
  const alertCount = stats.lowStockCount + stats.outOfStockCount;
  const healthScore = stats.totalParts > 0 
    ? Math.round(((stats.totalParts - stats.outOfStockCount) / stats.totalParts) * 100)
    : 100;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <header className="mb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-emerald-800 font-bold">
          Tableau de Bord
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
          Gestion de Stock - Pièces Automobiles
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Vue d&apos;ensemble de votre inventaire et activité récente
        </p>
      </header>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-12 gap-6">
        {/* Total Pièces */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Pièces en Stock
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                {stats.totalParts.toLocaleString('fr-FR')}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-700" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">Références actives</span>
            </div>
          </div>
        </div>

        {/* Valeur Totale */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Valeur Totale
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                {formatCurrency(stats.totalValue)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">Valeur d&apos;achat</span>
            </div>
          </div>
        </div>

        {/* Stock Faible */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Stock Faible
              </span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-2">
                {stats.lowStockCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-slate-600">Alertes actives</span>
            </div>
          </div>
        </div>

        {/* Rupture de Stock */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Rupture de Stock
              </span>
              <h3 className="text-3xl font-extrabold text-red-600 mt-2">
                {stats.outOfStockCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-slate-600">À commander</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Mouvements et Alertes */}
      <div className="grid grid-cols-12 gap-6">
        {/* Alertes Critiques */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Alertes Stock
            </h2>
            {alertCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                {alertCount} ACTION{alertCount > 1 ? 'S' : ''}
              </span>
            )}
          </div>

          {stats.alerts.length === 0 ? (
            <div className="p-6 bg-white rounded-xl text-center border border-slate-100">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="font-medium text-slate-900">Tout est en ordre</p>
              <p className="text-sm text-slate-500 mt-1">Aucune alerte active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.alerts.slice(0, 4).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 bg-white rounded-xl border-l-4 shadow-sm ${
                    alert.type === 'out_of_stock' ? 'border-red-500' : 'border-amber-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'out_of_stock' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      {alert.type === 'out_of_stock' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mouvements Récents */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Mouvements Récents
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Activité des dernières 24 heures
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-700">{stats.todayMovements}</p>
                <p className="text-xs text-slate-500">Aujourd&apos;hui</p>
              </div>
            </div>
          </div>

          {stats.recentMovements.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucun mouvement récent</p>
              <p className="text-sm text-slate-400 mt-1">Les mouvements apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-slate-50">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Pièce</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Référence</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Qté</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentMovements.slice(0, 6).map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type);
                    const IconComponent = typeInfo.icon;
                    return (
                      <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Settings className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="font-medium text-slate-900 text-sm">
                              {movement.part?.name || 'Pièce inconnue'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {movement.part?.reference || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                            <IconComponent className="w-3 h-3" />
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${movement.type === 'EXIT' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {movement.type === 'EXIT' ? '-' : '+'}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-slate-500">{formatDate(movement.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques par Catégorie */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Répartition par Catégorie
          </h2>
          <span className="text-sm text-slate-500">
            {stats.categoryStats.length} catégories
          </span>
        </div>

        {stats.categoryStats.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Aucune catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.categoryStats.slice(0, 10).map((cat) => (
              <div key={cat.categoryId} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold text-slate-900 text-sm truncate">{cat.categoryName}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{cat.partCount}</p>
                <p className="text-xs text-slate-500">pièces</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score de Santé */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              État de l&apos;Inventaire
            </h3>
            <p className="text-white/80 text-sm max-w-md">
              {healthScore >= 90 
                ? 'Excellent ! Votre stock est bien géré.' 
                : healthScore >= 70 
                  ? 'Bon état. Quelques articles nécessitent attention.'
                  : 'Attention requise. Plusieurs articles en alerte.'}
            </p>
          </div>
          <div className="text-right">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-white/20" 
                  cx="48" cy="48" r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent"
                />
                <circle 
                  className="text-white" 
                  cx="48" cy="48" r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - healthScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{healthScore}%</span>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-2">Santé globale</p>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <CheckCircle className="w-48 h-48" />
        </div>
      </div>
    </div>
  );
}
