'use client';

import { useEffect, useState, useRef } from 'react';
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
  Download,
  Sparkles
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

  // Form states - Initialize with 'none' as default for categoryId
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    categoryId: 'none',
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
        categoryId: categories[0]?.id || 'none',
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
    if (formData.categoryId === 'none') {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

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
    if (part.quantity <= 0) return { label: 'Rupture', bgColor: 'bg-rose-100', textColor: 'text-rose-700' };
    if (part.quantity <= part.minStock) return { label: 'Stock faible', bgColor: 'bg-amber-100', textColor: 'text-amber-700' };
    return { label: 'OK', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pièces automobiles</h1>
          <p className="text-gray-500 mt-1">Gérez votre inventaire de pièces</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button onClick={() => handleOpenPartDialog()} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4" />
            Nouvelle pièce
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg shadow-gray-100/50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, référence ou code-barres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-50 border-gray-200">
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
              className={showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterLowStock}
                  onChange={(e) => setFilterLowStock(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">Stock faible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterOutOfStock}
                  onChange={(e) => setFilterOutOfStock(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">Rupture de stock</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts table */}
      <Card className="border-0 shadow-lg shadow-gray-100/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium">Pièce</TableHead>
                  <TableHead className="text-gray-500 font-medium">Catégorie</TableHead>
                  <TableHead className="text-gray-500 font-medium">Prix achat</TableHead>
                  <TableHead className="text-gray-500 font-medium">Prix vente</TableHead>
                  <TableHead className="text-gray-500 font-medium">Stock</TableHead>
                  <TableHead className="text-gray-500 font-medium">Statut</TableHead>
                  <TableHead className="text-gray-500 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Package className="w-10 h-10 mx-auto animate-pulse text-gray-300" />
                      <p className="mt-2 text-gray-400">Chargement...</p>
                    </TableCell>
                  </TableRow>
                ) : parts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Aucune pièce trouvée</p>
                      <p className="text-gray-400 text-sm mt-1">Commencez par ajouter votre première pièce</p>
                      <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600" onClick={() => handleOpenPartDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une pièce
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  parts.map((part) => {
                    const status = getStockStatus(part);
                    return (
                      <TableRow key={part.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {part.imageUrl ? (
                              <img 
                                src={part.imageUrl} 
                                alt={part.name}
                                className="w-11 h-11 rounded-xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{part.name}</p>
                              <p className="text-sm text-gray-400">{part.reference}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <Badge variant="outline" className="font-normal border-gray-200 text-gray-600">
                            {part.category?.name || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatCurrency(part.purchasePrice)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatCurrency(part.sellingPrice)}
                        </TableCell>
                        <TableCell>
                          <span className="text-lg font-semibold text-gray-900">{part.quantity}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.bgColor} ${status.textColor} border-0 font-medium`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleOpenPartDialog(part)} className="gap-2">
                                <Edit className="w-4 h-4 text-gray-400" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStockDialog(part, 'ENTRY')} className="gap-2">
                                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                                Entrée stock
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStockDialog(part, 'EXIT')} className="gap-2">
                                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                                Sortie stock
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePart(part.id)}
                                className="gap-2 text-rose-600 focus:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingPart ? 'Modifier la pièce' : 'Nouvelle pièce'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de la pièce
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-5 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Référence *</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Catégorie *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="none" disabled>Aucune catégorie disponible</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Créez des catégories dans Paramètres
                </p>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix d&apos;achat</Label>
              <Input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Prix de vente</Label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantité initiale</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
                disabled={!!editingPart}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock minimum (alerte)</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Emplacement</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Étagère A, Rayon 3"
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Code-barres</Label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Photo de la pièce</Label>
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
                      className="w-24 h-24 rounded-xl object-cover shadow-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-dashed border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPartDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePart} className="bg-emerald-500 hover:bg-emerald-600">
              {editingPart ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {stockData.type === 'ENTRY' ? 'Entrée de stock' : 'Sortie de stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedPartForStock?.name} - Stock actuel: {selectedPartForStock?.quantity}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                value={stockData.quantity}
                onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Prix unitaire</Label>
              <Input
                type="number"
                value={stockData.unitPrice}
                onChange={(e) => setStockData({ ...stockData, unitPrice: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>
                {stockData.type === 'ENTRY' ? 'Fournisseur' : 'Client'}
              </Label>
              <Input
                value={stockData.type === 'ENTRY' ? stockData.supplier : stockData.customer}
                onChange={(e) => 
                  stockData.type === 'ENTRY' 
                    ? setStockData({ ...stockData, supplier: e.target.value })
                    : setStockData({ ...stockData, customer: e.target.value })
                }
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Motif</Label>
              <Input
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={stockData.notes}
                onChange={(e) => setStockData({ ...stockData, notes: e.target.value })}
                className="bg-gray-50 border-gray-200 focus:bg-white"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveMovement}
              className={stockData.type === 'ENTRY' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
