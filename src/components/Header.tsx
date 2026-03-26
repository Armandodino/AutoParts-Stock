'use client';

import { useEffect, useState } from 'react';

interface HeaderProps {
  currentPage?: string;
  onAddPiece?: () => void;
}

export default function Header({ currentPage = 'dashboard', onAddPiece }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Inventory Control';
      case 'parts': return 'Inventory Control';
      case 'movements': return 'Inventory Control';
      case 'alerts': return 'Inventory Control';
      case 'settings': return 'System Settings';
      default: return 'Inventory Control';
    }
  };

  const getSubPages = () => {
    switch (currentPage) {
      case 'dashboard': return ['Overview', 'Stock List', 'Analytics'];
      case 'parts': return ['Overview', 'Stock List', 'Analytics'];
      case 'movements': return ['Overview', 'Stock List', 'Analytics'];
      case 'alerts': return ['Overview', 'Stock List', 'Analytics'];
      default: return [];
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/10 shadow-sm">
      <div className="flex justify-between items-center h-16 px-8">
        <div className="flex items-center gap-8">
          <span className="font-headline font-extrabold text-lg text-emerald-900">{getPageTitle()}</span>
          <nav className="hidden md:flex gap-6">
            {getSubPages().map((page, index) => (
              <a 
                key={page}
                className={`font-label text-sm tracking-wide transition-colors ${
                  index === 0 
                    ? 'text-emerald-900 border-b-2 border-emerald-700 pb-1' 
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
                href="#"
              >
                {page}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input 
              className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary transition-all"
              placeholder="Search VIN or Stock ID..."
              type="text"
            />
          </div>
          
          {/* Notification Bell */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          
          {/* Sync */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
            <span className="material-symbols-outlined">sync</span>
          </button>
          
          {/* Add Button */}
          <button 
            onClick={onAddPiece}
            className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-lg font-headline text-sm font-bold transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add Piece
          </button>
        </div>
      </div>
    </header>
  );
}
