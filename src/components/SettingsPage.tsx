'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Settings, 
  Database, 
  Shield, 
  FolderTree,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useAuthStore } from '@/store';

interface Category {
  id: string;
  name: string;
  description?: string | null;
  partCount?: number;
}

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Settings form
  const [settings, setSettings] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultMinStock: '5',
    currency: 'XOF'
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Category dialog
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
    fetchBackups();
    fetchSettings();
  }, []);

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

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backup');
      const data = await response.json();
      if (data.success) {
        setBackups(data.data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({
          ...prev,
          ...data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Paramètres sauvegardés');
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Mot de passe modifié');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingCategory ? 'Catégorie modifiée' : 'Catégorie créée');
        setShowCategoryDialog(false);
        fetchCategories();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Catégorie supprimée');
        fetchCategories();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/backup', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        toast.success('Sauvegarde créée');
        fetchBackups();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm('Restaurer cette sauvegarde ? Les données actuelles seront remplacées.')) return;
    
    try {
      const response = await fetch('/api/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Sauvegarde restaurée. Redémarrez l\'application.');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        <p className="text-muted-foreground">Configuration de l&apos;application</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary">
            <Settings className="w-4 h-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary">
            <FolderTree className="w-4 h-4 mr-2" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-primary">
            <Database className="w-4 h-4 mr-2" />
            Sauvegardes
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informations entreprise</CardTitle>
              <CardDescription>Configurez les informations de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Nom de l&apos;entreprise</Label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Téléphone</Label>
                  <Input
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Email</Label>
                  <Input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Devise</Label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Adresse</Label>
                <Input
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Stock minimum par défaut</Label>
                <Input
                  type="number"
                  value={settings.defaultMinStock}
                  onChange={(e) => setSettings({ ...settings, defaultMinStock: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 w-32"
                />
              </div>
              <Button onClick={handleSaveSettings}>
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Catégories de pièces</CardTitle>
                <CardDescription>Gérez les catégories de votre inventaire</CardDescription>
              </div>
              <Button onClick={() => handleOpenCategoryDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                  >
                    <div>
                      <p className="font-medium text-white">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {category.partCount || 0} pièces
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenCategoryDialog(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Changer le mot de passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe administrateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Mot de passe actuel</Label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Confirmer</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword}>
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informations du compte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-slate-300"><strong>Utilisateur:</strong> {user?.username}</p>
                <p className="text-slate-300"><strong>Nom:</strong> {user?.name}</p>
                <p className="text-slate-300"><strong>Rôle:</strong> {user?.role}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups */}
        <TabsContent value="backup">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Sauvegardes</CardTitle>
                <CardDescription>Gérez les sauvegardes de votre base de données</CardDescription>
              </div>
              <Button onClick={handleCreateBackup} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Créer une sauvegarde
              </Button>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <HardDrive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune sauvegarde</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div 
                      key={backup.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-white">{backup.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(backup.size)} • {formatDate(backup.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.filename)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Restaurer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Nom *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Description</Label>
              <Input
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveCategory}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
