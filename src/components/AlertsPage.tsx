'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Package,
  RefreshCw,
  Sparkles
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
        return { label: 'Rupture', bgColor: 'bg-rose-100', textColor: 'text-rose-700', icon: Package };
      case 'low_stock':
        return { label: 'Stock faible', bgColor: 'bg-amber-100', textColor: 'text-amber-700', icon: AlertTriangle };
      case 'sync_error':
        return { label: 'Erreur sync', bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: RefreshCw };
      default:
        return { label: 'Système', bgColor: 'bg-sky-100', textColor: 'text-sky-700', icon: Bell };
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
          <h1 className="text-3xl font-bold text-gray-900">Alertes</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount} non lue(s) • {resolvedCount} résolue(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAlerts} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button onClick={handleMarkAllRead} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle className="w-4 h-4" />
            Tout marquer lu
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
        >
          Toutes ({alerts.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className={filter === 'unread' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
        >
          Non lues ({unreadCount})
        </Button>
        <Button
          variant={filter === 'resolved' ? 'default' : 'outline'}
          onClick={() => setFilter('resolved')}
          className={filter === 'resolved' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
        >
          Résolues ({resolvedCount})
        </Button>
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-10 h-10 mx-auto animate-pulse text-gray-300" />
            <p className="mt-2 text-gray-400">Chargement...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card className="border-0 shadow-lg shadow-gray-100/50">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Aucune alerte</p>
              <p className="text-gray-400 text-sm mt-1">Les alertes apparaîtront ici</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const typeInfo = getTypeInfo(alert.type);
            
            return (
              <Card 
                key={alert.id} 
                className={`border-0 shadow-lg shadow-gray-100/50 ${
                  !alert.isRead ? 'border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <typeInfo.icon className={`w-5 h-5 ${typeInfo.textColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor} border-0 font-medium`}>
                            {typeInfo.label}
                          </Badge>
                          {alert.isResolved && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Résolue
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                        {alert.part && (
                          <div className="mt-3 p-3 rounded-xl bg-gray-50 text-sm">
                            <p className="text-gray-700 font-medium">
                              {alert.part.name} <span className="font-normal text-gray-400">({alert.part.reference})</span>
                            </p>
                            <p className="text-gray-500 mt-1">
                              Stock actuel: <span className="font-medium text-gray-700">{alert.part.quantity}</span>
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!alert.isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve([alert.id])}
                        className="flex-shrink-0"
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
