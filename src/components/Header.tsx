'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <header className="bg-white/80 backdrop-blur-sm border-b-2 border-gray-100 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4 text-violet-500" />
            <span className="text-sm capitalize font-medium">{formatDate(currentTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-medium px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {formatTime(currentTime)}
          </Badge>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-violet-500/25">
            <WifiOff className="w-4 h-4" />
            Mode hors-ligne
          </div>
        </div>
      </div>
    </header>
  );
}
