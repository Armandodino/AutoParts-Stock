'use client';

import { Search, Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = 'dashboard' }: HeaderProps) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Tableau de Bord';
      case 'parts': return 'Inventaire des Pièces';
      case 'movements': return 'Mouvements de Stock';
      case 'alerts': return 'Alertes de Stock';
      case 'settings': return 'Paramètres';
      default: return 'AutoParts Stock';
    }
  };

  const getPageDescription = () => {
    switch (currentPage) {
      case 'dashboard': return 'Vue d\'ensemble de votre stock';
      case 'parts': return 'Gérez vos pièces automobiles';
      case 'movements': return 'Historique des entrées et sorties';
      case 'alerts': return 'Articles nécessitant une attention';
      case 'settings': return 'Configuration de l\'application';
      default: return '';
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="flex justify-between items-center h-16 px-8">
        {/* Titre de la page */}
        <div>
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-500">{getPageDescription()}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-56 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              placeholder="Rechercher une pièce..."
              type="text"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* Aide */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
