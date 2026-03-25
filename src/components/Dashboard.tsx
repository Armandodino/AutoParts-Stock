'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
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
      case 'ENTRY': return { label: 'Entrée', color: 'bg-green-500', icon: ArrowDownRight };
      case 'EXIT': return { label: 'Sortie', color: 'bg-red-500', icon: ArrowUpRight };
      case 'ADJUST': return { label: 'Ajustement', color: 'bg-blue-500', icon: RefreshCw };
      case 'RETURN': return { label: 'Retour', color: 'bg-orange-500', icon: ArrowDownRight };
      default: return { label: type, color: 'bg-gray-500', icon: ArrowUpRight };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Erreur lors du chargement des données</p>
        <Button onClick={fetchDashboardStats} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre stock</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total pièces</p>
                <p className="text-3xl font-bold text-white">{stats.totalParts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.lowStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rupture de stock</p>
                <p className="text-3xl font-bold text-red-500">{stats.outOfStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Mouvements aujourd&apos;hui</p>
            <p className="text-2xl font-bold text-white">{stats.todayMovements}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Chiffre d&apos;affaires du jour</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.todayRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Chiffre d&apos;affaires du mois</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.monthlyRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category stats */}
        <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucune catégorie</p>
              ) : (
                stats.categoryStats.slice(0, 6).map((cat) => (
                  <div key={cat.categoryId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">{cat.categoryName}</span>
                      <span className="text-muted-foreground">{cat.partCount} pièces</span>
                    </div>
                    <Progress 
                      value={(cat.partCount / Math.max(...stats.categoryStats.map(c => c.partCount))) * 100} 
                      className="h-2"
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent movements */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Mouvements récents</CardTitle>
            <CardDescription>Les dernières opérations de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentMovements.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucun mouvement récent</p>
              ) : (
                stats.recentMovements.map((movement) => {
                  const typeInfo = getMovementTypeLabel(movement.type);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <div 
                      key={movement.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${typeInfo.color}/20 flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${typeInfo.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {movement.part?.name || 'Pièce inconnue'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {movement.part?.reference} • {formatDate(movement.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`${typeInfo.color}/20 border-0`}>
                          {typeInfo.label}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
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
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.alerts.slice(0, 6).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg ${
                    alert.type === 'out_of_stock' 
                      ? 'bg-red-500/10 border border-red-500/20' 
                      : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}
                >
                  <p className={`font-medium ${
                    alert.type === 'out_of_stock' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
