'use client';

import { useEffect, useState, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  X,
  Filter,
  Download
} from 'lucide-react';

interface Part {
  id: string;
  name: string;
  reference: string;
  description?: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  location?: string | null;
  imageUrl?: string | null;
  barcode?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);

  // Dialog states
  const [showPartDialog, setShowPartDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [selectedPartForStock, setSelectedPartForStock] = useState<Part | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    categoryId: '',
    purchasePrice: '0',
    sellingPrice: '0',
    quantity: '0',
    minStock: '5',
    location: '',
    barcode: '',
    imageUrl: ''
  });
  const [stockData, setStockData] = useState({
    type: 'ENTRY',
    quantity: '1',
    reason: '',
    unitPrice: '0',
    supplier: '',
    customer: '',
    notes: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchParts();
    fetchCategories();
  }, [search, selectedCategory, filterLowStock, filterOutOfStock]);

  const fetchParts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory && selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (filterLowStock) params.append('minStock', 'true');
      if (filterOutOfStock) params.append('outOfStock', 'true');

      const response = await fetch(`/api/parts?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setParts(data.data);
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast.error('Erreur lors du chargement des pièces');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenPartDialog = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        reference: part.reference,
        description: part.description || '',
        categoryId: part.categoryId,
        purchasePrice: part.purchasePrice.toString(),
        sellingPrice: part.sellingPrice.toString(),
        quantity: part.quantity.toString(),
        minStock: part.minStock.toString(),
        location: part.location || '',
        barcode: part.barcode || '',
        imageUrl: part.imageUrl || ''
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        reference: '',
        description: '',
        categoryId: categories[0]?.id || '',
        purchasePrice: '0',
        sellingPrice: '0',
        quantity: '0',
        minStock: '5',
        location: '',
        barcode: '',
        imageUrl: ''
      });
    }
    setShowPartDialog(true);
  };

  const handleSavePart = async () => {
    try {
      const url = editingPart ? `/api/parts/${editingPart.id}` : '/api/parts';
      const method = editingPart ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingPart ? 'Pièce modifiée' : 'Pièce créée');
        setShowPartDialog(false);
        fetchParts();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pièce ?')) return;

    try {
      const response = await fetch(`/api/parts/${partId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Pièce supprimée');
        fetchParts();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleOpenStockDialog = (part: Part, type: 'ENTRY' | 'EXIT') => {
    setSelectedPartForStock(part);
    setStockData({
      type,
      quantity: '1',
      reason: '',
      unitPrice: type === 'ENTRY' ? part.purchasePrice.toString() : part.sellingPrice.toString(),
      supplier: '',
      customer: '',
      notes: ''
    });
    setShowStockDialog(true);
  };

  const handleSaveMovement = async () => {
    if (!selectedPartForStock) return;

    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partId: selectedPartForStock.id,
          ...stockData,
          quantity: parseInt(stockData.quantity),
          unitPrice: parseFloat(stockData.unitPrice)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Mouvement enregistré');
        setShowStockDialog(false);
        fetchParts();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.data.url }));
        toast.success('Image uploadée');
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleExport = async () => {
    window.open('/api/export?type=parts', '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStockStatus = (part: Part) => {
    if (part.quantity <= 0) return { label: 'Rupture', color: 'bg-red-500' };
    if (part.quantity <= part.minStock) return { label: 'Stock faible', color: 'bg-yellow-500' };
    return { label: 'OK', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pièces automobiles</h1>
          <p className="text-muted-foreground">Gérez votre inventaire de pièces</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => handleOpenPartDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle pièce
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, référence ou code-barres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-slate-600">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/10' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterLowStock}
                  onChange={(e) => setFilterLowStock(e.target.checked)}
                  className="rounded border-slate-600"
                />
                <span className="text-sm text-muted-foreground">Stock faible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterOutOfStock}
                  onChange={(e) => setFilterOutOfStock(e.target.checked)}
                  className="rounded border-slate-600"
                />
                <span className="text-sm text-muted-foreground">Rupture de stock</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-400">Pièce</TableHead>
                  <TableHead className="text-slate-400">Catégorie</TableHead>
                  <TableHead className="text-slate-400">Prix achat</TableHead>
                  <TableHead className="text-slate-400">Prix vente</TableHead>
                  <TableHead className="text-slate-400">Stock</TableHead>
                  <TableHead className="text-slate-400">Statut</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Package className="w-8 h-8 mx-auto animate-pulse text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Chargement...</p>
                    </TableCell>
                  </TableRow>
                ) : parts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucune pièce trouvée</p>
                      <Button className="mt-4" onClick={() => handleOpenPartDialog()}>
                        Ajouter une pièce
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  parts.map((part) => {
                    const status = getStockStatus(part);
                    return (
                      <TableRow key={part.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {part.imageUrl ? (
                              <img 
                                src={part.imageUrl} 
                                alt={part.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-white">{part.name}</p>
                              <p className="text-sm text-muted-foreground">{part.reference}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {part.category?.name || '-'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatCurrency(part.purchasePrice)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatCurrency(part.sellingPrice)}
                        </TableCell>
                        <TableCell>
                          <span className="text-lg font-semibold text-white">{part.quantity}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenPartDialog(part)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStockDialog(part, 'ENTRY')}>
                                <ArrowDownRight className="w-4 h-4 mr-2 text-green-500" />
                                Entrée stock
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStockDialog(part, 'EXIT')}>
                                <ArrowUpRight className="w-4 h-4 mr-2 text-red-500" />
                                Sortie stock
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePart(part.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Part Dialog */}
      <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPart ? 'Modifier la pièce' : 'Nouvelle pièce'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de la pièce
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Nom *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Référence *</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-slate-200">Catégorie *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-slate-200">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Prix d&apos;achat</Label>
              <Input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Prix de vente</Label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Quantité initiale</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
                disabled={!!editingPart}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Stock minimum (alerte)</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Emplacement</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Étagère A, Rayon 3"
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Code-barres</Label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-slate-200">Photo de la pièce</Label>
              <div className="flex gap-4 items-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {formData.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={formData.imageUrl} 
                      alt="Pièce"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-dashed"
                  >
                    <Upload className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePart}>
              {editingPart ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {stockData.type === 'ENTRY' ? 'Entrée de stock' : 'Sortie de stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedPartForStock?.name} - Stock actuel: {selectedPartForStock?.quantity}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Quantité</Label>
              <Input
                type="number"
                value={stockData.quantity}
                onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Prix unitaire</Label>
              <Input
                type="number"
                value={stockData.unitPrice}
                onChange={(e) => setStockData({ ...stockData, unitPrice: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">
                {stockData.type === 'ENTRY' ? 'Fournisseur' : 'Client'}
              </Label>
              <Input
                value={stockData.type === 'ENTRY' ? stockData.supplier : stockData.customer}
                onChange={(e) => 
                  stockData.type === 'ENTRY' 
                    ? setStockData({ ...stockData, supplier: e.target.value })
                    : setStockData({ ...stockData, customer: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Motif</Label>
              <Input
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Notes</Label>
              <Textarea
                value={stockData.notes}
                onChange={(e) => setStockData({ ...stockData, notes: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveMovement}
              className={stockData.type === 'ENTRY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
