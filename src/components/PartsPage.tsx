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
      toast.error('Error loading parts');
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
      toast.error('Please create a category first in Settings');
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
        toast.success(editingPart ? 'Part updated successfully' : 'Part created successfully');
        setShowPartDialog(false);
        fetchParts();
      } else {
        toast.error(data.error || 'Error saving part');
      }
    } catch (error) {
      toast.error('Error saving part');
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      const response = await fetch(`/api/parts/${partId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Part deleted successfully');
        fetchParts();
      } else {
        toast.error(data.error || 'Error deleting part');
      }
    } catch (error) {
      toast.error('Error deleting part');
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
        toast.success('Movement recorded successfully');
        setShowStockDialog(false);
        fetchParts();
      } else {
        toast.error(data.error || 'Error recording movement');
      }
    } catch (error) {
      toast.error('Error recording movement');
    }
  };

  const handleExport = async () => {
    window.open('/api/export?type=parts', '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getStockStatus = (part: Part) => {
    if (part.quantity <= 0) return { label: 'Out of Stock', className: 'bg-error-container text-on-error-container' };
    if (part.quantity <= part.minStock) return { label: 'Low Stock', className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' };
    return { label: 'In Stock', className: 'bg-primary-fixed text-on-primary-fixed-variant' };
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      'Moteur': 'settings_input_component',
      'Freins': 'eject',
      'Suspension': 'bolt',
      'Électrique': 'battery_charging_full',
      'Filtration': 'filter_vintage',
      'Transmission': 'sync',
      'Carrosserie': 'directions_car',
      'default': 'precision_manufacturing'
    };
    return icons[categoryName] || icons['default'];
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Automotive Parts</h2>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mt-1">Live Stock Ledger</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">precision_manufacturing</span>
            </div>
            <div>
              <p className="text-xs font-label text-slate-500 uppercase tracking-tighter">Total SKU</p>
              <p className="font-headline text-xl font-bold">{parts.length.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <p className="text-xs font-label text-slate-500 uppercase tracking-tighter">Low Stock</p>
              <p className="font-headline text-xl font-bold text-tertiary">{parts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-low p-3 rounded-xl flex items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm border border-outline-variant/20 cursor-pointer hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500 text-lg">filter_alt</span>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none focus:ring-0 font-semibold cursor-pointer"
          >
            <option value="all-categories">Category: All Parts</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm border border-outline-variant/20 cursor-pointer hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500 text-lg">sort_by_alpha</span>
          <span className="font-semibold">Sort: Name (A-Z)</span>
          <span className="material-symbols-outlined text-slate-400">expand_more</span>
        </div>
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <Input
            placeholder="Search reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-container-lowest border-none h-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <span className="material-symbols-outlined text-lg">download</span>
          Export CSV
        </Button>
        <Button 
          onClick={() => handleOpenPartDialog()} 
          className="bg-primary text-on-primary hover:bg-primary-container gap-2"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add Piece
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Part Details</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Reference</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Category</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Price</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Quantity</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Status</th>
              <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-fixed border-t-primary animate-spin" />
                    <p className="text-on-surface-variant">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">inventory_2</span>
                  <p className="text-on-surface font-medium">No parts found</p>
                  <p className="text-sm text-on-surface-variant">Start by adding your first part</p>
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
                          <span className="material-symbols-outlined text-slate-400">
                            {getCategoryIcon(part.category?.name || '')}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{part.name}</p>
                          <p className="text-xs text-slate-400">{part.description || 'No description'}</p>
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
                      <span className={`font-headline font-bold ${part.quantity <= part.minStock ? 'text-tertiary' : ''}`}>
                        {String(part.quantity).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">units</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${part.quantity <= 0 ? 'bg-error' : part.quantity <= part.minStock ? 'bg-tertiary' : 'bg-primary-container'}`}></span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenPartDialog(part)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary-fixed/30 rounded"
                        >
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                        </button>
                        <button 
                          onClick={() => handleOpenStockDialog(part, 'ENTRY')}
                          className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary-fixed/30 rounded"
                        >
                          <span className="material-symbols-outlined text-lg">arrow_downward</span>
                        </button>
                        <button 
                          onClick={() => handleDeletePart(part.id)}
                          className="p-2 text-slate-400 hover:text-error transition-colors hover:bg-error-container/30 rounded"
                        >
                          <span className="material-symbols-outlined text-lg">delete_sweep</span>
                        </button>
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
            Showing <span className="font-bold text-on-surface">1-{parts.length}</span> of <span className="font-bold text-on-surface">{parts.length}</span> entries
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center text-slate-400 hover:bg-white transition-all">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center bg-primary text-white font-bold text-xs">1</button>
            <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center text-slate-400 hover:bg-white transition-all">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stock Turnover Health & Offline Capability */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-lg">Stock Turnover Health</h3>
            <button className="text-primary text-xs font-bold flex items-center gap-1">
              VIEW FULL REPORT <span className="material-symbols-outlined text-sm">trending_up</span>
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-label text-slate-500">Fast Moving Goods</span>
                <span className="text-xs font-bold">84%</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-primary-container" style={{ width: '84%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-label text-slate-500">Obsolete Inventory</span>
                <span className="text-xs font-bold">12%</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-tertiary to-tertiary-container" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary text-white rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-4xl text-primary-fixed mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>offline_pin</span>
            <h3 className="font-headline font-bold text-xl mb-2">Offline Capability</h3>
            <p className="text-primary-fixed/80 text-sm mb-6">Your data is being saved locally. You can continue managing stock even without an active internet connection.</p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
              <span className="text-xs font-bold tracking-wide">SYSTEM READY</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full border border-white/10 blur-2xl"></div>
        </div>
      </div>

      {/* Part Dialog */}
      <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-outline-variant/10">
            <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              {editingPart ? 'Edit Part Details' : 'Add New Part'}
            </DialogTitle>
            <DialogDescription>
              {editingPart ? 'Update component specifications and inventory thresholds' : 'Fill in the information for the new part'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-8 py-6">
            {/* Left Column - Main Info */}
            <div className="col-span-8 space-y-8">
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  General Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Part Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3"
                      placeholder="Enter component name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Reference Number (REF)</Label>
                      <Input
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3 font-mono text-sm"
                        placeholder="SKU-000-000"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</Label>
                      {categories.length > 0 ? (
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                        >
                          <SelectTrigger className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-4 rounded-lg bg-tertiary-fixed/20 text-tertiary text-sm">
                          Create a category first in Settings
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Valuation */}
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  Financial Valuation
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Buying Price (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <Input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg pl-8 pr-4 py-3 font-bold text-lg text-emerald-900"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Selling Price (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <Input
                        type="number"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg pl-8 pr-4 py-3 font-bold text-lg text-primary"
                      />
                    </div>
                    {formData.purchasePrice && formData.sellingPrice && parseFloat(formData.purchasePrice) > 0 && (
                      <div className="flex justify-between mt-2">
                        <p className="text-[11px] text-slate-400 font-medium">Profit Margin:</p>
                        <p className="text-[11px] text-primary font-bold">
                          {(((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stock Control */}
            <div className="col-span-4 space-y-6">
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">inventory</span>
                  Stock Control
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Initial Stock Level</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3 font-bold text-xl flex-1"
                        disabled={!!editingPart}
                      />
                      <div className="bg-secondary-container px-3 py-1 rounded text-[10px] font-bold text-on-secondary-container">UNITS</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Minimum Stock Alert</Label>
                    <Input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      className="bg-error-container/20 border-0 border-b-2 border-error focus:border-error rounded-t-lg px-4 py-3 font-bold text-xl text-error"
                    />
                    <p className="text-[11px] text-error font-medium mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">notifications_active</span>
                      Auto-notify when stock drops below {formData.minStock}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleSavePart} 
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-headline font-bold text-lg shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                  disabled={categories.length === 0}
                >
                  {editingPart ? 'Save Changes' : 'Create Part'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPartDialog(false)} 
                  className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-headline font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="bg-surface-container-lowest border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-outline-variant/10">
            <DialogTitle className="text-xl font-headline font-bold flex items-center gap-2">
              {stockData.type === 'ENTRY' ? (
                <><span className="material-symbols-outlined text-primary">arrow_downward</span> Stock Entry</>
              ) : (
                <><span className="material-symbols-outlined text-tertiary">arrow_upward</span> Stock Exit</>
              )}
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-on-surface">{selectedPartForStock?.name}</span>
              <span className="text-on-surface-variant"> • Current stock: {selectedPartForStock?.quantity}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Quantity</Label>
                <Input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3 font-bold text-xl"
                />
              </div>
              <div>
                <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Unit Price</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <Input
                    type="number"
                    value={stockData.unitPrice}
                    onChange={(e) => setStockData({ ...stockData, unitPrice: e.target.value })}
                    className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg pl-8 pr-4 py-3 font-bold"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                {stockData.type === 'ENTRY' ? 'Supplier' : 'Customer'}
              </Label>
              <Input
                value={stockData.type === 'ENTRY' ? stockData.supplier : stockData.customer}
                onChange={(e) => 
                  stockData.type === 'ENTRY' 
                    ? setStockData({ ...stockData, supplier: e.target.value })
                    : setStockData({ ...stockData, customer: e.target.value })
                }
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3"
              />
            </div>
            <div>
              <Label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-2 block">Reason</Label>
              <Input
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary rounded-t-lg px-4 py-3"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-outline-variant/10">
            <Button variant="outline" onClick={() => setShowStockDialog(false)} className="bg-white border-slate-200 text-slate-600">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveMovement}
              className={`shadow-lg ${
                stockData.type === 'ENTRY' 
                  ? 'bg-primary text-on-primary shadow-primary/20' 
                  : 'bg-tertiary text-on-tertiary shadow-tertiary/20'
              }`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
