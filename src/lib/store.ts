import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  username: string
  name: string | null
  role: 'admin' | 'manager' | 'cashier'
  avatar: string | null
  isActive: boolean
}

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
  // Champs pièces automobiles
  oemNumber: string | null
  oemNumbers: string | null
  brand: string | null
  compatibility: string | null
  warrantyMonths: number | null
  weight: number | null
  location: string | null
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
}

export interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
}

export interface SaleItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

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

export interface PurchaseItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

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

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
}

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: true,
    login: (user) => set({ user, isAuthenticated: true, loading: false }),
    logout: async () => {
      try {
        await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
      } catch (e) {
        console.error('Logout error:', e)
      }
      set({ user: null, isAuthenticated: false, loading: false })
    },
    checkAuth: async () => {
      try {
        const res = await fetch('/api/auth', { 
          credentials: 'include', // Important for cookies
          cache: 'no-store'
        })
        const data = await res.json()
        if (data.authenticated && data.user) {
          set({ user: data.user, isAuthenticated: true, loading: false })
        } else {
          set({ user: null, isAuthenticated: false, loading: false })
        }
      } catch (e) {
        console.error('Auth check error:', e)
        set({ user: null, isAuthenticated: false, loading: false })
      }
    }
  })
)

// Settings Store
interface SettingsState {
  settings: Settings | null
  setSettings: (settings: Settings) => void
  updateSettings: (updates: Partial<Settings>) => void
}

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

// Cart Store (for POS)
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      client: null,
      discount: 0,
      paymentMethod: 'cash',
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
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
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
      setClient: (client) => set({ client }),
      setDiscount: (discount) => set({ discount }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      clearCart: () => set({ items: [], client: null, discount: 0 }),
      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
      },
      getTax: () => {
        const state = get()
        const settings = useSettingsStore.getState().settings
        if (!settings?.taxEnabled) return 0
        const subtotal = state.getSubtotal()
        return subtotal * (settings.taxRate / 100)
      },
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

// UI Store
interface UIState {
  currentPage: string
  sidebarOpen: boolean
  setCurrentPage: (page: string) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
