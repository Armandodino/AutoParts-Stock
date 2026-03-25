'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
    if (part.quantity <= 0) return { label: 'Rupture', className: 'bg-error-container text-on-error-container' };
    if (part.quantity <= part.minStock) return { label: 'Stock faible', className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' };
    return { label: 'En stock', className: 'bg-primary-fixed text-on-primary-fixed-variant' };
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Pièces Automobiles</h2>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mt-1">Inventaire en direct</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Inventory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-label text-slate-500 uppercase tracking-tighter">Total</p>
              <p className="font-headline text-xl font-bold">{parts.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-label text-slate-500 uppercase tracking-tighter">Stock faible</p>
              <p className="font-headline text-xl font-bold text-tertiary">{parts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-low p-3 rounded-xl flex items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm border border-outline-variant/20 cursor-pointer hover:bg-white transition-colors">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none focus:ring-0 font-semibold cursor-pointer"
          >
            <option value="all-categories">Catégorie: Toutes</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, référence ou code-barres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-container-lowest border-none h-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
        <Button 
          onClick={() => handleOpenPartDialog()} 
          className="bg-primary text-on-primary hover:bg-primary-container gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle pièce
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Détails</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Référence</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Catégorie</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Prix</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Quantité</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Statut</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-fixed border-t-primary animate-spin" />
                    <p className="text-on-surface-variant">Chargement...</p>
                  </div>
                </td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-on-surface font-medium">Aucune pièce trouvée</p>
                  <p className="text-sm text-on-surface-variant">Commencez par ajouter votre première pièce</p>
                </td>
              </tr>
            ) : (
              parts.map((part) => {
                const status = getStockStatus(part);
                return (
                  <tr key={part.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{part.name}</p>
                          <p className="text-xs text-slate-400">{part.description || 'Aucune description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{part.reference}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-secondary-container/30 text-on-secondary-container px-2 py-1 rounded">
                        {part.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-headline font-semibold">{formatCurrency(part.sellingPrice)}</td>
                    <td className="px-6 py-4">
                      <span className="font-headline font-bold">{part.quantity}</span>
                      <span className="text-[10px] text-slate-400 ml-1">unités</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenPartDialog(part)}
                          className="text-slate-400 hover:text-primary hover:bg-primary-fixed/30 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenStockDialog(part, 'ENTRY')}
                          className="text-slate-400 hover:text-primary hover:bg-primary-fixed/30 rounded"
                        >
                          <ArrowDownRight className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeletePart(part.id)}
                          className="text-slate-400 hover:text-error hover:bg-error-container/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low/30 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-label">
            Affichage de <span className="font-bold text-on-surface">1-{parts.length}</span> sur <span className="font-bold text-on-surface">{parts.length}</span> entrées
          </p>
        </div>
      </div>

      {/* Part Dialog */}
      <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-outline-variant/10">
            <DialogTitle className="text-xl font-headline font-bold">
              {editingPart ? 'Modifier la pièce' : 'Nouvelle pièce'}
            </DialogTitle>
            <DialogDescription>
              {editingPart ? 'Modifiez les informations de la pièce' : 'Remplissez les informations de la nouvelle pièce'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Nom de la pièce</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg"
                placeholder="Nom de la pièce"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Référence</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-mono text-sm"
                placeholder="REF-001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Catégorie</Label>
              {categories.length > 0 ? (
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 rounded-lg bg-tertiary-fixed/20 text-tertiary text-sm">
                  Créez d&apos;abord une catégorie dans Paramètres
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Prix d&apos;achat (XOF)</Label>
              <Input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Prix de vente (XOF)</Label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-bold text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Quantité initiale</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-bold text-xl"
                disabled={!!editingPart}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Stock minimum</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-bold text-xl"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Emplacement</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Étagère A, Rayon 3"
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-outline-variant/10">
            <Button variant="outline" onClick={() => setShowPartDialog(false)} className="bg-white border-slate-200 text-slate-600">
              Annuler
            </Button>
            <Button 
              onClick={handleSavePart} 
              className="bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20"
              disabled={categories.length === 0}
            >
              {editingPart ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="bg-surface-container-lowest border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-outline-variant/10">
            <DialogTitle className="text-xl font-headline font-bold flex items-center gap-2">
              {stockData.type === 'ENTRY' ? (
                <><ArrowDownRight className="w-5 h-5 text-primary" /> Entrée de stock</>
              ) : (
                <><ArrowUpRight className="w-5 h-5 text-tertiary" /> Sortie de stock</>
              )}
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-on-surface">{selectedPartForStock?.name}</span>
              <span className="text-on-surface-variant"> • Stock actuel: {selectedPartForStock?.quantity}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Quantité</Label>
                <Input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-bold text-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Prix unitaire</Label>
                <Input
                  type="number"
                  value={stockData.unitPrice}
                  onChange={(e) => setStockData({ ...stockData, unitPrice: e.target.value })}
                  className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">
                {stockData.type === 'ENTRY' ? 'Fournisseur' : 'Client'}
              </Label>
              <Input
                value={stockData.type === 'ENTRY' ? stockData.supplier : stockData.customer}
                onChange={(e) => 
                  stockData.type === 'ENTRY' 
                    ? setStockData({ ...stockData, supplier: e.target.value })
                    : setStockData({ ...stockData, customer: e.target.value })
                }
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Motif</Label>
              <Input
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-outline-variant/10">
            <Button variant="outline" onClick={() => setShowStockDialog(false)} className="bg-white border-slate-200 text-slate-600">
              Annuler
            </Button>
            <Button 
              onClick={handleSaveMovement}
              className={`shadow-lg ${
                stockData.type === 'ENTRY' 
                  ? 'bg-primary text-on-primary shadow-primary/20' 
                  : 'bg-tertiary text-on-tertiary shadow-tertiary/20'
              }`}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
