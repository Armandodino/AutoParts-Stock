'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Filter,
  Package
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
        return { label: 'Entrée', color: 'bg-green-500', icon: ArrowDownRight };
      case 'EXIT':
        return { label: 'Sortie', color: 'bg-red-500', icon: ArrowUpRight };
      case 'ADJUST':
        return { label: 'Ajustement', color: 'bg-blue-500', icon: RefreshCw };
      case 'RETURN':
        return { label: 'Retour', color: 'bg-orange-500', icon: ArrowDownRight };
      default:
        return { label: type, color: 'bg-gray-500', icon: Package };
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
          <h1 className="text-3xl font-bold text-white">Mouvements de stock</h1>
          <p className="text-muted-foreground">Historique des entrées et sorties</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Mouvements aujourd&apos;hui</p>
            <p className="text-2xl font-bold text-white">{todayMovements.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Entrées (jour)</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalEntries)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sorties (jour)</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExits)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total mouvements</p>
            <p className="text-2xl font-bold text-primary">{movements.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-slate-600">
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
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 w-40"
              />
              <span className="text-muted-foreground">à</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 w-40"
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
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movements table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Pièce</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Quantité</TableHead>
                  <TableHead className="text-slate-400">Prix unitaire</TableHead>
                  <TableHead className="text-slate-400">Total</TableHead>
                  <TableHead className="text-slate-400">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Chargement...</p>
                    </TableCell>
                  </TableRow>
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun mouvement trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => {
                    const typeInfo = getTypeInfo(movement.type);
                    const Icon = typeInfo.icon;
                    
                    return (
                      <TableRow key={movement.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300">
                          {formatDate(movement.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">
                              {movement.part?.name || 'Pièce inconnue'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {movement.part?.reference}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${typeInfo.color} text-white`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {movement.type === 'EXIT' ? '-' : '+'}{movement.quantity}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatCurrency(movement.unitPrice)}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {formatCurrency(movement.totalPrice)}
                        </TableCell>
                        <TableCell className="text-slate-400">
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
