'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Movement {
  id: string;
  partId: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUST' | 'RETURN';
  quantity: number;
  reason?: string | null;
  unitPrice: number;
  totalPrice: number;
  supplier?: string | null;
  customer?: string | null;
  invoiceRef?: string | null;
  notes?: string | null;
  createdAt: string;
  part?: {
    id: string;
    name: string;
    reference: string;
    category?: { name: string };
  };
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [filterType, startDate, endDate]);

  const fetchMovements = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/movements?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setMovements(data.data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    window.open('/api/export?type=movements', '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
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
      case 'ENTRY':
        return { label: 'Entrée', bgColor: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant', icon: 'arrow_downward' };
      case 'EXIT':
        return { label: 'Sortie', bgColor: 'bg-error-container', textColor: 'text-on-error-container', icon: 'arrow_upward' };
      case 'ADJUST':
        return { label: 'Ajustement', bgColor: 'bg-secondary-container', textColor: 'text-on-secondary-container', icon: 'sync' };
      case 'RETURN':
        return { label: 'Retour', bgColor: 'bg-tertiary-fixed', textColor: 'text-on-tertiary-fixed-variant', icon: 'undo' };
      default:
        return { label: type, bgColor: 'bg-surface-container', textColor: 'text-on-surface-variant', icon: 'inventory_2' };
    }
  };

  // Calculate stats
  const entryCount = movements.filter(m => m.type === 'ENTRY').length;
  const exitCount = movements.filter(m => m.type === 'EXIT').length;
  const entryPercentage = movements.length > 0 ? (entryCount / movements.length) * 100 : 0;
  const exitPercentage = movements.length > 0 ? (exitCount / movements.length) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-label text-sm uppercase tracking-[0.2em] font-semibold mb-2">Piste d&apos;Audit</p>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Historique des Mouvements</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-2 gap-3 border-b-2 border-outline-variant/20 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-32"
            />
            <span className="text-slate-400">à</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-32"
            />
          </div>
          <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-2 gap-3 border-b-2 border-outline-variant/20">
            <span className="material-symbols-outlined text-slate-400 text-lg">filter_list</span>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium appearance-none pr-6"
            >
              <option value="all">Tous les mouvements</option>
              <option value="ENTRY">Entrées</option>
              <option value="EXIT">Sorties</option>
              <option value="ADJUST">Ajustements</option>
              <option value="RETURN">Retours</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <p className="text-xs font-label uppercase tracking-wider text-slate-500 mb-1">Total Transactions</p>
          <h3 className="font-headline text-3xl font-extrabold text-on-surface">{movements.length}</h3>
          <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            Mouvements enregistrés
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <p className="text-xs font-label uppercase tracking-wider text-slate-500 mb-1">Entrées</p>
          <h3 className="font-headline text-3xl font-extrabold text-on-surface">{entryCount}</h3>
          <div className="w-full bg-surface-container mt-4 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${entryPercentage}%` }} />
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <p className="text-xs font-label uppercase tracking-wider text-slate-500 mb-1">Sorties</p>
          <h3 className="font-headline text-3xl font-extrabold text-on-surface">{exitCount}</h3>
          <div className="w-full bg-surface-container mt-4 h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: `${exitPercentage}%` }} />
          </div>
        </div>
        <div className="bg-primary-container text-on-primary-container rounded-xl p-6 shadow-lg shadow-primary-container/20 flex flex-col justify-between">
          <div>
            <p className="text-xs font-label uppercase tracking-wider opacity-80 mb-1">Santé Opérationnelle</p>
            <h3 className="font-headline text-3xl font-extrabold">Optimal</h3>
          </div>
          <span className="material-symbols-outlined text-4xl opacity-30 self-end" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Date</th>
                <th className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Pièce</th>
                <th className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Type</th>
                <th className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-right">Quantité</th>
                <th className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-right">Total</th>
                <th className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary-fixed border-t-primary animate-spin" />
                      <p className="text-on-surface-variant">Chargement...</p>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-2 block">inventory_2</span>
                    <p className="text-on-surface font-medium">Aucun mouvement trouvé</p>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => {
                  const typeInfo = getTypeInfo(movement.type);
                  
                  return (
                    <tr key={movement.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-5 text-sm font-medium text-on-surface">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-on-surface">
                            {movement.part?.name || 'Pièce inconnue'}
                          </span>
                          <span className="text-xs text-slate-500 font-label">
                            SKU: {movement.part?.reference || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                          <span className="material-symbols-outlined text-sm">{typeInfo.icon}</span>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-on-surface text-right">
                        {movement.type === 'EXIT' ? '-' : '+'}{movement.quantity} Unités
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-on-surface text-right">
                        {formatCurrency(movement.totalPrice)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary">
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant font-medium">
            Affichage de <span className="font-bold text-on-surface">1-{movements.length}</span> sur <span className="font-bold text-on-surface">{movements.length}</span> mouvements
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-xs">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-colors font-bold text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-colors font-bold text-xs">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
