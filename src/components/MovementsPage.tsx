'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCw,
  Calendar,
  Download,
  Package,
  Activity,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';

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
        return { label: 'Entrée', bgColor: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant', icon: ArrowDownRight };
      case 'EXIT':
        return { label: 'Sortie', bgColor: 'bg-error-container', textColor: 'text-on-error-container', icon: ArrowUpRight };
      case 'ADJUST':
        return { label: 'Ajustement', bgColor: 'bg-sky-100', textColor: 'text-sky-700', icon: RefreshCw };
      case 'RETURN':
        return { label: 'Retour', bgColor: 'bg-tertiary-fixed', textColor: 'text-on-tertiary-fixed-variant', icon: ArrowDownRight };
      default:
        return { label: type, bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: Package };
    }
  };

  // Calculate stats
  const todayMovements = movements.filter(m => {
    const today = new Date().toDateString();
    return new Date(m.createdAt).toDateString() === today;
  });

  const totalEntries = todayMovements
    .filter(m => m.type === 'ENTRY')
    .reduce((sum, m) => sum + m.totalPrice, 0);

  const totalExits = todayMovements
    .filter(m => m.type === 'EXIT')
    .reduce((sum, m) => sum + m.totalPrice, 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-label text-sm uppercase tracking-[0.2em] font-semibold mb-2">Historique</p>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Mouvements de Stock</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-2 gap-3 border-b-2 border-outline-variant/20">
            <Calendar className="w-4 h-4 text-slate-400" />
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
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium"
            >
              <option value="all">Tous les mouvements</option>
              <option value="ENTRY">Entrées</option>
              <option value="EXIT">Sorties</option>
              <option value="ADJUST">Ajustements</option>
              <option value="RETURN">Retours</option>
            </select>
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <p className="text-xs font-label uppercase tracking-wider text-slate-500 mb-1">Total Transactions</p>
          <h3 className="font-headline text-3xl font-extrabold text-on-surface">{movements.length}</h3>
          <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Mouvements enregistrés
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <p className="text-xs font-label uppercase tracking-wider text-slate-500 mb-1">Entrées</p>
          <h3 className="font-headline text-3xl font-extrabold text-on-surface">
            {movements.filter(m => m.type === 'ENTRY').length}
          </h3>
          <div className="w-full bg-surface-container mt-4 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${(movements.filter(m => m.type === 'ENTRY').length / movements.length) * 100 || 0}%` }} />
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <p className="text-xs font-label uppercase tracking-wider text-slate-500 mb-1">Sorties</p>
          <h3 className="font-headline text-3xl font-extrabold text-on-surface">
            {movements.filter(m => m.type === 'EXIT').length}
          </h3>
          <div className="w-full bg-surface-container mt-4 h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: `${(movements.filter(m => m.type === 'EXIT').length / movements.length) * 100 || 0}%` }} />
          </div>
        </div>
        <div className="bg-primary-container text-on-primary-container rounded-xl p-6 shadow-lg shadow-primary-container/20 flex flex-col justify-between">
          <div>
            <p className="text-xs font-label uppercase tracking-wider opacity-80 mb-1">CA du jour</p>
            <h3 className="font-headline text-3xl font-extrabold">{formatCurrency(totalExits)}</h3>
          </div>
          <TrendingDown className="text-4xl opacity-30 self-end" />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary-fixed border-t-primary animate-spin" />
                      <p className="text-on-surface-variant">Chargement...</p>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-on-surface font-medium">Aucun mouvement trouvé</p>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => {
                  const typeInfo = getTypeInfo(movement.type);
                  const Icon = typeInfo.icon;
                  
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
                            {movement.part?.reference}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                          <Icon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-on-surface text-right">
                        {movement.type === 'EXIT' ? '-' : '+'}{movement.quantity}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-on-surface text-right">
                        {formatCurrency(movement.totalPrice)}
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
        </div>
      </div>
    </div>
  );
}
