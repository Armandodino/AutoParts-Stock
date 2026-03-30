'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck, BarChart3, Settings as SettingsIcon,
  LogOut, Bell, Search, ChevronDown, Plus, Edit, Trash2, Download, Upload,
  TrendingUp, AlertTriangle, CheckCircle, DollarSign, Box,
  Moon, Sun, User, Save, RefreshCw,
  ArrowUpRight, ArrowDownRight, Building, FileText,
  Lock, Eye, EyeOff
} from 'lucide-react'

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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

import { useAuthStore, useSettingsStore, useCartStore, useUIStore } from '@/lib/store'
import type { Product, Category, Unit, Client, Supplier, Sale, Purchase, Settings } from '@/lib/store'

// ==================== LOGIN PAGE ====================
function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        return
      }
      
      onLogin(data.user)
      toast.success(`Bienvenue, ${data.user.name || data.user.username}!`)
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-500 to-teal-400">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
                <img src="/logo.jpeg" alt="Jooman" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Jooman</h1>
                <p className="text-white/80 text-lg">Stock</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-6">
              <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight">
                Bienvenue<br />
                <span className="text-white/90">sur Jooman Stock !</span>
              </h2>
              
              <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                La solution complète de gestion de stock pour votre entreprise. Simple, efficace et 100% hors-ligne.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: Package, text: 'Gestion des stocks' },
                  { icon: BarChart3, text: 'Statistiques' },
                  { icon: ShoppingCart, text: 'Point de vente' },
                  { icon: Truck, text: 'Fournisseurs' }
                ].map((feature, i) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                <img src="/logo.jpeg" alt="Jooman" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-green-600">Jooman</h1>
                <p className="text-sm text-muted-foreground">Stock</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 pb-4 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
              <CardDescription className="text-center">
                Entrez vos identifiants pour accéder à votre espace
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-5">
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

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-center text-sm text-muted-foreground">
                  Pas de compte ?{' '}
                  <span className="text-green-600 font-medium">Contactez l'administrateur</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Copyright */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2026 Jooman. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// ==================== HEADER NAVIGATION ====================
function HeaderNav({ currentPage, setCurrentPage }: {
  currentPage: string
  setCurrentPage: (page: string) => void
}) {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  // Use a state that starts as false on server, true on client after hydration
  const [mounted, setMounted] = useState(false)

  // This pattern is necessary for proper SSR hydration with theme
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pos', label: 'Point de vente', icon: ShoppingCart },
    { id: 'products', label: 'Produits', icon: Package },
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
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3 mr-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
            <img src="/logo.jpeg" alt="Jooman" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Jooman</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Stock</p>
          </div>
        </motion.div>

        {/* Navigation Icons */}
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

        {/* Right Side */}
        <div className="flex items-center gap-2 ml-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-xl">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </Button>

          {/* Theme Toggle */}
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

          {/* User Menu */}
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

// ==================== DASHBOARD PAGE ====================
function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSettingsStore()
  const setCurrentPage = useUIStore((s) => s.setCurrentPage)

  useEffect(() => {
    fetchDashboardData()
  }, [])

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

  const currency = settings?.currencySymbol || 'FCFA'
  const sparklineData = stats?.salesByDay?.map((d: any) => d.revenue || 0) || [0, 0, 0, 0, 0, 0, 0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-6 md:p-8 shadow-2xl shadow-green-500/20"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
              >
                <LayoutDashboard className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Bonjour, {settings?.companyName || 'Entreprise'}
                </h1>
                <p className="text-white/80 text-sm md:text-base mt-1">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchDashboardData} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards - Premium Design */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Revenue Card */}
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

          {/* Sales Card */}
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

          {/* Products Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full">
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl h-full flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full -translate-y-20 translate-x-20 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="relative p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                    <Package className="w-6 h-6" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 rounded-full px-3">
                    Inventaire
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Produits en stock</p>
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

          {/* Alerts Card */}
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

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShoppingCart, label: 'Nouvelle vente', color: 'from-green-500 to-emerald-600', page: 'pos' },
              { icon: Package, label: 'Ajouter produit', color: 'from-blue-500 to-indigo-600', page: 'products' },
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

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Chart */}
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

          {/* Top Products */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Card className="border-0 shadow-xl rounded-2xl h-full bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  Top Produits
                </CardTitle>
                <CardDescription>Les plus vendus</CardDescription>
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
                        <p className="font-medium text-sm truncate">{product?.name || 'Produit'}</p>
                        <p className="text-xs text-muted-foreground">{product?.sku || ''}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {product?.totalSold || 0}
                      </Badge>
                    </motion.div>
                  ))}
                  {(!stats?.topProducts || stats.topProducts.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">Aucune vente</p>
                      <Button variant="link" className="text-green-600 dark:text-green-400 mt-2" onClick={() => setCurrentPage('pos')}>
                        Commencer à vendre
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stock Alerts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <Card className="border-0 shadow-xl rounded-2xl bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-white">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  Alertes de stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {(stats?.lowStockAlerts || []).map((product: Product, index: number) => (
                      <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${product.stock <= 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                            <Package className={`w-5 h-5 ${product.stock <= 0 ? 'text-red-600' : 'text-amber-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                        </div>
                        <Badge variant={product.stock <= 0 ? 'destructive' : 'secondary'} className="rounded-lg">
                          {product.stock} restants
                        </Badge>
                      </motion.div>
                    ))}
                    {(!stats?.lowStockAlerts || stats.lowStockAlerts.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="font-medium text-green-600">Tout va bien !</p>
                        <p className="text-muted-foreground text-sm mt-1">Aucune alerte</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <Card className="border-0 shadow-xl rounded-2xl bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  Activités récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-1">
                    {(stats?.recentActivities || []).map((activity: any, index: number) => (
                      <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.action === 'create' ? 'bg-green-100 dark:bg-green-900/30' :
                          activity.action === 'update' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          activity.action === 'delete' ? 'bg-red-100 dark:bg-red-900/30' : 
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {activity.action === 'create' && <Plus className="w-4 h-4 text-green-600" />}
                          {activity.action === 'update' && <Edit className="w-4 h-4 text-blue-600" />}
                          {activity.action === 'delete' && <Trash2 className="w-4 h-4 text-red-600" />}
                          {activity.action === 'restore' && <Upload className="w-4 h-4 text-purple-600" />}
                          {!['create', 'update', 'delete', 'restore'].includes(activity.action) && <FileText className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.details}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(activity.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">Aucune activité</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ==================== POS PAGE ====================
function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { items, client, discount, paymentMethod, addItem, removeItem, updateQuantity, setClient, setDiscount, setPaymentMethod, clearCart, getSubtotal, getTax, getTotal } = useCartStore()
  const { user } = useAuthStore()
  const { settings } = useSettingsStore()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [prodRes, clientRes] = await Promise.all([fetch('/api/products'), fetch('/api/clients')])
      const [prodData, clientData] = await Promise.all([prodRes.json(), clientRes.json()])
      setProducts(prodData)
      setClients(clientData)
    } catch (err) {
      toast.error('Erreur de chargement')
    }
  }

  const filteredProducts = products.filter(p => 
    p.isActive && (p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search)))
  )

  const handleCheckout = async () => {
    if (items.length === 0) { toast.error('Le panier est vide'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ productId: item.product.id, quantity: item.quantity, unitPrice: item.product.sellingPrice })),
          clientId: client?.id || null, discount, paymentMethod, userId: user?.id
        })
      })
      if (!res.ok) throw new Error()
      const sale = await res.json()
      toast.success(`Vente enregistrée: ${sale.invoiceNumber}`)
      clearCart()
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const currency = settings?.currencySymbol || '€'

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-4 p-6">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 rounded-xl" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addItem(product)}
                className="p-3 rounded-xl border bg-card hover:border-green-500 hover:shadow-lg transition-all text-left"
              >
                <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 mb-2 flex items-center justify-center overflow-hidden">
                  {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground" />}
                </div>
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-lg font-bold text-green-600">{product.sellingPrice.toFixed(2)} {currency}</p>
                <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="w-full lg:w-96 flex flex-col border-0 shadow-xl">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center justify-between">
            <span>Panier</span>
            {items.length > 0 && <Button variant="ghost" size="sm" onClick={clearCart}>Vider</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between rounded-xl">{client ? client.name : 'Sélectionner un client'}<ChevronDown className="w-4 h-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-80"><Command>
              <CommandInput placeholder="Rechercher un client..." />
              <CommandList>
                <CommandEmpty>Aucun client</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => setClient(null)}>Aucun client</CommandItem>
                  {clients.map((c) => (<CommandItem key={c.id} onSelect={() => setClient(c)}>{c.name}</CommandItem>))}
                </CommandGroup>
              </CommandList>
            </Command></PopoverContent>
          </Popover>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.product.sellingPrice.toFixed(2)} {currency}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.product.id)}>×</Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Mode de paiement</Label>
            <div className="grid grid-cols-4 gap-2">
              {['cash', 'card', 'check', 'transfer'].map((m) => (
                <Button key={m} variant={paymentMethod === m ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setPaymentMethod(m as any)}>
                  {m === 'cash' ? 'Espèces' : m === 'card' ? 'Carte' : m === 'check' ? 'Chèque' : 'Virement'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label className="flex-1">Remise</Label>
            <Input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-20 rounded-xl" min="0" />
            <span className="text-sm">{currency}</span>
          </div>

          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Sous-total</span><span>{getSubtotal().toFixed(2)} {currency}</span></div>
            {settings?.taxEnabled && <div className="flex justify-between"><span>TVA ({settings?.taxRate}%)</span><span>{getTax().toFixed(2)} {currency}</span></div>}
            {discount > 0 && <div className="flex justify-between text-red-500"><span>Remise</span><span>-{discount.toFixed(2)} {currency}</span></div>}
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-green-600">{getTotal().toFixed(2)} {currency}</span></div>
          </div>

          <Button size="lg" className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" disabled={items.length === 0 || loading} onClick={handleCheckout}>
            {loading ? 'Traitement...' : <><CheckCircle className="w-5 h-5 mr-2" />Valider la vente</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== PRODUCTS PAGE ====================
function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<any>({ 
    name: '', sku: '', barcode: '', description: '', categoryId: '', unitId: '', 
    purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 10, maxStock: '', isActive: true,
    // Champs pièces auto
    oemNumber: '', oemNumbers: '', brand: '', compatibility: '', warrantyMonths: '', weight: '', location: ''
  })
  const { settings } = useSettingsStore()
  const currency = settings?.currencySymbol || '€'

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, unitRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories'), fetch('/api/units')])
      const [prodData, catData, unitData] = await Promise.all([prodRes.json(), catRes.json(), unitRes.json()])
      setProducts(prodData); setCategories(catData); setUnits(unitData)
    } catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct ? { ...formData, id: editingProduct.id } : formData
      const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const error = await res.json(); throw new Error(error.error) }
      toast.success(editingProduct ? 'Produit modifié' : 'Produit créé')
      setDialogOpen(false); resetForm(); fetchData()
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    try { await fetch(`/api/products?id=${id}`, { method: 'DELETE' }); toast.success('Produit supprimé'); fetchData() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  const resetForm = () => { 
    setFormData({ 
      name: '', sku: '', barcode: '', description: '', categoryId: '', unitId: '', 
      purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 10, maxStock: '', isActive: true,
      oemNumber: '', oemNumbers: '', brand: '', compatibility: '', warrantyMonths: '', weight: '', location: ''
    }); 
    setEditingProduct(null) 
  }
  const openEdit = (product: Product) => { 
    setEditingProduct(product); 
    setFormData({ 
      name: product.name, sku: product.sku, barcode: product.barcode || '', description: product.description || '', 
      categoryId: product.categoryId || '', unitId: product.unitId || '', 
      purchasePrice: product.purchasePrice, sellingPrice: product.sellingPrice, 
      stock: product.stock, minStock: product.minStock, maxStock: product.maxStock || '', isActive: product.isActive,
      oemNumber: product.oemNumber || '', oemNumbers: product.oemNumbers || '', brand: product.brand || '',
      compatibility: product.compatibility || '', warrantyMonths: product.warrantyMonths || '', 
      weight: product.weight || '', location: product.location || ''
    }); 
    setDialogOpen(true) 
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pièces Automobiles</h1>
          <p className="text-muted-foreground">{products.length} pièces en catalogue</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild><Button className="rounded-xl bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-2" />Nouvelle pièce</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader><DialogTitle>{editingProduct ? 'Modifier la pièce' : 'Nouvelle pièce'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informations générales */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nom de la pièce *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-xl" placeholder="Ex: Plaquettes de frein AV" /></div>
                  <div className="space-y-2"><Label>SKU / Référence *</Label><Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required className="rounded-xl" placeholder="Ex: FRE-BMW-001" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Code-barres</Label><Input value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} className="rounded-xl" placeholder="Code-barres du produit" /></div>
                  <div className="space-y-2"><Label>Catégorie</Label>
                    <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Références pièces auto */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Références constructeur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>N° OEM principal</Label><Input value={formData.oemNumber} onChange={(e) => setFormData({...formData, oemNumber: e.target.value})} className="rounded-xl" placeholder="Ex: 34116762430" /></div>
                  <div className="space-y-2"><Label>Autres OEM</Label><Input value={formData.oemNumbers} onChange={(e) => setFormData({...formData, oemNumbers: e.target.value})} className="rounded-xl" placeholder="OEM additionnels (séparés par ,)" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Marque de la pièce</Label><Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="rounded-xl" placeholder="Ex: Bosch, Brembo, Valeo" /></div>
                  <div className="space-y-2"><Label>Garantie (mois)</Label><Input type="number" value={formData.warrantyMonths} onChange={(e) => setFormData({...formData, warrantyMonths: e.target.value})} className="rounded-xl" placeholder="Ex: 12" /></div>
                </div>
              </div>

              {/* Compatibilité */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Compatibilité véhicules</h3>
                <div className="space-y-2"><Label>Véhicules compatibles</Label><Textarea value={formData.compatibility} onChange={(e) => setFormData({...formData, compatibility: e.target.value})} className="rounded-xl" placeholder="Ex: BMW Série 3 E46 (1998-2005), BMW Série 5 E39 (1995-2003)" rows={2} /></div>
              </div>

              {/* Prix et stock */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Prix et stock</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2"><Label>Prix d'achat</Label><Input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})} className="rounded-xl" /></div>
                  <div className="space-y-2"><Label>Prix de vente</Label><Input type="number" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})} className="rounded-xl" /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} className="rounded-xl" /></div>
                  <div className="space-y-2"><Label>Stock min</Label><Input type="number" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})} className="rounded-xl" /></div>
                </div>
              </div>

              {/* Logistique */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Logistique</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Poids (kg)</Label><Input type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="rounded-xl" placeholder="Poids en kg" /></div>
                  <div className="space-y-2"><Label>Emplacement</Label><Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-xl" placeholder="Ex: Rayon A, Étagère 3" /></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-2"><Label>Description / Notes</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-xl" placeholder="Description détaillée de la pièce" rows={2} /></div>
              </div>

              <div className="flex items-center gap-2"><Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({...formData, isActive: v})} /><Label>Produit actif</Label></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button><Button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700">{editingProduct ? 'Modifier' : 'Créer'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl"><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes catégories</SelectItem>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>

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
              {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow> :
               filteredProducts.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune pièce trouvée</TableCell></TableRow> :
               filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-5 h-5 text-muted-foreground" />}
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
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ==================== STOCK PAGE ====================
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, movRes] = await Promise.all([fetch('/api/products?lowStock=false'), fetch('/api/stock')])
      const [prodData, movData] = await Promise.all([prodRes.json(), movRes.json()])
      setProducts(prodData); setMovements(movData)
    } catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const lowStockProducts = products.filter(p => p.stock <= p.minStock)

  const handleAdjustment = async () => {
    if (!selectedProduct) return
    try {
      await fetch('/api/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: selectedProduct.id, type: adjustmentType, quantity: adjustmentQty, reason: adjustmentReason, userId: user?.id }) })
      toast.success('Mouvement enregistré'); setAdjustmentOpen(false); fetchData()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Stock</h1>
          <p className="text-muted-foreground">Mouvements et inventaire</p>
        </div>
        <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Mouvement de stock</Button></DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Mouvement de stock</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Produit</Label>
                <Select value={selectedProduct?.id || ''} onValueChange={(v) => setSelectedProduct(products.find(p => p.id === v) || null)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sélectionner un produit" /></SelectTrigger>
                  <SelectContent>{products.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Type</Label>
                <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrée</SelectItem>
                    <SelectItem value="exit">Sortie</SelectItem>
                    <SelectItem value="adjustment">Ajustement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Quantité</Label><Input type="number" value={adjustmentQty} onChange={(e) => setAdjustmentQty(parseInt(e.target.value))} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Raison</Label><Input value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} className="rounded-xl" /></div>
              <Button onClick={handleAdjustment} className="w-full rounded-xl">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockProducts.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Alerte stock</AlertTitle>
          <AlertDescription>{lowStockProducts.length} produit(s) en stock faible ou en rupture</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle>État du stock</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="p-3 rounded-xl border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">Min: {product.minStock}</p></div>
                      <Badge variant={product.stock <= 0 ? 'destructive' : product.stock <= product.minStock ? 'secondary' : 'default'} className="rounded-lg">{product.stock}</Badge>
                    </div>
                    <Progress value={product.maxStock ? (product.stock / product.maxStock) * 100 : (product.stock / (product.minStock * 3)) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle>Mouvements récents</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {movements.map((mov) => (
                  <div key={mov.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mov.type === 'entry' ? 'bg-green-500/10 text-green-500' : mov.type === 'exit' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {mov.type === 'entry' ? <ArrowUpRight className="w-5 h-5" /> : mov.type === 'exit' ? <ArrowDownRight className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    </div>
                    <div className="flex-1"><p className="font-medium">{mov.product?.name}</p><p className="text-sm text-muted-foreground">{mov.reason || mov.type}</p></div>
                    <div className="text-right">
                      <p className={`font-bold ${mov.type === 'entry' ? 'text-green-500' : mov.type === 'exit' ? 'text-red-500' : ''}`}>{mov.type === 'entry' ? '+' : mov.type === 'exit' ? '-' : ''}{mov.quantity}</p>
                      <p className="text-xs text-muted-foreground">{new Date(mov.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
                {movements.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun mouvement</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== SALES PAGE ====================
function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettingsStore()
  const setCurrentPage = useUIStore((s) => s.setCurrentPage)
  const currency = settings?.currencySymbol || '€'

  useEffect(() => { fetchSales() }, [])

  const fetchSales = async () => {
    setLoading(true)
    try { const res = await fetch('/api/sales'); setSales(await res.json()) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Ventes</h1><p className="text-muted-foreground">Historique des ventes</p></div>
        <Button onClick={() => setCurrentPage('pos')} className="rounded-xl"><ShoppingCart className="w-4 h-4 mr-2" />Nouvelle vente</Button>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>N° Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow> :
               sales.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune vente</TableCell></TableRow> :
               sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-mono">{sale.invoiceNumber}</TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleString('fr-FR')}</TableCell>
                  <TableCell>{sale.client?.name || 'Client anonyme'}</TableCell>
                  <TableCell>{sale.user?.name || sale.user?.username}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">{sale.total.toFixed(2)} {currency}</TableCell>
                  <TableCell><Badge variant="outline" className="rounded-lg">{sale.paymentMethod === 'cash' ? 'Espèces' : sale.paymentMethod === 'card' ? 'Carte' : sale.paymentMethod === 'check' ? 'Chèque' : 'Virement'}</Badge></TableCell>
                  <TableCell><Badge variant={sale.paymentStatus === 'paid' ? 'default' : 'secondary'} className="rounded-lg">{sale.paymentStatus === 'paid' ? 'Payé' : 'En attente'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ==================== PURCHASES PAGE ====================
function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettingsStore()
  const { user } = useAuthStore()
  const currency = settings?.currencySymbol || '€'

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try { const res = await fetch('/api/purchases'); setPurchases(await res.json()) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try { await fetch('/api/purchases', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, userId: user?.id }) }); toast.success('Statut mis à jour'); fetchData() }
    catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Achats</h1><p className="text-muted-foreground">Gestion des commandes fournisseurs</p></div>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead>N° Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow> :
               purchases.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun achat</TableCell></TableRow> :
               purchases.map((purchase) => (
                <TableRow key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-mono">{purchase.purchaseNumber}</TableCell>
                  <TableCell>{new Date(purchase.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{purchase.supplier?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right font-bold">{purchase.total.toFixed(2)} {currency}</TableCell>
                  <TableCell><Badge variant={purchase.status === 'received' ? 'default' : purchase.status === 'pending' ? 'secondary' : 'destructive'} className="rounded-lg">{purchase.status === 'received' ? 'Reçu' : purchase.status === 'pending' ? 'En attente' : 'Annulé'}</Badge></TableCell>
                  <TableCell className="text-right">
                    {purchase.status === 'pending' && <Button size="sm" className="rounded-xl" onClick={() => handleStatusUpdate(purchase.id, 'received')}><CheckCircle className="w-4 h-4 mr-1" />Marquer reçu</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ==================== CLIENTS PAGE ====================
function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '' })

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    setLoading(true)
    try { const res = await fetch('/api/clients'); setClients(await res.json()) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingClient ? 'PUT' : 'POST'
      const body = editingClient ? { ...formData, id: editingClient.id } : formData
      await fetch('/api/clients', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      toast.success(editingClient ? 'Client modifié' : 'Client créé'); setDialogOpen(false); resetForm(); fetchClients()
    } catch { toast.error('Erreur') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    try { await fetch(`/api/clients?id=${id}`, { method: 'DELETE' }); toast.success('Client supprimé'); fetchClients() }
    catch { toast.error('Erreur') }
  }

  const resetForm = () => { setFormData({ name: '', email: '', phone: '', address: '', city: '', country: '' }); setEditingClient(null) }
  const openEdit = (client: Client) => { setEditingClient(client); setFormData({ name: client.name, email: client.email || '', phone: client.phone || '', address: client.address || '', city: client.city || '', country: client.country || '' }); setDialogOpen(true) }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Clients</h1><p className="text-muted-foreground">{clients.length} clients</p></div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Nouveau client</Button></DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editingClient ? 'Modifier le client' : 'Nouveau client'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-xl" /></div>
              </div>
              <div className="space-y-2"><Label>Adresse</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Ville</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Pays</Label><Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="rounded-xl" /></div>
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button><Button type="submit" className="rounded-xl">{editingClient ? 'Modifier' : 'Créer'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
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
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow> :
             clients.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun client</TableCell></TableRow> :
             clients.map((client) => (
              <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell>{client.city || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(client)} className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// ==================== SUPPLIERS PAGE ====================
function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '' })

  useEffect(() => { fetchSuppliers() }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try { const res = await fetch('/api/suppliers'); setSuppliers(await res.json()) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingSupplier ? 'PUT' : 'POST'
      const body = editingSupplier ? { ...formData, id: editingSupplier.id } : formData
      await fetch('/api/suppliers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      toast.success(editingSupplier ? 'Fournisseur modifié' : 'Fournisseur créé'); setDialogOpen(false); resetForm(); fetchSuppliers()
    } catch { toast.error('Erreur') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce fournisseur ?')) return
    try { await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' }); toast.success('Fournisseur supprimé'); fetchSuppliers() }
    catch { toast.error('Erreur') }
  }

  const resetForm = () => { setFormData({ name: '', email: '', phone: '', address: '', city: '', country: '' }); setEditingSupplier(null) }
  const openEdit = (supplier: Supplier) => { setEditingSupplier(supplier); setFormData({ name: supplier.name, email: supplier.email || '', phone: supplier.phone || '', address: supplier.address || '', city: supplier.city || '', country: supplier.country || '' }); setDialogOpen(true) }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Fournisseurs</h1><p className="text-muted-foreground">{suppliers.length} fournisseurs</p></div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Nouveau fournisseur</Button></DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-xl" /></div>
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button><Button type="submit" className="rounded-xl">{editingSupplier ? 'Modifier' : 'Créer'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
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
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow> :
             suppliers.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun fournisseur</TableCell></TableRow> :
             suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.email || '-'}</TableCell>
                <TableCell>{supplier.phone || '-'}</TableCell>
                <TableCell>{supplier.city || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)} className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)} className="rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// ==================== REPORTS PAGE ====================
function ReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSettingsStore()
  const currency = settings?.currencySymbol || '€'

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try { const res = await fetch('/api/dashboard'); setStats(await res.json()) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 animate-spin" /></div>

  const profit = (stats?.sales?.totalRevenue || 0) - (stats?.purchases?.totalAmount || 0)
  const pieData = [
    { name: 'Ventes', value: stats?.sales?.totalRevenue || 0, color: '#22c55e' },
    { name: 'Achats', value: stats?.purchases?.totalAmount || 0, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Rapports</h1><p className="text-muted-foreground">Statistiques et analyses</p></div>
        <Button variant="outline" className="rounded-xl"><Download className="w-4 h-4 mr-2" />Exporter PDF</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle className="text-sm">Revenus totaux</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">{(stats?.sales?.totalRevenue || 0).toFixed(2)} {currency}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle className="text-sm">Dépenses totales</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-500">{(stats?.purchases?.totalAmount || 0).toFixed(2)} {currency}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle className="text-sm">Bénéfice net</CardTitle></CardHeader>
          <CardContent><p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{profit.toFixed(2)} {currency}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle>Répartition financière</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `${Number(value).toFixed(2)} ${currency}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader><CardTitle>Évolution des ventes</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.salesByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => `${Number(value).toFixed(2)} ${currency}`} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== USERS PAGE ====================
function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({ username: '', email: '', name: '', password: '', role: 'cashier', isActive: true })
  const { user: currentUser } = useAuthStore()

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try { const res = await fetch('/api/users'); setUsers(await res.json()) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingUser ? 'PUT' : 'POST'
      const body = editingUser ? { ...formData, id: editingUser.id } : formData
      const res = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const error = await res.json(); throw new Error(error.error) }
      toast.success(editingUser ? 'Utilisateur modifié' : 'Utilisateur créé'); setDialogOpen(false); resetForm(); fetchUsers()
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) { toast.error('Vous ne pouvez pas supprimer votre propre compte'); return }
    if (!confirm('Supprimer cet utilisateur ?')) return
    try { await fetch(`/api/users?id=${id}`, { method: 'DELETE' }); toast.success('Utilisateur supprimé'); fetchUsers() }
    catch { toast.error('Erreur') }
  }

  const resetForm = () => { setFormData({ username: '', email: '', name: '', password: '', role: 'cashier', isActive: true }); setEditingUser(null) }
  const openEdit = (user: any) => { setEditingUser(user); setFormData({ username: user.username, email: user.email, name: user.name || '', password: '', role: user.role, isActive: user.isActive }); setDialogOpen(true) }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Utilisateurs</h1><p className="text-muted-foreground">{users.length} utilisateurs</p></div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Nouvel utilisateur</Button></DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom d'utilisateur *</Label><Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom complet</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Mot de passe {editingUser ? '(laisser vide pour garder)' : '*'}</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingUser} className="rounded-xl" /></div>
              </div>
              <div className="space-y-2"><Label>Rôle</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Gestionnaire</SelectItem>
                    <SelectItem value="cashier">Caissier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({...formData, isActive: v})} /><Label>Compte actif</Label></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button><Button type="submit" className="rounded-xl">{editingUser ? 'Modifier' : 'Créer'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow> :
             users.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun utilisateur</TableCell></TableRow> :
             users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-green-500/20"><AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm">{user.name?.[0] || user.username[0].toUpperCase()}</AvatarFallback></Avatar>
                    <div><p className="font-medium">{user.name || user.username}</p><p className="text-xs text-muted-foreground">@{user.username}</p></div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'} className="rounded-lg capitalize">{user.role}</Badge></TableCell>
                <TableCell><Badge variant={user.isActive ? 'default' : 'secondary'} className="rounded-lg">{user.isActive ? 'Actif' : 'Inactif'}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(user)} className="rounded-lg"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} disabled={user.id === currentUser?.id} className="rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// ==================== BACKUP LIST COMPONENT ====================
function BackupList() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBackups() }, [])

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backup')
      setBackups(await res.json())
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (filename: string) => {
    if (!confirm('Restaurer cette sauvegarde ? Les données actuelles seront sauvegardées.')) return
    try {
      const res = await fetch('/api/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })
      toast.success((await res.json()).message)
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      toast.error('Erreur lors de la restauration')
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm('Supprimer cette sauvegarde ?')) return
    try {
      await fetch(`/api/backup?filename=${filename}`, { method: 'DELETE' })
      toast.success('Sauvegarde supprimée')
      fetchBackups()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) return <div className="flex items-center justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>

  if (backups.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Aucune sauvegarde disponible</p>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {backups.map((backup) => (
          <div key={backup.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{backup.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(backup.createdAt).toLocaleString('fr-FR')} • {formatSize(backup.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = `/api/backup?download=${backup.filename}`}
                className="rounded-lg"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRestore(backup.filename)}
                className="rounded-lg text-blue-500 hover:text-blue-600"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDelete(backup.filename)}
                className="rounded-lg text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// ==================== SECURITY SETTINGS ====================
function SecuritySettings() {
  const { user } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    const hasUpper = /[A-Z]/.test(newPassword)
    const hasLower = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    
    if (!hasUpper || !hasLower || !hasNumber) {
      toast.error('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors du changement de mot de passe')
        return
      }
      
      toast.success('Mot de passe modifié avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <User className="w-5 h-5" />
            </div>
            Changer le mot de passe
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            
            {/* Password Requirements */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Exigences du mot de passe :</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                  {newPassword.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border" />}
                  Au moins 8 caractères
                </li>
                <li className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                  {/[A-Z]/.test(newPassword) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border" />}
                  Au moins une majuscule
                </li>
                <li className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                  {/[a-z]/.test(newPassword) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border" />}
                  Au moins une minuscule
                </li>
                <li className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                  {/[0-9]/.test(newPassword) ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border" />}
                  Au moins un chiffre
                </li>
              </ul>
            </div>
            
            <Button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <User className="w-5 h-5" />
            </div>
            Informations du compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Nom d'utilisateur</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{user?.email || 'Non défini'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Nom complet</p>
              <p className="font-medium">{user?.name || 'Non défini'}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Rôle</p>
              <Badge className="capitalize">{user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            Conseils de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              Utilisez un mot de passe unique pour ce compte
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              Ne partagez jamais vos identifiants avec d'autres personnes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              Changez votre mot de passe régulièrement
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              Déconnectez-vous après chaque session sur un ordinateur partagé
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== SETTINGS PAGE ====================
function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { theme, setTheme } = useTheme()
  const { setSettings: setGlobalSettings } = useSettingsStore()

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try { const res = await fetch('/api/settings'); const data = await res.json(); setSettings(data); setGlobalSettings(data) }
    catch { toast.error('Erreur de chargement') } finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try { const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }); const data = await res.json(); setSettings(data); setGlobalSettings(data); toast.success('Paramètres enregistrés') }
    catch { toast.error('Erreur lors de l\'enregistrement') } finally { setSaving(false) }
  }

  const handleBackup = async () => {
    try { 
      const res = await fetch('/api/backup', { method: 'POST' })
      const data = await res.json()
      toast.success(data.message)
    } catch { toast.error('Erreur lors de la sauvegarde') }
  }

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div><h1 className="text-3xl font-bold">Paramètres</h1><p className="text-muted-foreground">Configuration de l'application</p></div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl">
          <TabsTrigger value="company" className="rounded-lg">Entreprise</TabsTrigger>
          <TabsTrigger value="invoice" className="rounded-lg">Facturation</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Sécurité</TabsTrigger>
          <TabsTrigger value="backup" className="rounded-lg">Sauvegarde</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader><CardTitle>Informations de l'entreprise</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom de l'entreprise</Label><Input value={settings?.companyName || ''} onChange={(e) => setSettings({ ...settings!, companyName: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={settings?.companyEmail || ''} onChange={(e) => setSettings({ ...settings!, companyEmail: e.target.value })} className="rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Téléphone</Label><Input value={settings?.companyPhone || ''} onChange={(e) => setSettings({ ...settings!, companyPhone: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Adresse</Label><Input value={settings?.companyAddress || ''} onChange={(e) => setSettings({ ...settings!, companyAddress: e.target.value })} className="rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Devise</Label>
                  <Select value={settings?.currency || 'XOF'} onValueChange={(v) => setSettings({ ...settings!, currency: v, currencySymbol: v === 'XOF' ? 'FCFA' : v === 'EUR' ? '€' : v === 'USD' ? '$' : v === 'GBP' ? '£' : v === 'MAD' ? 'DH' : v === 'GNF' ? 'GNF' : 'FCFA' })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">Franc CFA (FCFA)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar US ($)</SelectItem>
                      <SelectItem value="GBP">Livre (£)</SelectItem>
                      <SelectItem value="MAD">Dirham (DH)</SelectItem>
                      <SelectItem value="GNF">Franc GN (GNF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Symbole</Label><Input value={settings?.currencySymbol || 'FCFA'} onChange={(e) => setSettings({ ...settings!, currencySymbol: e.target.value })} className="rounded-xl" /></div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl"><Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader><CardTitle>Paramètres de facturation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Préfixe facture</Label><Input value={settings?.invoicePrefix || 'FAC'} onChange={(e) => setSettings({ ...settings!, invoicePrefix: e.target.value })} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Préfixe achat</Label><Input value={settings?.purchasePrefix || 'ACH'} onChange={(e) => setSettings({ ...settings!, purchasePrefix: e.target.value })} className="rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Taux TVA (%)</Label><Input type="number" value={settings?.taxRate || 20} onChange={(e) => setSettings({ ...settings!, taxRate: parseFloat(e.target.value) })} className="rounded-xl" /></div>
                <div className="space-y-2 pt-6"><div className="flex items-center gap-2"><Switch checked={settings?.taxEnabled || false} onCheckedChange={(v) => setSettings({ ...settings!, taxEnabled: v })} /><Label>TVA activée</Label></div></div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl"><Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="backup">
          <div className="space-y-4">
            {/* Export Excel */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5" />Export Excel</CardTitle>
                <CardDescription>Exportez vos données en format Excel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button onClick={() => window.location.href = '/api/export?type=all'} className="rounded-xl h-20 flex-col bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <FileText className="w-6 h-6 mb-1" />
                    <span className="text-sm">Tout exporter</span>
                  </Button>
                  <Button onClick={() => window.location.href = '/api/export?type=products'} variant="outline" className="rounded-xl h-20 flex-col">
                    <Package className="w-6 h-6 mb-1" />
                    <span className="text-sm">Produits</span>
                  </Button>
                  <Button onClick={() => window.location.href = '/api/export?type=sales'} variant="outline" className="rounded-xl h-20 flex-col">
                    <TrendingUp className="w-6 h-6 mb-1" />
                    <span className="text-sm">Ventes</span>
                  </Button>
                  <Button onClick={() => window.location.href = '/api/export?type=stock'} variant="outline" className="rounded-xl h-20 flex-col">
                    <Box className="w-6 h-6 mb-1" />
                    <span className="text-sm">Stock</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button onClick={() => window.location.href = '/api/export?type=clients'} variant="outline" className="rounded-xl h-16 flex-col">
                    <Users className="w-5 h-5 mb-1" />
                    <span className="text-sm">Clients</span>
                  </Button>
                  <Button onClick={() => window.location.href = '/api/export?type=suppliers'} variant="outline" className="rounded-xl h-16 flex-col">
                    <Building className="w-5 h-5 mb-1" />
                    <span className="text-sm">Fournisseurs</span>
                  </Button>
                  <Button onClick={() => window.location.href = '/api/export?type=purchases'} variant="outline" className="rounded-xl h-16 flex-col">
                    <Truck className="w-5 h-5 mb-1" />
                    <span className="text-sm">Achats</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Database Backup */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Sauvegarde de la base de données</CardTitle>
                <CardDescription>Sauvegardez et restaurez votre base de données SQLite</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>Les sauvegardes contiennent toutes vos données. Pensez à les exporter régulièrement sur un support externe.</AlertDescription>
                </Alert>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleBackup} className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Download className="w-4 h-4 mr-2" />Créer une sauvegarde
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/api/backup?download=latest'} className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" />Télécharger la dernière
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backup List */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Historique des sauvegardes</CardTitle>
              </CardHeader>
              <CardContent>
                <BackupList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== MAIN APP ====================
export default function App() {
  const { user, isAuthenticated, loading, login, logout, checkAuth } = useAuthStore()
  const { currentPage, setCurrentPage } = useUIStore()
  const { setSettings } = useSettingsStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    checkAuth()
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(console.error)
  }, [checkAuth, setSettings])

  // Show loading state during hydration to prevent flash
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg animate-pulse">
            <img src="/logo.jpeg" alt="Jooman" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <LoginPage onLogin={login} />

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
      <HeaderNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <AnimatePresence mode="wait">
        <motion.main key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {renderPage()}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
