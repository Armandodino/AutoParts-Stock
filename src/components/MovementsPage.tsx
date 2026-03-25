'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Sparkles
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
        return { label: 'Entrée', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', icon: ArrowDownRight };
      case 'EXIT':
        return { label: 'Sortie', bgColor: 'bg-rose-100', textColor: 'text-rose-700', icon: ArrowUpRight };
      case 'ADJUST':
        return { label: 'Ajustement', bgColor: 'bg-sky-100', textColor: 'text-sky-700', icon: RefreshCw };
      case 'RETURN':
        return { label: 'Retour', bgColor: 'bg-amber-100', textColor: 'text-amber-700', icon: ArrowDownRight };
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mouvements de stock</h1>
          <p className="text-gray-500 mt-1">Historique des entrées et sorties</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-gradient-to-br from-white to-sky-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mouvements aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-gray-900">{todayMovements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-gradient-to-br from-white to-emerald-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Entrées (jour)</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalEntries)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-gradient-to-br from-white to-rose-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sorties (jour)</p>
                <p className="text-xl font-bold text-rose-600">{formatCurrency(totalExits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-gradient-to-br from-white to-teal-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total mouvements</p>
                <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg shadow-gray-100/50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="ENTRY">Entrées</SelectItem>
                <SelectItem value="EXIT">Sorties</SelectItem>
                <SelectItem value="ADJUST">Ajustements</SelectItem>
                <SelectItem value="RETURN">Retours</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 items-center">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 border-gray-200 w-40"
              />
              <span className="text-gray-400">à</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border-gray-200 w-40"
              />
            </div>
            {(filterType !== 'all' || startDate || endDate) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterType('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-gray-500"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movements table */}
      <Card className="border-0 shadow-lg shadow-gray-100/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium">Date</TableHead>
                  <TableHead className="text-gray-500 font-medium">Pièce</TableHead>
                  <TableHead className="text-gray-500 font-medium">Type</TableHead>
                  <TableHead className="text-gray-500 font-medium">Quantité</TableHead>
                  <TableHead className="text-gray-500 font-medium">Prix unitaire</TableHead>
                  <TableHead className="text-gray-500 font-medium">Total</TableHead>
                  <TableHead className="text-gray-500 font-medium">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <RefreshCw className="w-10 h-10 mx-auto animate-pulse text-gray-300" />
                      <p className="mt-2 text-gray-400">Chargement...</p>
                    </TableCell>
                  </TableRow>
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                        <Activity className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Aucun mouvement trouvé</p>
                      <p className="text-gray-400 text-sm mt-1">Les mouvements de stock apparaîtront ici</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => {
                    const typeInfo = getTypeInfo(movement.type);
                    const Icon = typeInfo.icon;
                    
                    return (
                      <TableRow key={movement.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <TableCell className="text-gray-600">
                          {formatDate(movement.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {movement.part?.name || 'Pièce inconnue'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {movement.part?.reference}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor} border-0 font-medium gap-1`}>
                            <Icon className="w-3 h-3" />
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {movement.type === 'EXIT' ? '-' : '+'}{movement.quantity}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatCurrency(movement.unitPrice)}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">
                          {formatCurrency(movement.totalPrice)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          <div className="text-sm">
                            {movement.supplier && (
                              <p>Fournisseur: {movement.supplier}</p>
                            )}
                            {movement.customer && (
                              <p>Client: {movement.customer}</p>
                            )}
                            {movement.reason && (
                              <p>Motif: {movement.reason}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
