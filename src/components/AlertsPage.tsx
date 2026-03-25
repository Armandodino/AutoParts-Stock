'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Package,
  RefreshCw
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'sync_error' | 'backup_failed' | 'system';
  title: string;
  message: string;
  partId?: string | null;
  part?: {
    name: string;
    reference: string;
    quantity: number;
  } | null;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return { label: 'Rupture', color: 'bg-red-500', icon: Package };
      case 'low_stock':
        return { label: 'Stock faible', color: 'bg-yellow-500', icon: AlertTriangle };
      case 'sync_error':
        return { label: 'Erreur sync', color: 'bg-orange-500', icon: RefreshCw };
      default:
        return { label: 'Système', color: 'bg-blue-500', icon: Bell };
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'resolved') return alert.isResolved;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const resolvedCount = alerts.filter(a => a.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Alertes</h1>
          <p className="text-muted-foreground">
            {unreadCount} non lue(s) • {resolvedCount} résolue(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAlerts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleMarkAllRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Tout marquer lu
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Toutes ({alerts.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Non lues ({unreadCount})
        </Button>
        <Button
          variant={filter === 'resolved' ? 'default' : 'outline'}
          onClick={() => setFilter('resolved')}
        >
          Résolues ({resolvedCount})
        </Button>
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune alerte</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const typeInfo = getTypeInfo(alert.type);
            
            return (
              <Card 
                key={alert.id} 
                className={`bg-slate-800/50 border-slate-700 ${
                  !alert.isRead ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${typeInfo.color}/20 flex items-center justify-center`}>
                        <typeInfo.icon className={`w-5 h-5 ${typeInfo.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          {alert.isResolved && (
                            <Badge variant="outline" className="text-green-500 border-green-500/20">
                              Résolue
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-white">{alert.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        {alert.part && (
                          <div className="mt-2 p-2 rounded bg-slate-700/30 text-sm">
                            <p className="text-slate-300">
                              <strong>{alert.part.name}</strong> ({alert.part.reference})
                            </p>
                            <p className="text-muted-foreground">
                              Stock actuel: {alert.part.quantity}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!alert.isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve([alert.id])}
                      >
                        Résoudre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
