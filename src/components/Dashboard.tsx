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
      case 'ENTRY': return { label: 'Entrée', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', icon: ArrowDownRight };
      case 'EXIT': return { label: 'Sortie', bgColor: 'bg-rose-100', textColor: 'text-rose-700', icon: ArrowUpRight };
      case 'ADJUST': return { label: 'Ajustement', bgColor: 'bg-sky-100', textColor: 'text-sky-700', icon: RefreshCw };
      case 'RETURN': return { label: 'Retour', bgColor: 'bg-amber-100', textColor: 'text-amber-700', icon: ArrowDownRight };
      default: return { label: type, bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: ArrowUpRight };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
          <p className="text-gray-500 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <p className="text-gray-600 mb-4">Erreur lors du chargement des données</p>
        <Button onClick={fetchDashboardStats} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-gray-500 mt-1">Vue d&apos;ensemble de votre stock</p>
          </div>
        </div>
        <Button 
          onClick={fetchDashboardStats}
          variant="outline"
          className="gap-2 h-11 px-5 border-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden group hover:shadow-xl transition-shadow relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total pièces</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalParts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden group hover:shadow-xl transition-shadow relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Valeur totale</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden group hover:shadow-xl transition-shadow relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Stock faible</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.lowStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden group hover:shadow-xl transition-shadow relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rupture de stock</p>
                <p className="text-3xl font-bold text-rose-600 mt-1">{stats.outOfStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-sky-600 font-medium">Mouvements aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-sky-900">{stats.todayMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-medium">CA du jour</p>
                <p className="text-xl font-bold text-emerald-900">{formatCurrency(stats.todayRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-violet-600 font-medium">CA du mois</p>
                <p className="text-xl font-bold text-violet-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category stats */}
        <Card className="lg:col-span-1 border-2 border-gray-100 shadow-lg shadow-gray-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900">Répartition par catégorie</CardTitle>
            <CardDescription>Vue par catégorie de votre inventaire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryStats.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">Aucune catégorie</p>
                </div>
              ) : (
                stats.categoryStats.slice(0, 6).map((cat, index) => {
                  const maxCount = Math.max(...stats.categoryStats.map(c => c.partCount));
                  const percentage = (cat.partCount / maxCount) * 100;
                  const colors = [
                    'from-violet-500 to-purple-600',
                    'from-sky-500 to-blue-600',
                    'from-emerald-500 to-teal-600',
                    'from-amber-500 to-orange-600',
                    'from-rose-500 to-pink-600',
                    'from-cyan-500 to-teal-600',
                  ];
                  
                  return (
                    <div key={cat.categoryId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{cat.categoryName}</span>
                        <span className="text-gray-400">{cat.partCount} pièces</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent movements */}
        <Card className="lg:col-span-2 border-2 border-gray-100 shadow-lg shadow-gray-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-500" />
              Mouvements récents
            </CardTitle>
            <CardDescription>Les dernières opérations de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentMovements.length === 0 ? (
                <div className="text-center py-6">
                  <Activity className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">Aucun mouvement récent</p>
                </div>
              ) : (
                stats.recentMovements.map((movement) => {
                  const typeInfo = getMovementTypeLabel(movement.type);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <div 
                      key={movement.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${typeInfo.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${typeInfo.textColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {movement.part?.name || 'Pièce inconnue'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {movement.part?.reference} • {formatDate(movement.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor} border-0 font-medium`}>
                          {typeInfo.label}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          Qté: {movement.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.alerts.slice(0, 6).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl ${
                    alert.type === 'out_of_stock' 
                      ? 'bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-100' 
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100'
                  }`}
                >
                  <p className={`font-medium ${
                    alert.type === 'out_of_stock' ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    {alert.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
