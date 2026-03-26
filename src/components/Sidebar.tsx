'use client';

import { useAuthStore } from '@/store';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'parts', label: 'Inventory', icon: 'inventory_2' },
  { id: 'movements', label: 'Movements', icon: 'sync_alt' },
  { id: 'alerts', label: 'Low Stock Alerts', icon: 'warning' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { logout, user } = useAuthStore();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 border-none flex flex-col py-6 z-50">
      {/* Logo */}
      <div className="px-6 mb-10">
        <h1 className="text-xl font-bold text-emerald-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Kinetic Ledger</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Stock Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all duration-200 ${
                isActive 
                  ? 'text-emerald-900 font-bold border-l-4 border-emerald-700 bg-slate-200/50 translate-x-1' 
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-200/30'
              }`}
            >
              <span 
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm overflow-hidden">
            {user?.name?.[0] || user?.username?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {user?.name || user?.username || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Warehouse Lead'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
