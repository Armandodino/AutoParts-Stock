'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Package, Plus, Download, Search, Filter, SortAsc, 
  Edit, Trash2, ArrowDown, ArrowUp, Settings, AlertTriangle,
  CheckCircle, TrendingUp, Wifi, Folder
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
  }, [search, selectedCategory]);

  const fetchParts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory && selectedCategory !== 'all-categories') params.append('categoryId', selectedCategory);

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
      toast.error('Veuillez créer une catégorie dans les paramètres');
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

  const handleExport = async () => {
    window.open('/api/export?type=parts', '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStockStatus = (part: Part) => {
    if (part.quantity <= 0) return { label: 'Rupture', className: 'bg-red-100 text-red-700' };
    if (part.quantity <= part.minStock) return { label: 'Stock Faible', className: 'bg-amber-100 text-amber-700' };
    return { label: 'En Stock', className: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-800 font-bold">
            Inventaire
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Pièces Automobiles
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Gérez votre stock de pièces et pièces détachées
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-bold text-slate-900">{parts.length}</p>
            </div>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs text-slate-500">Stock Faible</p>
              <p className="font-bold text-amber-600">{parts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium cursor-pointer"
          >
            <option value="all-categories">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-50 border-none h-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
        <Button 
          onClick={() => handleOpenPartDialog()} 
          className="bg-emerald-800 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Pièce
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pièce</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Référence</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Catégorie</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Prix</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Statut</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-200 border-t-emerald-800 animate-spin" />
                      <p className="text-slate-500">Chargement...</p>
                    </div>
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-900 font-medium">Aucune pièce trouvée</p>
                    <p className="text-sm text-slate-500">Commencez par ajouter une pièce</p>
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const status = getStockStatus(part);
                  return (
                    <tr key={part.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{part.name}</p>
                            <p className="text-xs text-slate-400">{part.description || 'Aucune description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                          {part.reference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                          {part.category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(part.sellingPrice)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-lg ${part.quantity <= part.minStock ? 'text-amber-600' : 'text-slate-900'}`}>
                          {part.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${part.quantity <= 0 ? 'bg-red-500' : part.quantity <= part.minStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenPartDialog(part)}
                            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenStockDialog(part, 'ENTRY')}
                            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Entrée stock"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenStockDialog(part, 'EXIT')}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Sortie stock"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePart(part.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part Dialog */}
      <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              {editingPart ? 'Modifier la Pièce' : 'Ajouter une Pièce'}
            </DialogTitle>
            <DialogDescription>
              {editingPart ? 'Mettez à jour les informations de la pièce' : 'Remplissez les informations de la nouvelle pièce'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                  placeholder="Nom de la pièce"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Référence *</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="bg-slate-50 border-slate-200 font-mono"
                  placeholder="SKU-000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Catégorie *</Label>
                {categories.length > 0 ? (
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                    Créez une catégorie dans Paramètres
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Emplacement</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                  placeholder="Rayon A, Étagère 2"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-50 border-slate-200"
                placeholder="Description de la pièce..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prix d'achat (FCFA)</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prix de vente (FCFA)</Label>
                <Input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quantité initiale</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                  disabled={!!editingPart}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Seuil d'alerte</Label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="bg-amber-50 border-amber-200"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowPartDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSavePart}
              className="bg-emerald-800 hover:bg-emerald-700 text-white"
              disabled={categories.length === 0}
            >
              {editingPart ? 'Enregistrer' : 'Créer la Pièce'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="bg-white">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {stockData.type === 'ENTRY' ? (
                <><ArrowDown className="w-5 h-5 text-emerald-600" /> Entrée de Stock</>
              ) : (
                <><ArrowUp className="w-5 h-5 text-amber-600" /> Sortie de Stock</>
              )}
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-slate-900">{selectedPartForStock?.name}</span>
              <span className="text-slate-500"> • Stock actuel: {selectedPartForStock?.quantity}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quantité</Label>
                <Input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prix unitaire</Label>
                <Input
                  type="number"
                  value={stockData.unitPrice}
                  onChange={(e) => setStockData({ ...stockData, unitPrice: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                {stockData.type === 'ENTRY' ? 'Fournisseur' : 'Client'}
              </Label>
              <Input
                value={stockData.type === 'ENTRY' ? stockData.supplier : stockData.customer}
                onChange={(e) => 
                  stockData.type === 'ENTRY' 
                    ? setStockData({ ...stockData, supplier: e.target.value })
                    : setStockData({ ...stockData, customer: e.target.value })
                }
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Motif</Label>
              <Input
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveMovement}
              className={stockData.type === 'ENTRY' ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
