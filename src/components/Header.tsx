'use client';

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = 'dashboard' }: HeaderProps) {
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

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/10 shadow-sm">
      <div className="flex justify-between items-center h-16 px-8">
        <div className="flex items-center gap-8">
          <span className="text-lg font-extrabold text-emerald-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{getPageTitle()}</span>
          <nav className="hidden md:flex gap-6">
            <a className="text-sm text-emerald-900 border-b-2 border-emerald-700 pb-1 font-medium tracking-wide" href="#">Overview</a>
            <a className="text-sm text-slate-500 hover:text-emerald-700 font-medium tracking-wide" href="#">Stock List</a>
            <a className="text-sm text-slate-500 hover:text-emerald-700 font-medium tracking-wide" href="#">Analytics</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input 
              className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="Search VIN or Stock ID..."
              type="text"
            />
          </div>
          
          {/* Notification Bell */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* Sync */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
            <span className="material-symbols-outlined">sync</span>
          </button>
          
          {/* Add Button */}
          <button className="bg-emerald-800 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add Vehicle
          </button>
        </div>
      </div>
    </header>
  );
}
