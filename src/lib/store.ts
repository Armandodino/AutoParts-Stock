/**
 * ============================================================================
 * GESTION DE L'ÉTAT DE L'APPLICATION (STATE MANAGEMENT)
 * ============================================================================
 * 
 * Ce fichier définit tous les types de données et les stores (magasins d'état)
 * utilisés dans l'application. On utilise Zustand pour gérer l'état car c'est
 * simple et performant.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// DÉFINITION DES TYPES DE DONNÉES
// ============================================================================

/**
 * Représente un utilisateur de l'application
 */
export interface User {
  id: string
  email: string
  username: string
  name: string | null
  role: 'admin' | 'manager' | 'cashier'
  avatar: string | null
  isActive: boolean
}

/**
 * Représente un produit / pièce automobile
 */
export interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  description: string | null
  categoryId: string | null
  category: Category | null
  unitId: string | null
  unit: Unit | null
  purchasePrice: number
  sellingPrice: number
  stock: number
  minStock: number
  maxStock: number | null
  image: string | null
  isActive: boolean
  expiryDate: string | null
  // Champs spécifiques aux pièces auto
  oemNumber: string | null        // Numéro OEM principal
  oemNumbers: string | null       // Autres numéros OEM compatibles
  brand: string | null            // Marque de la pièce (Bosch, Brembo, etc.)
  compatibility: string | null    // Véhicules compatibles
  warrantyMonths: number | null   // Durée de garantie en mois
  weight: number | null           // Poids en kg
  location: string | null         // Emplacement dans le magasin
}

/**
 * Catégorie de produit
 */
export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
}

/**
 * Unité de mesure
 */
export interface Unit {
  id: string
  name: string
  abbreviation: string
}

/**
 * Client de l'entreprise
 */
export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
}

/**
 * Fournisseur
 */
export interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
}

/**
 * Article dans une vente
 */
export interface SaleItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

/**
 * Vente
 */
export interface Sale {
  id: string
  invoiceNumber: string
  clientId: string | null
  client: Client | null
  userId: string
  user: User
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer'
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded'
  notes: string | null
  items: SaleItem[]
  createdAt: string
}

/**
 * Article dans un achat
 */
export interface PurchaseItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

/**
 * Achat auprès d'un fournisseur
 */
export interface Purchase {
  id: string
  purchaseNumber: string
  supplierId: string | null
  supplier: Supplier | null
  userId: string
  user: User
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'received' | 'cancelled'
  paymentStatus: 'paid' | 'pending' | 'partial'
  notes: string | null
  items: PurchaseItem[]
  createdAt: string
}

/**
 * Mouvement de stock
 */
export interface StockMovement {
  id: string
  productId: string
  product: Product
  type: 'entry' | 'exit' | 'adjustment' | 'transfer'
  quantity: number
  reason: string | null
  reference: string | null
  userId: string | null
  user: User | null
  createdAt: string
}

/**
 * Paramètres de l'application
 */
export interface Settings {
  id: string
  companyName: string
  companyLogo: string | null
  companyAddress: string | null
  companyPhone: string | null
  companyEmail: string | null
  currency: string
  currencySymbol: string
  taxRate: number
  taxEnabled: boolean
  language: string
  theme: string
  invoicePrefix: string
  purchasePrefix: string
  licenseKey: string | null
  licenseValid: boolean
  licenseExpiry: string | null
  demoMode: boolean
}

/**
 * Notification système
 */
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
}

// ============================================================================
// STORE D'AUTHENTIFICATION
// ============================================================================

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

/**
 * Store pour gérer l'authentification de l'utilisateur
 * Stocke les informations de l'utilisateur connecté
 */
export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: true,
    
    // Connexion de l'utilisateur
    login: (user) => set({ user, isAuthenticated: true, loading: false }),
    
    // Déconnexion
    logout: async () => {
      try {
        await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
      } catch (e) {
        console.error('Erreur lors de la déconnexion:', e)
      }
      set({ user: null, isAuthenticated: false, loading: false })
    },
    
    // Vérifier si l'utilisateur est connecté
    checkAuth: async () => {
      try {
        const res = await fetch('/api/auth', { 
          credentials: 'include',
          cache: 'no-store'
        })
        const data = await res.json()
        if (data.authenticated && data.user) {
          set({ user: data.user, isAuthenticated: true, loading: false })
        } else {
          set({ user: null, isAuthenticated: false, loading: false })
        }
      } catch (e) {
        console.error('Erreur de vérification auth:', e)
        set({ user: null, isAuthenticated: false, loading: false })
      }
    }
  })
)

// ============================================================================
// STORE DES PARAMÈTRES
// ============================================================================

interface SettingsState {
  settings: Settings | null
  setSettings: (settings: Settings) => void
  updateSettings: (updates: Partial<Settings>) => void
}

/**
 * Store pour les paramètres de l'application
 * Les paramètres sont sauvegardés dans le localStorage
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: null,
      setSettings: (settings) => set({ settings }),
      updateSettings: (updates) => set((state) => ({
        settings: state.settings ? { ...state.settings, ...updates } : null
      })),
    }),
    {
      name: 'settings-storage',
    }
  )
)

// ============================================================================
// STORE DU PANIER (pour le POS)
// ============================================================================

interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  client: Client | null
  discount: number
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer'
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setClient: (client: Client | null) => void
  setDiscount: (discount: number) => void
  setPaymentMethod: (method: 'cash' | 'card' | 'check' | 'transfer') => void
  clearCart: () => void
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

/**
 * Store pour gérer le panier de vente
 * Utilisé dans la page Point de Vente (POS)
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      client: null,
      discount: 0,
      paymentMethod: 'cash',
      
      // Ajouter un article au panier
      addItem: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find(item => item.product.id === product.id)
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        }
        return { items: [...state.items, { product, quantity }] }
      }),
      
      // Retirer un article du panier
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      
      // Modifier la quantité d'un article
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.product.id !== productId) }
        }
        return {
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        }
      }),
      
      // Définir le client
      setClient: (client) => set({ client }),
      
      // Définir la remise
      setDiscount: (discount) => set({ discount }),
      
      // Définir le mode de paiement
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      
      // Vider le panier
      clearCart: () => set({ items: [], client: null, discount: 0 }),
      
      // Calculer le sous-total
      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
      },
      
      // Calculer la TVA
      getTax: () => {
        const state = get()
        const settings = useSettingsStore.getState().settings
        if (!settings?.taxEnabled) return 0
        const subtotal = state.getSubtotal()
        return subtotal * (settings.taxRate / 100)
      },
      
      // Calculer le total
      getTotal: () => {
        const state = get()
        return state.getSubtotal() + state.getTax() - state.discount
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

// ============================================================================
// STORE DE L'INTERFACE UTILISATEUR
// ============================================================================

interface UIState {
  currentPage: string
  sidebarOpen: boolean
  setCurrentPage: (page: string) => void
  toggleSidebar: () => void
}

/**
 * Store pour gérer l'état de l'interface
 * (page courante, sidebar, etc.)
 */
export const useUIStore = create<UIState>()((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
