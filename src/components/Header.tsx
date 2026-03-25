'use client';

import { useEffect, useState } from 'react';
import { useAlertsStore, useSyncStore, useAuthStore } from '@/store';
import { Bell, Wifi, WifiOff, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user } = useAuthStore();
  const { alerts, unreadCount, markAsRead } = useAlertsStore();
  const { isOnline, isSyncing, lastSyncAt, pendingCount } = useSyncStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch alerts
    fetch('/api/alerts?unresolvedOnly=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          useAlertsStore.getState().setAlerts(data.data);
        }
      });
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-lg font-medium text-white capitalize">{formatDate(currentTime)}</p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Sync status */}
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Wifi className="w-3 h-3 mr-1" />
              En ligne
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
              <WifiOff className="w-3 h-3 mr-1" />
              Hors ligne
            </Badge>
          )}
          
          {isSyncing && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Sync
            </Badge>
          )}

          {pendingCount > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              {pendingCount} en attente
            </Badge>
          )}
        </div>

        {/* Alerts */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b border-slate-800">
              <h4 className="font-semibold">Notifications</h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">Aucune alerte</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50',
                      !alert.isRead && 'bg-primary/5'
                    )}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        alert.type === 'out_of_stock' ? 'bg-red-500' : 'bg-yellow-500'
                      )} />
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User info */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4" />
          <span>{user?.name || user?.username}</span>
        </div>
      </div>
    </header>
  );
}
