'use client'

/**
 * ============================================================================
 * AUTOPARTS STOCK - Application de Gestion de Stock de Pièces Automobiles
 * ============================================================================
 * 
 * Ce fichier contient toute l'interface utilisateur de l'application.
 * Il gère :
 * - La page de connexion
 * - Le tableau de bord
 * - La gestion des produits/pièces
 * - La gestion du stock
 * - Les ventes et achats
 * - Les clients et fournisseurs
 * - Les rapports et statistiques
 * - Les paramètres
 */

// ============================================================================
// IMPORTATION DES BIBLIOTHÈQUES
// ============================================================================

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

// Icônes depuis Lucide React
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck, BarChart3, Settings as SettingsIcon,
  LogOut, Bell, Search, ChevronDown, Plus, Edit, Trash2, Download, Upload,
  TrendingUp, AlertTriangle, CheckCircle, DollarSign, Box,
  Moon, Sun, User, Save, RefreshCw,
  ArrowUpRight, ArrowDownRight, Building, FileText,
  Lock, Eye, EyeOff, Car, Wrench
} from 'lucide-react'

// Composants UI depuis shadcn/ui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'

// Graphiques depuis Recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

// Gestion de l'état (state management)
import { useAuthStore, useSettingsStore, useCartStore, useUIStore } from '@/lib/store'
import type { Product, Category, Unit, Client, Supplier, Sale, Purchase, Settings } from '@/lib/store'

// ============================================================================
// CONFIGURATION GLOBALE
// ============================================================================

// Nom de l'application
const APP_NAME = "AutoParts Stock"

// Couleurs pour les graphiques
const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

// ============================================================================
// PAGE DE CONNEXION
// ============================================================================

function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  // États du formulaire de connexion
  const [username, setUsername] = useState('')      // Nom d'utilisateur
  const [password, setPassword] = useState('')      // Mot de passe
  const [loading, setLoading] = useState(false)     // État de chargement
  const [error, setError] = useState('')            // Message d'erreur
  const [showPassword, setShowPassword] = useState(false)  // Afficher/masquer le mot de passe

  /**
   * Gère la soumission du formulaire de connexion
   * Envoie les identifiants au serveur et récupère les données de l'utilisateur
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Appel à l'API d'authentification
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await res.json()
      
      // Vérifie si la connexion a échoué
      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        return
      }
      
      // Connexion réussie
      onLogin(data.user)
      toast.success(`Bienvenue, ${data.user.name || data.user.username}!`)
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Page de connexion centrée avec fond dégradé
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo et nom de l'application */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-green-600">{APP_NAME}</h1>
              <p className="text-sm text-muted-foreground">Gestion de Stock Automobile</p>
            </div>
          </div>
        </div>

        {/* Carte de connexion */}
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 pt-8 px-8">
            <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              {/* Champ nom d'utilisateur */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Entrez votre identifiant"
                    required
                    className="pl-12 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              
              {/* Champ mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                    className="pl-12 pr-12 h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Se connecter
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Lien pour créer un compte */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-center text-sm text-muted-foreground">
                Pas de compte ?{' '}
                <span className="text-green-600 font-medium">Contactez l'administrateur</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          © 2026 AutoParts Stock. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  )
}

// ============================================================================
// BARRE DE NAVIGATION (HEADER)
// ============================================================================

function HeaderNav({ currentPage, setCurrentPage }: {
  currentPage: string
  setCurrentPage: (page: string) => void
}) {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Initialisation du thème après le chargement du composant
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Liste des pages du menu de navigation
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pos', label: 'Point de vente', icon: ShoppingCart },
    { id: 'products', label: 'Pièces', icon: Package },
    { id: 'stock', label: 'Stock', icon: Box },
    { id: 'sales', label: 'Ventes', icon: TrendingUp },
    { id: 'purchases', label: 'Achats', icon: Truck },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'suppliers', label: 'Fournisseurs', icon: Building },
    { id: 'reports', label: 'Rapports', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo et nom de l'application */}
        <motion.div 
          className="flex items-center gap-3 mr-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{APP_NAME}</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Gestion de Stock</p>
          </div>
        </motion.div>

        {/* Menu de navigation */}
        <TooltipProvider delayDuration={0}>
          <nav className="flex-1 flex items-center justify-center gap-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                        currentPage === item.id
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {currentPage === item.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 -z-10"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </nav>
        </TooltipProvider>

        {/* Section droite : notifications, thème, profil */}
        <div className="flex items-center gap-2 ml-4">
          {/* Bouton de notification */}
          <Button variant="ghost" size="icon" className="relative rounded-xl">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </Button>

          {/* Changement de thème (clair/sombre) */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3 rounded-xl">
                <Avatar className="h-8 w-8 border-2 border-green-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm">
                    {user?.name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">{user?.name || user?.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <div className="p-2">
                <p className="text-sm font-medium">{user?.name || user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCurrentPage('settings')} className="rounded-lg">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => { logout(); toast.info('Déconnexion réussie') }}
                className="text-red-600 focus:text-red-600 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

// ============================================================================
// TABLEAU DE BORD
// ============================================================================

function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSettingsStore()
  const setCurrentPage = useUIStore((s) => s.setCurrentPage)

  // Chargement des données au démarrage
  useEffect(() => {
    fetchDashboardData()
  }, [])

  /**
   * Récupère les statistiques depuis l'API
   */
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        </div>
        <p className="text-muted-foreground animate-pulse">Chargement des données...</p>
      </div>
    )
  }

  // Symbole de la devise
  const currency = settings?.currencySymbol || 'FCFA'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* En-tête du tableau de bord */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-6 md:p-8 shadow-2xl shadow-green-500/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Tableau de bord</h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchDashboardData} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Cartes KPI */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Carte Chiffre d'affaires */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl h-full flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full -translate-y-20 translate-x-20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="relative p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 rounded-full px-3">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Chiffre d'affaires</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {(stats?.sales?.totalRevenue || 0).toFixed(0)} <span className="text-lg font-medium text-muted-foreground">{currency}</span>
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ce mois</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {(stats?.sales?.monthRevenue || 0).toFixed(2)} {currency}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carte Ventes du jour */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl h-full flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-full -translate-y-20 translate-x-20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="relative p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3">Aujourd'hui</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Ventes du jour</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stats?.sales?.today || 0}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenus</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {(stats?.sales?.todayRevenue || 0).toFixed(2)} {currency}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carte Pièces en stock */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full">
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl h-full flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full -translate-y-20 translate-x-20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="relative p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 rounded-full px-3">
                    Inventaire
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pièces en stock</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stats?.products?.total || 0}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Niveau global</span>
                    <span className="text-sm font-medium">
                      {stats?.products?.total > 0 ? Math.round(((stats?.products?.total - (stats?.products?.lowStock || 0)) / stats?.products?.total) * 100) : 100}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.products?.total > 0 ? ((stats?.products?.total - (stats?.products?.lowStock || 0)) / stats?.products?.total) * 100 : 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carte Alerte rupture */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="h-full">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 text-white shadow-xl shadow-red-500/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl h-full flex flex-col">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
              <CardContent className="relative p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  {(stats?.products?.outOfStock || 0) > 0 && (
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 rounded-full px-3 animate-pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Rupture de stock</p>
                  <p className="text-3xl font-bold">{stats?.products?.outOfStock || 0}</p>
                </div>
                <div className="mt-auto">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 rounded-xl"
                    onClick={() => setCurrentPage('stock')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Gérer le stock
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions rapides */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShoppingCart, label: 'Nouvelle vente', color: 'from-green-500 to-emerald-600', page: 'pos' },
              { icon: Package, label: 'Ajouter une pièce', color: 'from-blue-500 to-indigo-600', page: 'products' },
              { icon: Users, label: 'Nouveau client', color: 'from-purple-500 to-violet-600', page: 'clients' },
              { icon: BarChart3, label: 'Voir rapports', color: 'from-orange-500 to-amber-600', page: 'reports' },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(action.page)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Graphique des ventes */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Évolution des ventes</CardTitle>
                    <CardDescription>7 derniers jours</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                      <span className="text-xs text-muted-foreground">Revenus</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.salesByDay || []}>
                      <defs>
                        <linearGradient id="colorRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { weekday: 'short' })} className="text-xs" tickLine={false} axisLine={false} />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        formatter={(value: any) => [`${Number(value).toFixed(2)} ${currency}`, 'CA']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenueGradient)" strokeWidth={3} strokeLinecap="round" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top des pièces vendues */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Card className="border-0 shadow-xl rounded-2xl h-full bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  Top Pièces
                </CardTitle>
                <CardDescription>Les plus vendues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats?.topProducts || []).slice(0, 5).map((product: any, index: number) => (
                    <motion.div key={product?.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + index * 0.1 }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product?.name || 'Pièce'}</p>
                        <p className="text-xs text-muted-foreground">{product?.sku || ''}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {product?.totalSold || 0}
                      </Badge>
                    </motion.div>
                  ))}
                  {(!stats?.topProducts || stats.topProducts.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Aucune vente enregistrée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PAGE DES PRODUITS / PIÈCES
// ============================================================================

function ProductsPage() {
  // États pour les données
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Formulaire pour créer/modifier un produit
  const [formData, setFormData] = useState<any>({ 
    name: '', sku: '', barcode: '', description: '', categoryId: '', unitId: '', 
    purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 10, maxStock: '', isActive: true,
    oemNumber: '', oemNumbers: '', brand: '', compatibility: '', warrantyMonths: '', weight: '', location: ''
  })
  
  const { settings } = useSettingsStore()
  const currency = settings?.currencySymbol || 'FCFA'

  // Chargement des données au démarrage
  useEffect(() => { fetchData() }, [])

  /**
   * Récupère les produits, catégories et unités depuis l'API
   */
  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, unitRes] = await Promise.all([
        fetch('/api/products'), 
        fetch('/api/categories'), 
        fetch('/api/units')
      ])
      const [prodData, catData, unitData] = await Promise.all([
        prodRes.json(), 
        catRes.json(), 
        unitRes.json()
      ])
      setProducts(prodData)
      setCategories(catData)
      setUnits(unitData)
    } catch { 
      toast.error('Erreur de chargement') 
    } finally { 
      setLoading(false) 
    }
  }

  /**
   * Filtre les produits selon la recherche et la catégorie
   */
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (p.oemNumber || '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  /**
   * Gère la soumission du formulaire (création ou modification)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct ? { ...formData, id: editingProduct.id } : formData
      const res = await fetch('/api/products', { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      })
      if (!res.ok) { 
        const error = await res.json()
        throw new Error(error.error) 
      }
      toast.success(editingProduct ? 'Pièce modifiée' : 'Pièce créée')
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (err: any) { 
      toast.error(err.message || 'Erreur') 
    }
  }

  /**
   * Supprime un produit
   */
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette pièce ?')) return
    try { 
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      toast.success('Pièce supprimée')
      fetchData() 
    } catch { 
      toast.error('Erreur lors de la suppression') 
    }
  }

  /**
   * Réinitialise le formulaire
   */
  const resetForm = () => { 
    setFormData({ 
      name: '', sku: '', barcode: '', description: '', categoryId: '', unitId: '', 
      purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 10, maxStock: '', isActive: true,
      oemNumber: '', oemNumbers: '', brand: '', compatibility: '', warrantyMonths: '', weight: '', location: ''
    })
    setEditingProduct(null) 
  }

  /**
   * Ouvre le formulaire en mode édition
   */
  const openEdit = (product: Product) => { 
    setEditingProduct(product)
    setFormData({ 
      name: product.name, sku: product.sku, barcode: product.barcode || '', description: product.description || '', 
      categoryId: product.categoryId || '', unitId: product.unitId || '', 
      purchasePrice: product.purchasePrice, sellingPrice: product.sellingPrice, 
      stock: product.stock, minStock: product.minStock, maxStock: product.maxStock || '', isActive: product.isActive,
      oemNumber: product.oemNumber || '', oemNumbers: product.oemNumbers || '', brand: product.brand || '',
      compatibility: product.compatibility || '', warrantyMonths: product.warrantyMonths || '', 
      weight: product.weight || '', location: product.location || ''
    })
    setDialogOpen(true) 
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pièces Automobiles</h1>
          <p className="text-muted-foreground">{products.length} pièces en catalogue</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />Nouvelle pièce
            </Button>
          </DialogTrigger>
          
          {/* Formulaire de création/modification */}
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Modifier la pièce' : 'Nouvelle pièce'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informations générales */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de la pièce *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-xl" placeholder="Ex: Plaquettes de frein AV" />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU / Référence *</Label>
                    <Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required className="rounded-xl" placeholder="Ex: FRE-BMW-001" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Code-barres</Label>
                    <Input value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} className="rounded-xl" placeholder="Code-barres du produit" />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Références constructeur */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Références constructeur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>N° OEM principal</Label>
                    <Input value={formData.oemNumber} onChange={(e) => setFormData({...formData, oemNumber: e.target.value})} className="rounded-xl" placeholder="Ex: 34116762430" />
                  </div>
                  <div className="space-y-2">
                    <Label>Autres OEM</Label>
                    <Input value={formData.oemNumbers} onChange={(e) => setFormData({...formData, oemNumbers: e.target.value})} className="rounded-xl" placeholder="OEM additionnels (séparés par ,)" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Marque de la pièce</Label>
                    <Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="rounded-xl" placeholder="Ex: Bosch, Brembo, Valeo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Garantie (mois)</Label>
                    <Input type="number" value={formData.warrantyMonths} onChange={(e) => setFormData({...formData, warrantyMonths: e.target.value})} className="rounded-xl" placeholder="Ex: 12" />
                  </div>
                </div>
              </div>

              {/* Compatibilité */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Compatibilité véhicules</h3>
                <div className="space-y-2">
                  <Label>Véhicules compatibles</Label>
                  <Textarea value={formData.compatibility} onChange={(e) => setFormData({...formData, compatibility: e.target.value})} className="rounded-xl" placeholder="Ex: BMW Série 3 E46 (1998-2005), BMW Série 5 E39 (1995-2003)" rows={2} />
                </div>
              </div>

              {/* Prix et stock */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Prix et stock</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Prix d'achat</Label>
                    <Input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix de vente</Label>
                    <Input type="number" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock min</Label>
                    <Input type="number" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})} className="rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Logistique */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Logistique</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Poids (kg)</Label>
                    <Input type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="rounded-xl" placeholder="Poids en kg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Emplacement</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-xl" placeholder="Ex: Rayon A, Étagère 3" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description / Notes</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-xl" placeholder="Description détaillée de la pièce" rows={2} />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({...formData, isActive: v})} />
                <Label>Pièce active</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700">{editingProduct ? 'Modifier' : 'Créer'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, SKU ou OEM..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl"><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Tableau des pièces */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <ScrollArea className="h-[calc(100vh-350px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Pièce</TableHead>
                <TableHead>SKU / OEM</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Compatibilité</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune pièce trouvée</TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Wrench className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.location && <p className="text-xs text-muted-foreground">📍 {product.location}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{product.sku}</p>
                        {product.oemNumber && <p className="text-xs text-muted-foreground">OEM: {product.oemNumber}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.brand ? <Badge variant="outline" className="rounded-lg">{product.brand}</Badge> : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={product.compatibility || ''}>{product.compatibility || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-green-600">{product.sellingPrice?.toFixed(0) || 0} {currency}</p>
                      {product.warrantyMonths && <p className="text-xs text-muted-foreground">Garantie {product.warrantyMonths} mois</p>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock <= 0 ? 'destructive' : product.stock <= (product.minStock || 10) ? 'secondary' : 'default'} className="rounded-lg">
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)} className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DE GESTION DU STOCK
// ============================================================================

function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'entry' | 'exit' | 'adjustment'>('entry')
  const [adjustmentQty, setAdjustmentQty] = useState(0)
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const { user } = useAuthStore()

  useEffect(() => { fetchData() }, [])

  /**
   * Récupère les produits et les mouvements de stock
   */
  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, movRes] = await Promise.all([
        fetch('/api/products?lowStock=false'), 
        fetch('/api/stock')
      ])
      const [prodData, movData] = await Promise.all([
        prodRes.json(), 
        movRes.json()
      ])
      setProducts(prodData)
      setMovements(movData)
    } catch { 
      toast.error('Erreur de chargement') 
    } finally { 
      setLoading(false) 
    }
  }

  // Liste des produits en stock bas
  const lowStockProducts = products.filter(p => p.stock <= p.minStock)

  /**
   * Enregistre un mouvement de stock
   */
  const handleAdjustment = async () => {
    if (!selectedProduct) return
    try {
      await fetch('/api/stock', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          productId: selectedProduct.id, 
          type: adjustmentType, 
          quantity: adjustmentQty, 
          reason: adjustmentReason, 
          userId: user?.id 
        }) 
      })
      toast.success('Mouvement enregistré')
      setAdjustmentOpen(false)
      fetchData()
    } catch { 
      toast.error('Erreur') 
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Stock</h1>
          <p className="text-muted-foreground">Mouvements et inventaire</p>
        </div>
        <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Mouvement de stock</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Mouvement de stock</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pièce</Label>
                <Select value={selectedProduct?.id || ''} onValueChange={(v) => setSelectedProduct(products.find(p => p.id === v) || null)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sélectionner une pièce" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrée</SelectItem>
                    <SelectItem value="exit">Sortie</SelectItem>
                    <SelectItem value="adjustment">Ajustement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input type="number" value={adjustmentQty} onChange={(e) => setAdjustmentQty(parseInt(e.target.value))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Motif</Label>
                <Input value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} className="rounded-xl" placeholder="Raison du mouvement" />
              </div>
              <Button onClick={handleAdjustment} className="w-full rounded-xl">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertes de stock bas */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes Stock Bas ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">Stock: {p.stock} / Min: {p.minStock}</p>
                  </div>
                  <Badge variant="secondary">{p.stock <= 0 ? 'Rupture' : 'Stock bas'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des mouvements */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Historique des mouvements</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun mouvement enregistré</p>
            ) : (
              <div className="space-y-2">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        m.type === 'entry' ? 'bg-green-100 text-green-600' :
                        m.type === 'exit' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {m.type === 'entry' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{m.product?.name || 'Pièce'}</p>
                        <p className="text-sm text-muted-foreground">{m.reason || m.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${m.type === 'entry' ? 'text-green-600' : m.type === 'exit' ? 'text-red-600' : 'text-blue-600'}`}>
                        {m.type === 'entry' ? '+' : '-'}{m.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DES VENTES (POS)
// ============================================================================

function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [client, setClient] = useState<Client | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const { settings } = useSettingsStore()
  const currency = settings?.currencySymbol || 'FCFA'

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.filter((p: Product) => p.isActive && p.stock > 0))
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.oemNumber || '').toLowerCase().includes(search.toLowerCase())
  )

  /**
   * Ajoute un produit au panier
   */
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Stock insuffisant')
        return
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast.success(`${product.name} ajouté au panier`)
  }

  /**
   * Met à jour la quantité d'un article dans le panier
   */
  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId)
    if (quantity > (product?.stock || 0)) {
      toast.error('Stock insuffisant')
      return
    }
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item))
    }
  }

  // Calcul du total
  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)
  const tax = subtotal * ((settings?.taxRate || 18) / 100)
  const total = subtotal + tax

  /**
   * Finalise la vente
   */
  const handleSale = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide')
      return
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.sellingPrice
          })),
          clientId: client?.id,
          paymentMethod,
          subtotal,
          tax,
          total
        })
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success('Vente enregistrée avec succès')
      setCart([])
      setClient(null)
      fetchProducts()
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Section gauche: Catalogue */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une pièce (nom, SKU, OEM)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Aucune pièce trouvée
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-3">
                    <Wrench className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-green-600">{product.sellingPrice?.toFixed(0)} {currency}</p>
                    <Badge variant="secondary" className="text-xs">{product.stock}</Badge>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Section droite: Panier */}
      <div className="w-96 border-l bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Panier</h2>
          <p className="text-sm text-muted-foreground">{cart.length} article(s)</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Le panier est vide</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sellingPrice?.toFixed(0)} {currency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(0)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TVA ({settings?.taxRate || 18}%)</span>
              <span>{tax.toFixed(0)} {currency}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">{total.toFixed(0)} {currency}</span>
            </div>
          </div>

          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Espèces</SelectItem>
              <SelectItem value="card">Carte</SelectItem>
              <SelectItem value="check">Chèque</SelectItem>
              <SelectItem value="transfer">Virement</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleSale} 
            disabled={cart.length === 0}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Valider la vente
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PAGE DES VENTES (Historique)
// ============================================================================

function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettingsStore()
  const currency = settings?.currencySymbol || 'FCFA'

  useEffect(() => { fetchSales() }, [])

  const fetchSales = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sales')
      const data = await res.json()
      setSales(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Ventes</h1>
        <p className="text-muted-foreground">Historique des ventes</p>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>N° Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune vente enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono">{sale.invoiceNumber}</TableCell>
                    <TableCell>{new Date(sale.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{sale.client?.name || 'Client comptoir'}</TableCell>
                    <TableCell>{sale.items?.length || 0} article(s)</TableCell>
                    <TableCell className="font-bold text-green-600">{sale.total?.toFixed(0)} {currency}</TableCell>
                    <TableCell>
                      <Badge variant={sale.paymentStatus === 'paid' ? 'default' : 'secondary'} className="rounded-lg">
                        {sale.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DES ACHATS
// ============================================================================

function PurchasesPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Achats</h1>
        <p className="text-muted-foreground">Gestion des commandes fournisseurs</p>
      </div>
      <Card className="border-0 shadow-lg rounded-2xl p-8">
        <div className="text-center text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Module de gestion des achats</p>
          <p className="text-sm">Créez vos commandes fournisseurs ici</p>
        </div>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DES CLIENTS
// ============================================================================

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '' })
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingClient ? 'PUT' : 'POST'
      const body = editingClient ? { ...formData, id: editingClient.id } : formData
      const res = await fetch('/api/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error()
      toast.success(editingClient ? 'Client modifié' : 'Client créé')
      setDialogOpen(false)
      resetForm()
      fetchClients()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    try {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
      toast.success('Client supprimé')
      fetchClients()
    } catch {
      toast.error('Erreur')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', city: '' })
    setEditingClient(null)
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || ''
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">{clients.length} clients</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editingClient ? 'Modifier le client' : 'Nouveau client'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="rounded-xl" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700">{editingClient ? 'Modifier' : 'Créer'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : clients.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun client</TableCell></TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>{client.city || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(client)} className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DES FOURNISSEURS
// ============================================================================

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '' })
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  useEffect(() => { fetchSuppliers() }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suppliers')
      const data = await res.json()
      setSuppliers(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingSupplier ? 'PUT' : 'POST'
      const body = editingSupplier ? { ...formData, id: editingSupplier.id } : formData
      const res = await fetch('/api/suppliers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error()
      toast.success(editingSupplier ? 'Fournisseur modifié' : 'Fournisseur créé')
      setDialogOpen(false)
      resetForm()
      fetchSuppliers()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce fournisseur ?')) return
    try {
      await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' })
      toast.success('Fournisseur supprimé')
      fetchSuppliers()
    } catch {
      toast.error('Erreur')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', city: '' })
    setEditingSupplier(null)
  }

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || ''
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground">{suppliers.length} fournisseurs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />Nouveau fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="rounded-xl" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700">{editingSupplier ? 'Modifier' : 'Créer'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun fournisseur</TableCell></TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.city || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)} className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)} className="rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DES RAPPORTS
// ============================================================================

function ReportsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">Statistiques et analyses</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg rounded-2xl p-6">
          <BarChart3 className="w-8 h-8 text-green-600 mb-4" />
          <h3 className="font-semibold">Ventes</h3>
          <p className="text-sm text-muted-foreground">Rapport des ventes</p>
        </Card>
        <Card className="border-0 shadow-lg rounded-2xl p-6">
          <Package className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="font-semibold">Stock</h3>
          <p className="text-sm text-muted-foreground">État du stock</p>
        </Card>
        <Card className="border-0 shadow-lg rounded-2xl p-6">
          <Users className="w-8 h-8 text-purple-600 mb-4" />
          <h3 className="font-semibold">Clients</h3>
          <p className="text-sm text-muted-foreground">Analyse clients</p>
        </Card>
        <Card className="border-0 shadow-lg rounded-2xl p-6">
          <Truck className="w-8 h-8 text-orange-600 mb-4" />
          <h3 className="font-semibold">Fournisseurs</h3>
          <p className="text-sm text-muted-foreground">Performance fournisseurs</p>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// PAGE DES UTILISATEURS
// ============================================================================

function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground">Gestion des comptes utilisateurs</p>
      </div>
      <Card className="border-0 shadow-lg rounded-2xl">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>Nom</TableHead>
                <TableHead>Nom d'utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun utilisateur</TableCell></TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || '-'}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'} className="rounded-lg">
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ============================================================================
// PAGE DES PARAMÈTRES
// ============================================================================

function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const { setSettings: setGlobalSettings } = useSettingsStore()

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
      setGlobalSettings(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updates: Partial<Settings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, ...updates })
      })
      const data = await res.json()
      setSettings(data)
      setGlobalSettings(data)
      toast.success('Paramètres enregistrés')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configuration de l'application</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TabsTrigger value="general" className="rounded-lg">Général</TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg">Entreprise</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg">Facturation</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>Configuration de base de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Input 
                    value={settings?.currency || 'XOF'} 
                    onChange={(e) => setSettings({ ...settings!, currency: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Symbole</Label>
                  <Input 
                    value={settings?.currencySymbol || 'FCFA'} 
                    onChange={(e) => setSettings({ ...settings!, currencySymbol: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Taux TVA (%)</Label>
                <Input 
                  type="number"
                  value={settings?.taxRate || 18} 
                  onChange={(e) => setSettings({ ...settings!, taxRate: parseFloat(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={settings?.taxEnabled || false} 
                  onCheckedChange={(v) => setSettings({ ...settings!, taxEnabled: v })}
                />
                <Label>Activer la TVA</Label>
              </div>
              <Button onClick={() => handleSave({})} className="rounded-xl bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Informations entreprise</CardTitle>
              <CardDescription>Coordonnées de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l'entreprise</Label>
                <Input 
                  value={settings?.companyName || ''} 
                  onChange={(e) => setSettings({ ...settings!, companyName: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    value={settings?.companyPhone || ''} 
                    onChange={(e) => setSettings({ ...settings!, companyPhone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={settings?.companyEmail || ''} 
                    onChange={(e) => setSettings({ ...settings!, companyEmail: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Textarea 
                  value={settings?.companyAddress || ''} 
                  onChange={(e) => setSettings({ ...settings!, companyAddress: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button onClick={() => handleSave({})} className="rounded-xl bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Paramètres de facturation</CardTitle>
              <CardDescription>Préfixes et numérotation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Préfixe facture</Label>
                  <Input 
                    value={settings?.invoicePrefix || 'FAC'} 
                    onChange={(e) => setSettings({ ...settings!, invoicePrefix: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Préfixe achat</Label>
                  <Input 
                    value={settings?.purchasePrefix || 'ACH'} 
                    onChange={(e) => setSettings({ ...settings!, purchasePrefix: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button onClick={() => handleSave({})} className="rounded-xl bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// COMPOSANT PRINCIPAL DE L'APPLICATION
// ============================================================================

export default function App() {
  // États globaux de l'application
  const { user, isAuthenticated, loading, login, logout, checkAuth } = useAuthStore()
  const { currentPage, setCurrentPage } = useUIStore()
  const { setSettings } = useSettingsStore()
  const [mounted, setMounted] = useState(false)

  // Initialisation au chargement de l'application
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    checkAuth()
    // Chargement des paramètres
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error)
  }, [checkAuth, setSettings])

  // Affichage du chargement pendant l'hydratation
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg animate-pulse">
            <Car className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si non connecté, afficher la page de connexion
  if (!isAuthenticated) return <LoginPage onLogin={login} />

  /**
   * Rendu de la page courante selon l'état de navigation
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />
      case 'pos': return <POSPage />
      case 'products': return <ProductsPage />
      case 'stock': return <StockPage />
      case 'sales': return <SalesPage />
      case 'purchases': return <PurchasesPage />
      case 'clients': return <ClientsPage />
      case 'suppliers': return <SuppliersPage />
      case 'reports': return <ReportsPage />
      case 'users': return <UsersPage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barre de navigation */}
      <HeaderNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Contenu de la page avec animation de transition */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={currentPage} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }} 
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
