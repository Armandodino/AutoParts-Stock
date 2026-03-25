'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Wifi, WifiOff, Search, Bell, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/10 shadow-sm h-16 px-8 flex justify-between items-center ml-64">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm capitalize font-medium">{formatDate(currentTime)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary transition-all"
            placeholder="Rechercher une pièce..."
            type="text"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-lg">
          <RefreshCw className="w-5 h-5" />
        </Button>
        
        <Badge variant="outline" className="bg-primary-fixed text-on-primary-fixed-variant font-medium px-3 py-1.5 border-0">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          {formatTime(currentTime)}
        </Badge>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20">
          <WifiOff className="w-4 h-4" />
          Mode hors-ligne
        </div>
      </div>
    </header>
  );
}
