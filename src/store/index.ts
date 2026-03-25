import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  Part, 
  Category, 
  Movement, 
  Alert, 
  AppSettings, 
  DashboardStats,
  PartFilters,
  MovementFilters
} from '@/types';

// Auth Store
interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  loginTime: Date | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      loginTime: null,
      login: (user) => set({ isAuthenticated: true, user, loginTime: new Date() }),
      logout: () => set({ isAuthenticated: false, user: null, loginTime: null }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      }))
    }),
    { name: 'autoparts-auth' }
  )
);

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  currentPage: string;
  notifications: Notification[];
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen: true,
  currentPage: 'dashboard',
  notifications: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentPage: (page) => set({ currentPage: page }),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now().toString() }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] })
}));

// Parts Store
interface PartsStore {
  parts: Part[];
  filters: PartFilters;
  selectedPart: Part | null;
  isLoading: boolean;
  setParts: (parts: Part[]) => void;
  addPart: (part: Part) => void;
  updatePart: (id: string, part: Partial<Part>) => void;
  deletePart: (id: string) => void;
  setFilters: (filters: Partial<PartFilters>) => void;
  setSelectedPart: (part: Part | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePartsStore = create<PartsStore>()((set) => ({
  parts: [],
  filters: {},
  selectedPart: null,
  isLoading: false,
  setParts: (parts) => set({ parts }),
  addPart: (part) => set((state) => ({ parts: [...state.parts, part] })),
  updatePart: (id, partData) => set((state) => ({
    parts: state.parts.map((p) => (p.id === id ? { ...p, ...partData } : p))
  })),
  deletePart: (id) => set((state) => ({
    parts: state.parts.filter((p) => p.id !== id)
  })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedPart: (part) => set({ selectedPart: part }),
  setLoading: (loading) => set({ isLoading: loading })
}));

// Categories Store
interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useCategoriesStore = create<CategoriesStore>()((set) => ({
  categories: [],
  isLoading: false,
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category] 
  })),
  updateCategory: (id, categoryData) => set((state) => ({
    categories: state.categories.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id)
  })),
  setLoading: (loading) => set({ isLoading: loading })
}));

// Movements Store
interface MovementsStore {
  movements: Movement[];
  filters: MovementFilters;
  isLoading: boolean;
  setMovements: (movements: Movement[]) => void;
  addMovement: (movement: Movement) => void;
  setFilters: (filters: Partial<MovementFilters>) => void;
  setLoading: (loading: boolean) => void;
}

export const useMovementsStore = create<MovementsStore>()((set) => ({
  movements: [],
  filters: {},
  isLoading: false,
  setMovements: (movements) => set({ movements }),
  addMovement: (movement) => set((state) => ({ 
    movements: [movement, ...state.movements] 
  })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (loading) => set({ isLoading: loading })
}));

// Alerts Store
interface AlertsStore {
  alerts: Alert[];
  unreadCount: number;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  resolveAlert: (id: string) => void;
}

export const useAlertsStore = create<AlertsStore>()((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) => set({ 
    alerts, 
    unreadCount: alerts.filter((a) => !a.isRead).length 
  }),
  addAlert: (alert) => set((state) => ({ 
    alerts: [alert, ...state.alerts],
    unreadCount: state.unreadCount + 1
  })),
  markAsRead: (id) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllAsRead: () => set((state) => ({
    alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
    unreadCount: 0
  })),
  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map((a) => 
      a.id === id ? { ...a, isRead: true, isResolved: true, resolvedAt: new Date() } : a
    )
  }))
}));

// Settings Store
interface SettingsStore {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  companyName: 'AutoParts Stock',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  defaultMinStock: 5,
  autoBackup: true,
  backupInterval: 24,
  syncEnabled: false,
  syncUrl: '',
  syncInterval: 30,
  currency: 'XOF'
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      }))
    }),
    { name: 'autoparts-settings' }
  )
);

// Dashboard Store
interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  lastUpdate: Date | null;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  stats: null,
  isLoading: false,
  lastUpdate: null,
  setStats: (stats) => set({ stats, lastUpdate: new Date() }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLastUpdate: (date) => set({ lastUpdate: date })
}));

// Sync Store
interface SyncStore {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingCount: number;
  errorCount: number;
  syncLog: SyncLogEntry[];
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (date: Date | null) => void;
  setPendingCount: (count: number) => void;
  setErrorCount: (count: number) => void;
  addSyncLog: (entry: SyncLogEntry) => void;
}

interface SyncLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  status: 'success' | 'error' | 'partial';
  message: string;
  recordsSynced?: number;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,
      lastSyncAt: null,
      pendingCount: 0,
      errorCount: 0,
      syncLog: [],
      setOnline: (online) => set({ isOnline: online }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      setLastSyncAt: (date) => set({ lastSyncAt: date }),
      setPendingCount: (count) => set({ pendingCount: count }),
      setErrorCount: (count) => set({ errorCount: count }),
      addSyncLog: (entry) => set((state) => ({
        syncLog: [entry, ...state.syncLog].slice(0, 100) // Keep last 100 entries
      }))
    }),
    { name: 'autoparts-sync' }
  )
);
