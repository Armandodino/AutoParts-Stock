'use client';

import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Bell, 
  Settings,
  LogOut,
  Wrench
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, color: 'from-violet-500 to-purple-600' },
  { id: 'parts', label: 'Pièces', icon: Package, color: 'from-blue-500 to-cyan-600' },
  { id: 'movements', label: 'Mouvements', icon: ArrowLeftRight, color: 'from-emerald-500 to-teal-600' },
  { id: 'alerts', label: 'Alertes', icon: Bell, color: 'from-amber-500 to-orange-600' },
  { id: 'settings', label: 'Paramètres', icon: Settings, color: 'from-rose-500 to-pink-600' },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { logout, user } = useAuthStore();

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-xl shadow-gray-200/20">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AutoParts
            </h1>
            <p className="text-xs text-gray-400 font-medium">Gestion de stock</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">Menu principal</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group',
                isActive 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                isActive 
                  ? 'bg-white/20' 
                  : `bg-gradient-to-br ${item.color} bg-opacity-10 text-gray-400 group-hover:text-white group-hover:opacity-100 opacity-60`
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/20">
            {user?.name?.[0] || user?.username?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || user?.username}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
