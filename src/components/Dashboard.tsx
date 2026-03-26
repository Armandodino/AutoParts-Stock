'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalParts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayMovements: number;
  todayRevenue: number;
  monthlyRevenue: number;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    partCount: number;
    totalValue: number;
  }>;
  recentMovements: Array<{
    id: string;
    type: string;
    quantity: number;
    totalPrice: number;
    createdAt: string;
    part?: {
      name: string;
      reference: string;
    };
  }>;
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 1,
      notation: 'compact'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'ENTRY': return { label: 'Inbound', bgColor: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant', statusText: 'RECEIVED' };
      case 'EXIT': return { label: 'Outbound', bgColor: 'bg-tertiary-fixed', textColor: 'text-on-tertiary-fixed-variant', statusText: 'SHIPPED' };
      case 'ADJUST': return { label: 'Adjustment', bgColor: 'bg-secondary-container', textColor: 'text-on-secondary-container', statusText: 'INSPECTION' };
      case 'RETURN': return { label: 'Return', bgColor: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant', statusText: 'RECEIVED' };
      default: return { label: type, bgColor: 'bg-slate-100', textColor: 'text-slate-700', statusText: type.toUpperCase() };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
          <p className="text-on-surface-variant font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-5xl text-tertiary mb-4">warning</span>
        <p className="text-on-surface mb-4">Error loading data</p>
        <Button onClick={fetchDashboardStats} className="bg-primary text-on-primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-label uppercase tracking-[0.2em] text-primary font-bold">Main Dashboard</span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mt-1">Global Fleet Overview</h1>
      </header>

      {/* Bento Grid: Stats & Trends */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Stat Card: Total Stock */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.04)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider font-semibold">Total Stock</span>
            <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-2">
              {stats.totalParts.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-bold">+4.2% from last month</span>
          </div>
        </div>

        {/* Stat Card: Inventory Value */}
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.04)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider font-semibold">Inventory Value</span>
            <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-2">
              {formatCurrency(stats.totalValue)}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-600">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-bold">High performance tier</span>
          </div>
        </div>

        {/* Graph Card: Movement Trends */}
        <div className="col-span-12 md:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.04)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider font-semibold">Movement Trends</span>
              <h3 className="text-xl font-headline font-bold text-on-surface">Weekly Flow</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-label font-bold uppercase">In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-label font-bold uppercase">Out</span>
              </div>
            </div>
          </div>
          {/* Visual Bar Chart */}
          <div className="h-24 flex items-end gap-1 px-2 mt-4">
            <div className="flex-1 bg-emerald-100 rounded-t-sm h-[40%]"></div>
            <div className="flex-1 bg-emerald-200 rounded-t-sm h-[60%]"></div>
            <div className="flex-1 bg-emerald-500 rounded-t-sm h-[85%]"></div>
            <div className="flex-1 bg-emerald-600 rounded-t-sm h-[70%]"></div>
            <div className="flex-1 bg-emerald-700 rounded-t-sm h-[90%]"></div>
            <div className="flex-1 bg-emerald-400 rounded-t-sm h-[55%]"></div>
            <div className="flex-1 bg-emerald-300 rounded-t-sm h-[45%]"></div>
          </div>
        </div>
      </div>

      {/* Middle Section: Alerts & Movements */}
      <div className="grid grid-cols-12 gap-8">
        {/* Critical Alerts Section */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-bold text-on-surface">Critical Alerts</h2>
            <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-full">
              {stats.lowStockCount + stats.outOfStockCount} ACTION ITEMS
            </span>
          </div>
          <div className="space-y-4">
            {stats.alerts.length === 0 ? (
              <div className="p-4 bg-surface-container-lowest rounded-xl text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <p className="text-sm text-on-surface-variant">All systems operational</p>
              </div>
            ) : (
              stats.alerts.slice(0, 3).map((alert, index) => (
                <div 
                  key={alert.id}
                  className={`p-4 bg-surface-container-lowest rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${
                    alert.type === 'out_of_stock' ? 'border-error' : 'border-tertiary'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${alert.type === 'out_of_stock' ? 'bg-error-container' : 'bg-tertiary-fixed'}`}>
                    <span className={`material-symbols-outlined ${alert.type === 'out_of_stock' ? 'text-error' : 'text-tertiary'}`}>
                      {alert.type === 'out_of_stock' ? 'warning' : 'priority_high'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-headline">{alert.title}</p>
                    <p className="text-xs text-on-surface-variant mb-3">{alert.message}</p>
                    <div className="w-full h-1.5 bg-surface-container rounded-full">
                      <div className={`h-full rounded-full ${alert.type === 'out_of_stock' ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${(index + 1) * 25}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Movements Table */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface">Recent Movements</h2>
              <p className="text-sm text-on-surface-variant">Last 24 hours of activity across all bays</p>
            </div>
            <button className="text-sm font-bold text-primary flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 rounded-lg transition-colors">
              View Audit Log
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-outline-variant/20">
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Part / Vehicle</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Stock ID</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Action</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="pb-4 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {stats.recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">activity</span>
                      <p className="text-sm text-on-surface-variant">No recent movements</p>
                    </td>
                  </tr>
                ) : (
                  stats.recentMovements.slice(0, 5).map((movement) => {
                    const typeInfo = getMovementTypeLabel(movement.type);
                    
                    return (
                      <tr key={movement.id} className="group hover:bg-surface-container-low transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                              <span className="material-symbols-outlined text-slate-400">settings_input_component</span>
                            </div>
                            <span className="text-sm font-bold font-headline">
                              {movement.part?.name || 'Unknown Part'}
                            </span>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded">
                            {movement.part?.reference || '-'}
                          </span>
                        </td>
                        <td className="py-5">
                          <span className={`text-xs font-bold ${movement.type === 'ENTRY' ? 'text-emerald-700' : movement.type === 'EXIT' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="py-5">
                          <span className={`${typeInfo.bgColor} ${typeInfo.textColor} text-[10px] font-bold px-3 py-1 rounded-full`}>
                            {typeInfo.statusText}
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          <span className="text-xs text-on-surface-variant">{formatDate(movement.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory Efficiency Score */}
      <div className="mt-12 bg-primary rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10">
          <h3 className="text-2xl font-headline font-extrabold mb-2">Inventory Efficiency Score</h3>
          <p className="text-white/70 text-sm max-w-md">Your turnover rate is currently 15% higher than the industry average for luxury automotive parts.</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tertiary-fixed-dim to-primary-fixed w-[88%] rounded-full"></div>
            </div>
            <span className="text-xl font-headline font-bold">88%</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 flex items-center justify-center rotate-12">
          <span className="material-symbols-outlined text-[200px]">speed</span>
        </div>
      </div>
    </div>
  );
}
