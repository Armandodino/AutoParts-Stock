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
  Sparkles,
  Inventory
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all-categories');
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
      if (selectedCategory && selectedCategory !== 'all-categories') params.append('categoryId', selectedCategory);
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
      // Use first category if available
      const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
      setFormData({
        name: '',
        reference: '',
        description: '',
        categoryId: defaultCategoryId,
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
    if (!formData.categoryId) {
      toast.error('Veuillez d\'abord créer une catégorie dans Paramètres');
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
        toast.success(editingPart ? 'Pièce modifiée avec succès' : 'Pièce créée avec succès');
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
        toast.success('Pièce supprimée avec succès');
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
        toast.success('Mouvement enregistré avec succès');
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
        toast.success('Image uploadée avec succès');
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
    if (part.quantity <= 0) return { label: 'Rupture', variant: 'destructive' as const };
    if (part.quantity <= part.minStock) return { label: 'Stock faible', variant: 'secondary' as const };
    return { label: 'En stock', variant: 'default' as const };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Inventory className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Pièces automobiles
            </h1>
            <p className="text-gray-500 mt-1">Gérez votre inventaire de pièces détachées</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="gap-2 h-11 px-5 border-2 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button 
            onClick={() => handleOpenPartDialog()} 
            className="gap-2 h-11 px-5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-5 h-5" />
            Nouvelle pièce
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-violet-600 font-medium">Total pièces</p>
                <p className="text-2xl font-bold text-violet-900">{parts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-medium">En stock</p>
                <p className="text-2xl font-bold text-emerald-900">{parts.filter(p => p.quantity > p.minStock).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Stock faible</p>
                <p className="text-2xl font-bold text-amber-900">{parts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-rose-600 font-medium">Rupture</p>
                <p className="text-2xl font-bold text-rose-900">{parts.filter(p => p.quantity <= 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, référence ou code-barres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300 focus:bg-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-56 h-11 bg-gray-50 border-2 border-gray-100">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">Toutes catégories</SelectItem>
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
              className={`h-11 px-5 border-2 ${showFilters ? 'bg-violet-50 border-violet-300 text-violet-700' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-6 mt-4 pt-4 border-t-2 border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterLowStock}
                  onChange={(e) => setFilterLowStock(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Stock faible</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterOutOfStock}
                  onChange={(e) => setFilterOutOfStock(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Rupture de stock</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts table */}
      <Card className="border-2 border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b-2 border-gray-100 hover:bg-gray-50/80">
                  <TableHead className="text-gray-600 font-semibold py-4">Pièce</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4">Catégorie</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4">Prix achat</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4">Prix vente</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4">Stock</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4">Statut</TableHead>
                  <TableHead className="text-gray-600 font-semibold py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
                        <p className="text-gray-500 font-medium">Chargement...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : parts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-semibold text-lg">Aucune pièce trouvée</p>
                          <p className="text-gray-400 mt-1">Commencez par ajouter votre première pièce</p>
                        </div>
                        <Button 
                          className="mt-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25" 
                          onClick={() => handleOpenPartDialog()}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter une pièce
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  parts.map((part) => {
                    const status = getStockStatus(part);
                    return (
                      <TableRow key={part.id} className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            {part.imageUrl ? (
                              <img 
                                src={part.imageUrl} 
                                alt={part.name}
                                className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-gray-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center ring-2 ring-gray-100">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{part.name}</p>
                              <p className="text-sm text-gray-400 font-mono">{part.reference}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            {part.category?.name || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-gray-600 font-medium">
                          {formatCurrency(part.purchasePrice)}
                        </TableCell>
                        <TableCell className="py-4 text-gray-900 font-semibold">
                          {formatCurrency(part.sellingPrice)}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-xl font-bold text-gray-900">{part.quantity}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant={status.variant} className="font-medium">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-violet-100 rounded-full h-9 w-9">
                                <MoreVertical className="w-5 h-5 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-2">
                              <DropdownMenuItem onClick={() => handleOpenPartDialog(part)} className="gap-3 py-2.5 cursor-pointer">
                                <Edit className="w-4 h-4 text-violet-500" />
                                <span>Modifier</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStockDialog(part, 'ENTRY')} className="gap-3 py-2.5 cursor-pointer">
                                <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                                <span>Entrée stock</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStockDialog(part, 'EXIT')} className="gap-3 py-2.5 cursor-pointer">
                                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                                <span>Sortie stock</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePart(part.id)}
                                className="gap-3 py-2.5 text-rose-600 focus:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Supprimer</span>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold">
              {editingPart ? '✏️ Modifier la pièce' : '📦 Nouvelle pièce'}
            </DialogTitle>
            <DialogDescription>
              {editingPart ? 'Modifiez les informations de la pièce' : 'Remplissez les informations de la nouvelle pièce'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-5 py-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Nom *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
                placeholder="Nom de la pièce"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Référence *</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300 font-mono"
                placeholder="REF-001"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700 font-medium">Catégorie *</Label>
              {categories.length > 0 ? (
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger className="h-11 bg-gray-50 border-2 border-gray-100">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
                  <p className="text-amber-700 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Veuillez d&apos;abord créer une catégorie dans Paramètres → Catégories
                  </p>
                </div>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700 font-medium">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
                rows={2}
                placeholder="Description optionnelle de la pièce"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Prix d&apos;achat</Label>
              <Input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Prix de vente</Label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Quantité initiale</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
                disabled={!!editingPart}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Stock minimum (alerte)</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Emplacement</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Étagère A, Rayon 3"
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Code-barres</Label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300 font-mono"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700 font-medium">Photo de la pièce</Label>
              <div className="flex gap-4 items-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {formData.imageUrl ? (
                  <div className="relative group">
                    <img 
                      src={formData.imageUrl} 
                      alt="Pièce"
                      className="w-24 h-24 rounded-xl object-cover shadow-md ring-2 ring-gray-100"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowPartDialog(false)} className="h-11 px-6">
              Annuler
            </Button>
            <Button 
              onClick={handleSavePart} 
              className="h-11 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25"
              disabled={categories.length === 0}
            >
              {editingPart ? '💾 Modifier' : '📦 Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="bg-white border-2 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {stockData.type === 'ENTRY' ? (
                <><ArrowDownRight className="w-5 h-5 text-emerald-500" /> Entrée de stock</>
              ) : (
                <><ArrowUpRight className="w-5 h-5 text-rose-500" /> Sortie de stock</>
              )}
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-gray-700">{selectedPartForStock?.name}</span>
              <span className="text-gray-400"> • Stock actuel: {selectedPartForStock?.quantity}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Quantité</Label>
                <Input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Prix unitaire</Label>
                <Input
                  type="number"
                  value={stockData.unitPrice}
                  onChange={(e) => setStockData({ ...stockData, unitPrice: e.target.value })}
                  className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                {stockData.type === 'ENTRY' ? 'Fournisseur' : 'Client'}
              </Label>
              <Input
                value={stockData.type === 'ENTRY' ? stockData.supplier : stockData.customer}
                onChange={(e) => 
                  stockData.type === 'ENTRY' 
                    ? setStockData({ ...stockData, supplier: e.target.value })
                    : setStockData({ ...stockData, customer: e.target.value })
                }
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Motif</Label>
              <Input
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                className="h-11 bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Notes</Label>
              <Textarea
                value={stockData.notes}
                onChange={(e) => setStockData({ ...stockData, notes: e.target.value })}
                className="bg-gray-50 border-2 border-gray-100 focus:border-violet-300"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowStockDialog(false)} className="h-11 px-6">
              Annuler
            </Button>
            <Button 
              onClick={handleSaveMovement}
              className={`h-11 px-6 shadow-lg ${
                stockData.type === 'ENTRY' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25' 
                  : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/25'
              }`}
            >
              ✓ Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
