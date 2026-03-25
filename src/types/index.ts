// Types pour l'application AutoParts Stock Management

export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUST' | 'RETURN';
export type UserRole = 'admin' | 'manager' | 'user';
export type SyncStatus = 'synced' | 'pending' | 'error' | 'conflict';
export type AlertType = 'low_stock' | 'out_of_stock' | 'sync_error' | 'backup_failed' | 'system';

// Part (Pièce automobile)
export interface Part {
  id: string;
  name: string;
  reference: string;
  description?: string | null;
  categoryId: string;
  category?: Category;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  location?: string | null;
  imageUrl?: string | null;
  barcode?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncAt?: Date | null;
}

// Category (Catégorie)
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  parts?: Part[];
}

// Movement (Mouvement de stock)
export interface Movement {
  id: string;
  partId: string;
  part?: Part;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  unitPrice: number;
  totalPrice: number;
  supplier?: string | null;
  customer?: string | null;
  invoiceRef?: string | null;
  notes?: string | null;
  userId?: string | null;
  createdAt: Date;
  syncStatus: SyncStatus;
  lastSyncAt?: Date | null;
}

// User (Utilisateur)
export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncAt?: Date | null;
}

// Alert (Alerte)
export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  partId?: string | null;
  part?: Part | null;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date | null;
}

// Setting (Paramètre)
export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: Date;
}

// Backup (Sauvegarde)
export interface Backup {
  id: string;
  filename: string;
  filepath: string;
  size: number;
  type: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
  createdAt: Date;
}

// Sync Queue Item
export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: string;
  attempts: number;
  maxAttempts: number;
  status: SyncStatus;
  error?: string | null;
  createdAt: Date;
  processedAt?: Date | null;
}

// Dashboard Stats
export interface DashboardStats {
  totalParts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayMovements: number;
  todayRevenue: number;
  monthlyRevenue: number;
  categoryStats: CategoryStat[];
  recentMovements: Movement[];
  alerts: Alert[];
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  partCount: number;
  totalValue: number;
}

// Chart Data
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

// Form Types
export interface PartFormData {
  name: string;
  reference: string;
  description?: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  location?: string;
  barcode?: string;
  imageUrl?: string;
}

export interface MovementFormData {
  partId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  unitPrice: number;
  supplier?: string;
  customer?: string;
  invoiceRef?: string;
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface PartFilters {
  search?: string;
  categoryId?: string;
  minStock?: boolean;
  outOfStock?: boolean;
  isActive?: boolean;
}

export interface MovementFilters {
  partId?: string;
  type?: MovementType;
  startDate?: Date;
  endDate?: Date;
  supplier?: string;
  customer?: string;
}

// Settings
export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultMinStock: number;
  autoBackup: boolean;
  backupInterval: number; // en heures
  syncEnabled: boolean;
  syncUrl?: string;
  syncInterval: number; // en minutes
  currency: string;
}

// Auth
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loginTime: Date | null;
}
